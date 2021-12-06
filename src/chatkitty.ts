import { Subject } from 'rxjs';

import ChatKittyBase, {
  Channel,
  ChatKittyFailedResult,
  ChatKittyObserver,
  ChatKittyPaginator,
  ChatKittyUnsubscribe,
  ChatKittyUserReference,
  failed,
  NoActiveSessionError,
  succeeded,
  User,
} from 'chatkitty';

import StompX from 'chatkitty/dist/cjs/stompx';

import {
  mediaDevices,
  MediaStream,
  MediaStreamConstraints,
  RTCIceCandidateType,
  RTCOfferOptions,
  RTCPeerConnection,
  RTCPeerConnectionConfiguration,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';
import {
  AcceptCallRequest,
  AcceptCallResult,
  AcceptedCallResult,
  Call,
  GetCallResult,
  GetCallsRequest,
  GetCallsResult,
  GetCallsSucceededResult,
  GetCallSucceededResult,
  RejectCallRequest,
  RejectCallResult,
  RejectedCallResult,
  StartCallRequest,
  StartCallResult,
  StartedCallResult,
} from './call';
import {
  AnswerOfferCallSignal,
  CallSignal,
  CreateCallSignalRequest,
  CreateOfferCallSignal,
  DisconnectPeerCallSignal,
  isAddCandidateCallSignal,
  isAnswerOfferCallSignal,
  isCreateOfferCallSignal,
  isDisconnectPeerCallSignal,
  isSendDescriptionCallSignal,
} from './call-signal';

export class ChatKitty extends ChatKittyBase {
  protected static readonly _instances = new Map<string, ChatKitty>();

  public static getInstance(apiKey: string): ChatKitty {
    let instance = ChatKitty._instances.get(apiKey);

    if (instance !== undefined) {
      return instance;
    }

    instance = new ChatKitty({ apiKey: apiKey });

    ChatKitty._instances.set(apiKey, instance);

    return instance;
  }

  public Calls: Calls = new (class ChatKittyCalls {
    private static callRelay(id: number): string {
      return '/application/v1/calls/' + id + '.relay';
    }

    public localStream: MediaStream | null = null;

    public activeCall: Call | null = null;

    public isMuted: boolean = false;

    private readonly callActiveSubject = new Subject<Call>();

    private readonly participantAcceptedCallSubject = new Subject<User>();
    private readonly participantRejectedCallSubject = new Subject<User>();
    private readonly participantActiveSubject = new Subject<{
      user: User;
      stream: MediaStream;
    }>();
    private readonly participantLeftCallSubject = new Subject<User>();

    private readonly callEndedSubject = new Subject<Call>();

    private endCallUnsubscribe?: ChatKittyUnsubscribe;

    constructor(private readonly kitty: ChatKitty) {}

    public async initialize(configuration: {
      media: { audio: boolean; video: boolean };
    }) {
      const isFrontCamera = true;
      const devices = await mediaDevices.enumerateDevices();

      const facing = isFrontCamera ? 'front' : 'environment';
      const videoSourceId = devices.find(
        (device: any) =>
          device.kind === 'videoinput' && device.facing === facing
      );

      const facingMode = isFrontCamera ? 'user' : 'environment';
      const constraints: MediaStreamConstraints = {
        audio: configuration.media.audio,
        video: configuration.media.video && {
          mandatory: {
            minWidth: 1280,
            minHeight: 720,
            minFrameRate: 30,
          },
          facingMode,
          optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
        },
      };

      this.localStream = (await mediaDevices.getUserMedia(
        constraints
      )) as MediaStream;
    }

    public startCall(request: StartCallRequest): Promise<StartCallResult> {
      return new Promise(async (resolve) => {
        const type = (request as { type: string }).type;

        let channel: Channel = (request as { channel: Channel }).channel;

        if (!channel) {
          const members = (request as { members: ChatKittyUserReference[] })
            .members;

          const result = await this.kitty.createChannel({
            type: 'DIRECT',
            members,
          });

          if (succeeded(result)) {
            channel = result.channel;
          }

          if (failed(result)) {
            resolve(result);
          }
        }

        this.kitty.stompX.sendAction<Call>({
          destination: channel._actions.call,
          body: {
            type,
            properties: request.properties,
          },
          onSuccess: (call) => {
            this.startCallSession(call).then(() =>
              resolve(new StartedCallResult(call))
            );
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      });
    }

    public acceptCall(request: AcceptCallRequest): Promise<AcceptCallResult> {
      return new Promise((resolve) => {
        this.startCallSession(request.call).then(() => {
          resolve(new AcceptedCallResult(request.call));
        });
      });
    }

    public rejectCall(request: RejectCallRequest): Promise<RejectCallResult> {
      return new Promise((resolve) => {
        this.kitty.stompX.sendAction<never>({
          destination: request.call._actions.reject,
          body: {},
          onSuccess: (call) => {
            resolve(new RejectedCallResult(call));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      });
    }

    public leaveCall() {
      this.endCallUnsubscribe?.();
    }

    switchCamera = () => {
      if (this.localStream) {
        this.localStream
          .getVideoTracks()
          // @ts-ignore
          .forEach((track) => track._switchCamera());
      }
    };

    toggleMute = () => {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;

          this.isMuted = track.enabled;
        });
      }
    };

    public getCalls(request: GetCallsRequest): Promise<GetCallsResult> {
      const parameters: { active?: boolean } = {};

      const active = request?.filter?.active;

      if (active) {
        parameters.active = active;
      }

      return new Promise((resolve) => {
        ChatKittyPaginator.createInstance<Call>({
          stompX: this.kitty.stompX,
          relay: request.channel._relays.calls,
          contentName: 'calls',
          parameters: parameters,
        })
          .then((paginator) => resolve(new GetCallsSucceededResult(paginator)))
          .catch((error) => resolve(new ChatKittyFailedResult(error)));
      });
    }

    public getCall(id: number): Promise<GetCallResult> {
      return new Promise((resolve) => {
        this.kitty.stompX.relayResource<Call>({
          destination: ChatKittyCalls.callRelay(id),
          onSuccess: (call) => {
            resolve(new GetCallSucceededResult(call));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      });
    }

    public onCallInvite(
      onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
    ): ChatKittyUnsubscribe {
      const user = this.kitty.currentUserSubject.value;

      if (!user) {
        throw new NoActiveSessionError();
      }

      const unsubscribe = this.kitty.stompX.listenForEvent<Call>({
        topic: user._topics.calls,
        event: 'me.call.invited',
        onSuccess: (call) => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(call);
          } else {
            onNextOrObserver.onNext(call);
          }
        },
      });

      return () => unsubscribe;
    }

    public onCallActive(
      onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.callActiveSubject.subscribe((call) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(call);
        } else {
          onNextOrObserver.onNext(call);
        }
      });

      return () => subscription.unsubscribe();
    }

    public onParticipantAcceptedCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.participantAcceptedCallSubject.subscribe(
        (user) => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(user);
          } else {
            onNextOrObserver.onNext(user);
          }
        }
      );

      return () => subscription.unsubscribe();
    }

    public onParticipantRejectedCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.participantRejectedCallSubject.subscribe(
        (user) => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(user);
          } else {
            onNextOrObserver.onNext(user);
          }
        }
      );

      return () => subscription.unsubscribe();
    }

    public onParticipantActive(
      onNextOrObserver:
        | ChatKittyObserver<{ user: User; stream: MediaStream }>
        | ((user: User, stream: MediaStream) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.participantActiveSubject.subscribe((event) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(event.user, event.stream);
        } else {
          onNextOrObserver.onNext(event);
        }
      });

      return () => subscription.unsubscribe();
    }

    public onParticipantLeftCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.participantLeftCallSubject.subscribe((user) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(user);
        } else {
          onNextOrObserver.onNext(user);
        }
      });

      return () => subscription.unsubscribe();
    }

    public onCallEnded(
      onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.callEndedSubject.subscribe((call) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(call);
        } else {
          onNextOrObserver.onNext(call);
        }
      });

      return () => subscription.unsubscribe();
    }

    public close() {
      this.endCallUnsubscribe?.();
    }

    private startCallSession(call: Call): Promise<void> {
      return new Promise((resolve) => {
        let participantAcceptedCallUnsubscribe: () => void;
        let participantRejectedCallUnsubscribe: () => void;
        let participantLeftCallUnsubscribe: () => void;

        participantAcceptedCallUnsubscribe =
          this.kitty.stompX.listenForEvent<User>({
            topic: call._topics.participants,
            event: 'call.participant.accepted',
            onSuccess: (user) => {
              this.participantAcceptedCallSubject.next(user);
            },
          });

        participantRejectedCallUnsubscribe =
          this.kitty.stompX.listenForEvent<User>({
            topic: call._topics.participants,
            event: 'call.participant.rejected',
            onSuccess: (user) => {
              this.participantRejectedCallSubject.next(user);
            },
          });

        participantLeftCallUnsubscribe = this.kitty.stompX.listenForEvent<User>(
          {
            topic: call._topics.participants,
            event: 'call.participant.left',
            onSuccess: (user) => {
              this.participantLeftCallSubject.next(user);
            },
          }
        );

        const signalSubject: Subject<CallSignal> = new Subject<CallSignal>();

        const signalDispatcher = new CallSignalDispatcher(
          this.kitty.stompX,
          call
        );

        const receivedCallSignalUnsubscribe =
          this.kitty.stompX.listenForEvent<CallSignal>({
            topic: call._topics.signals,
            event: 'call.signal.created',
            onSuccess: (signal) => {
              signalSubject.next(signal);
            },
          });

        let end = () => {
          participantLeftCallUnsubscribe?.();
          participantRejectedCallUnsubscribe?.();
          participantAcceptedCallUnsubscribe?.();

          receivedCallSignalUnsubscribe();

          signalsSubscription.unsubscribe();
        };

        const connections: Map<number, Connection> = new Map();

        const endedCallUnsubscribe = this.kitty.stompX.listenForEvent<Call>({
          topic: call._topics.self,
          event: 'call.self.ended',
          onSuccess: () => {
            end();

            connections.forEach((connection) => connection.close());

            connections.clear();

            this.callEndedSubject.next();
          },
        });

        const onCreateOffer = async (
          signal: CreateOfferCallSignal
        ): Promise<void> => {
          const peer = signal.peer;

          if (connections.has(peer.id)) {
            return;
          }

          const connection: Connection = new P2PConnection(
            peer,
            <MediaStream>this.localStream,
            signalDispatcher,
            (user: User, stream: MediaStream) =>
              this.participantActiveSubject.next({ user, stream })
          );

          await connection.createOffer();

          connections.set(peer.id, connection);
        };

        const onAnswerOffer = (signal: AnswerOfferCallSignal): void => {
          const peer = signal.peer;

          if (connections.has(peer.id)) {
            return;
          }

          const connection = new P2PConnection(
            peer,
            <MediaStream>this.localStream,
            signalDispatcher,
            (user: User, stream: MediaStream) =>
              this.participantActiveSubject.next({ user, stream })
          );

          connections.set(peer.id, connection);
        };

        const onDisconnect = (signal: DisconnectPeerCallSignal): void => {
          const connection = connections.get(signal.peer.id);

          if (connection) {
            connection.close();
          }
        };

        const signalsSubscription = signalSubject.subscribe({
          next: async (signal) => {
            try {
              if (isCreateOfferCallSignal(signal)) {
                await onCreateOffer(signal);
              }

              if (isAnswerOfferCallSignal(signal)) {
                await onAnswerOffer(signal);
              }

              if (isAddCandidateCallSignal(signal)) {
                const connection = connections.get(signal.peer.id);

                if (connection) {
                  await connection.addCandidate(signal.payload);
                }
              }

              if (isSendDescriptionCallSignal(signal)) {
                const connection = connections.get(signal.peer.id);

                if (connection) {
                  await connection.answerOffer(signal.payload);
                }
              }

              if (isDisconnectPeerCallSignal(signal)) {
                await onDisconnect(signal);
              }
            } catch (e) {
              console.log(e);
            }
          },
        });

        const callUnsubscribe = this.kitty.stompX.listenToTopic({
          topic: call._topics.self,
          onSuccess: () => {
            const participantsUnsubscribe = this.kitty.stompX.listenToTopic({
              topic: call._topics.participants,
            });

            const signalsUnsubscribe = this.kitty.stompX.listenToTopic({
              topic: call._topics.signals,
            });

            const superEnd = end;

            end = () => {
              superEnd();

              participantsUnsubscribe();
              signalsUnsubscribe();
              endedCallUnsubscribe();

              callUnsubscribe();
            };

            this.kitty.stompX.sendAction<never>({
              destination: call._actions.ready,
              body: {},
              onSent: () => {
                this.activeCall = call;

                this.endCallUnsubscribe = () => {
                  end();

                  this.activeCall = null;
                  this.endCallUnsubscribe = undefined;
                };

                this.callActiveSubject.next();

                resolve();
              },
            });
          },
        });
      });
    }
  })(this);
}

interface Calls {
  localStream: MediaStream | null;

  activeCall: Call | null;

  isMuted: boolean;

  initialize(configuration: {
    media: { audio: boolean; video: boolean };
  }): void;

  startCall(request: StartCallRequest): Promise<StartCallResult>;
  acceptCall(request: AcceptCallRequest): Promise<AcceptCallResult>;
  rejectCall(request: RejectCallRequest): Promise<RejectCallResult>;
  leaveCall(): void;

  switchCamera(): void;
  toggleMute(): void;

  getCalls(request: GetCallsRequest): Promise<GetCallsResult>;
  getCall(id: number): Promise<GetCallResult>;

  onCallInvite(
    onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
  ): ChatKittyUnsubscribe;

  onCallActive(
    onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
  ): ChatKittyUnsubscribe;

  onParticipantAcceptedCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  onParticipantRejectedCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  onParticipantActive(
    onNextOrObserver:
      | ChatKittyObserver<{ user: User; stream: MediaStream }>
      | ((user: User, stream: MediaStream) => void)
  ): ChatKittyUnsubscribe;

  onParticipantLeftCall(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe;

  onCallEnded(
    onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
  ): ChatKittyUnsubscribe;

  close(): void;
}

interface Connection {
  createOffer(): Promise<void>;
  answerOffer(description: RTCSessionDescriptionType): Promise<void>;
  addCandidate(candidate: RTCIceCandidateType): Promise<void>;
  close(): void;
}

class P2PConnection implements Connection {
  private static readonly rtcConfiguration: RTCPeerConnectionConfiguration = {
    iceServers: [
      {
        urls: ['turn:34.231.248.98:3478'],
        username: 'chatkitty',
        credential: '5WEDIcZHUxhlUlsdQcqj',
      },
      {
        urls: ['stun:stun2.1.google.com:19302'],
      },
    ],
  };

  private readonly offerAnswerOptions: RTCOfferOptions;

  private rtcPeerConnection: RTCPeerConnection;

  constructor(
    private readonly peer: User,
    private readonly stream: MediaStream,
    private readonly signalDispatcher: CallSignalDispatcher,
    private readonly onParticipantActive?: (
      user: User,
      stream: MediaStream
    ) => void
  ) {
    this.offerAnswerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };

    this.rtcPeerConnection = new RTCPeerConnection(
      P2PConnection.rtcConfiguration
    );

    this.rtcPeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalDispatcher.dispatch({
          type: 'ADD_CANDIDATE',
          peer: { id: peer.id },
          payload: event.candidate,
        });
      }
    };

    this.rtcPeerConnection.onaddstream = (event) => {
      this.onParticipantActive?.(peer, event.stream);
    };

    this.rtcPeerConnection.onconnectionstatechange = () => {
      switch (this.rtcPeerConnection.connectionState) {
        case 'connected':
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          // TODO end call session
          break;
      }
    };

    this.rtcPeerConnection.oniceconnectionstatechange = () => {
      switch (this.rtcPeerConnection.connectionState) {
        case 'disconnected':
        case 'failed':
        case 'closed':
          // TODO end call session
          break;
      }
    };

    this.rtcPeerConnection.addStream(this.stream);
  }

  createOffer = async () => {
    const description = await this.rtcPeerConnection.createOffer(
      this.offerAnswerOptions
    );

    await this.rtcPeerConnection.setLocalDescription(description);

    this.signalDispatcher.dispatch({
      type: 'SEND_DESCRIPTION',
      peer: this.peer,
      payload: description,
    });
  };

  answerOffer = async (description: RTCSessionDescriptionType) => {
    await this.rtcPeerConnection.setRemoteDescription(description);

    if (description.type === 'offer') {
      const answer = await this.rtcPeerConnection.createAnswer(
        this.offerAnswerOptions
      );

      await this.rtcPeerConnection.setLocalDescription(answer);

      this.signalDispatcher.dispatch({
        type: 'SEND_DESCRIPTION',
        peer: this.peer,
        payload: answer,
      });
    }
  };

  addCandidate = async (candidate: RTCIceCandidateType): Promise<void> => {
    await this.rtcPeerConnection.addIceCandidate(candidate);
  };

  close = (): void => {
    this.rtcPeerConnection.close();
  };
}

class CallSignalDispatcher {
  constructor(private stompX: StompX, private call: Call) {}

  dispatch = (request: CreateCallSignalRequest): void => {
    this.stompX.sendAction<never>({
      destination: this.call._actions.signal,
      body: request,
    });
  };
}

export default ChatKitty;
