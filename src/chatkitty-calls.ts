import {
  MediaStream,
  RTCIceCandidateType,
  RTCOfferOptions,
  RTCPeerConnection,
  RTCPeerConnectionConfiguration,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';
import RNCallKeep from 'react-native-callkeep';
import { BehaviorSubject, Subject } from 'rxjs';

import {
  Call,
  GetCallsRequest,
  GetCallsResult,
  GetCallsSucceededResult,
  RejectCallRequest,
  RejectCallResult,
  RejectedCallResult,
  StartCallRequest,
  StartCallResult,
  StartedCallResult,
} from './call';
import {
  StartCallSessionRequest,
  StartCallSessionResult,
  StartedCallSessionResult,
} from './call-session';
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
import { CurrentUser } from './current-user';
import { ChatKittyObserver, ChatKittyUnsubscribe } from './observer';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult } from './result';
import StompX from './stompx';
import { User } from './user';
import { NoActiveSessionError } from './user-session';
import { PermissionsAndroid } from 'react-native';

export class ChatKittyCalls {
  public constructor(
    private readonly stompX: StompX,
    private readonly currentUserSubject: BehaviorSubject<CurrentUser | null>
  ) {
    try {
      RNCallKeep.setup({
        ios: {
          appName: 'ChatKittyReactNativeDemo',
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription:
            'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          imageName: 'phone_account_icon',
          additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
          // Required to get audio in background when using Android 11
          foregroundService: {
            channelId: 'com.company.my',
            channelName: 'Foreground service for my app',
            notificationTitle: 'My app is running on background',
            notificationIcon: 'Path to the resource icon of the notification',
          },
        },
      }).then();
    } catch (err: unknown) {
      console.error('initializeCallKeep error:', err);
    }
  }

  public startCall(request: StartCallRequest): Promise<StartCallResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Call>({
        destination: request.channel._actions.call,
        body: {
          type: request.type,
          properties: request.properties,
        },
        onSuccess: (call) => {
          resolve(new StartedCallResult(call));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public startCallSession(
    request: StartCallSessionRequest
  ): StartCallSessionResult {
    const onParticipantAcceptedCall = request.onParticipantAcceptedCall;
    const onParticipantRejectedCall = request.onParticipantRejectedCall;
    const onParticipantEnteredCall = request.onParticipantEnteredCall;
    const onParticipantLeftCall = request.onParticipantLeftCall;

    let participantAcceptedCallUnsubscribe: () => void;
    let participantRejectedCallUnsubscribe: () => void;
    let participantEnteredCallUnsubscribe: () => void;
    let participantLeftCallUnsubscribe: () => void;

    if (onParticipantAcceptedCall) {
      participantAcceptedCallUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.call._topics.participants,
        event: 'call.participant.accepted',
        onSuccess: (user) => {
          onParticipantAcceptedCall(user);
        },
      });
    }

    if (onParticipantRejectedCall) {
      participantRejectedCallUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.call._topics.participants,
        event: 'call.participant.rejected',
        onSuccess: (user) => {
          onParticipantRejectedCall(user);
        },
      });
    }

    if (onParticipantEnteredCall) {
      participantEnteredCallUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.call._topics.participants,
        event: 'call.participant.entered',
        onSuccess: (user) => {
          onParticipantEnteredCall(user);
        },
      });
    }

    if (onParticipantLeftCall) {
      participantLeftCallUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.call._topics.participants,
        event: 'call.participant.left',
        onSuccess: (user) => {
          onParticipantLeftCall(user);
        },
      });
    }

    const signalSubject: Subject<CallSignal> = new Subject<CallSignal>();

    const signalDispatcher = new CallSignalDispatcher(
      this.stompX,
      request.call
    );

    const receivedCallSignalUnsubscribe =
      this.stompX.listenForEvent<CallSignal>({
        topic: request.call._topics.signals,
        event: 'call.signal.created',
        onSuccess: (signal) => {
          signalSubject.next(signal);
        },
      });

    let end = () => {
      console.log('end call!');

      participantLeftCallUnsubscribe?.();
      participantEnteredCallUnsubscribe?.();
      participantRejectedCallUnsubscribe?.();
      participantAcceptedCallUnsubscribe?.();

      receivedCallSignalUnsubscribe();

      signalsSubscription.unsubscribe();
    };

    const endedCallUnsubscribe = this.stompX.listenForEvent<Call>({
      topic: request.call._topics.self,
      event: 'call.self.ended',
      onSuccess: (call) => {
        end();

        request.onCallEnded?.(call);
      },
    });

    const connections: Map<number, Connection> = new Map();

    const onCreateOffer = async (
      signal: CreateOfferCallSignal
    ): Promise<void> => {
      const peer = signal.peer;

      if (connections.has(peer.id)) {
        return;
      }

      const connection: Connection = new P2PConnection(
        peer,
        request.stream,
        signalDispatcher,
        request.onParticipantAddedStream
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
        request.stream,
        signalDispatcher,
        request.onParticipantAddedStream
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
      next: (signal) => {
        if (isCreateOfferCallSignal(signal)) {
          onCreateOffer(signal).then();
        }

        if (isAnswerOfferCallSignal(signal)) {
          onAnswerOffer(signal);
        }

        if (isAddCandidateCallSignal(signal)) {
          const connection = connections.get(signal.peer.id);

          if (connection) {
            connection.addCandidate(signal.payload).then();
          }
        }

        if (isSendDescriptionCallSignal(signal)) {
          const connection = connections.get(signal.peer.id);

          if (connection) {
            connection.answerOffer(signal.payload).then();
          }
        }

        if (isDisconnectPeerCallSignal(signal)) {
          onDisconnect(signal);
        }
      },
    });

    const callUnsubscribe = this.stompX.listenToTopic({
      topic: request.call._topics.self,
      onSuccess: () => {
        const participantsUnsubscribe = this.stompX.listenToTopic({
          topic: request.call._topics.participants,
        });

        const signalsUnsubscribe = this.stompX.listenToTopic({
          topic: request.call._topics.signals,
        });

        const superEnd = end;

        end = () => {
          superEnd();

          participantsUnsubscribe();
          signalsUnsubscribe();
          endedCallUnsubscribe();

          callUnsubscribe();
        };

        this.stompX.sendAction<never>({
          destination: request.call._actions.ready,
          body: {},
        });
      },
    });

    const session = {
      call: request.call,
      stream: request.stream,
      end: () => end(),
    };

    return new StartedCallSessionResult(session);
  }

  public rejectCall(request: RejectCallRequest): Promise<RejectCallResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
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

  public getCalls(request: GetCallsRequest): Promise<GetCallsResult> {
    const parameters: { active?: boolean } = {};

    const active = request?.filter?.active;

    if (active) {
      parameters.active = active;
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Call>({
        stompX: this.stompX,
        relay: request.channel._relays.calls,
        contentName: 'calls',
        parameters: parameters,
      })
        .then((paginator) => resolve(new GetCallsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public onCallInvite(
    onNextOrObserver: ChatKittyObserver<Call> | ((call: Call) => void)
  ): ChatKittyUnsubscribe {
    const user = this.currentUserSubject.value;

    if (!user) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Call>({
      topic: user._topics.calls,
      event: 'me.call.invited',
      onSuccess: (chat) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(chat);
        } else {
          onNextOrObserver.onNext(chat);
        }
      },
    });

    return () => unsubscribe;
  }
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
    private readonly onParticipantAddedStream?: (
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
      this.onParticipantAddedStream?.(peer, event.stream);
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

export default ChatKittyCalls;
