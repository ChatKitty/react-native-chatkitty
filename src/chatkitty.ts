import { BehaviorSubject, Subject } from 'rxjs';

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
  DeclineCallRequest,
  DeclineCallResult,
  DeclinedCallResult,
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
import StompX from './stompx';
import { ChatKittyObserver, ChatKittyUnsubscribe } from './observer';
import {
  CurrentUser,
  GetCurrentUserResult,
  GetCurrentUserSuccessfulResult,
  UpdateCurrentUserDisplayPictureRequest,
  UpdateCurrentUserDisplayPictureResult,
  UpdateCurrentUserResult,
  UpdatedCurrentUserDisplayPictureResult,
  UpdatedCurrentUserResult,
} from './current-user';
import {
  DeleteMessageForMeRequest,
  DeleteMessageForMeResult,
  DeleteMessageForMeSucceededResult,
  DeleteMessageRequest,
  DeleteMessageResult,
  DeleteMessageSucceededResult,
  EditedMessageSucceededResult,
  EditMessageRequest,
  EditMessageResult,
  FileUserMessage,
  GetChannelMessagesRequest,
  GetLastReadMessageRequest,
  GetLastReadMessageResult,
  GetMessageChannelRequest,
  GetMessageChannelResult,
  GetMessageChannelSucceededResult,
  GetMessageParentRequest,
  GetMessageParentResult,
  GetMessageParentSucceededResult,
  GetMessageRepliesCountRequest,
  GetMessageRepliesRequest,
  GetMessagesRequest,
  GetMessagesResult,
  GetMessagesSucceededResult,
  GetUnreadMessagesCountRequest,
  isFileMessage,
  Message,
  MessageNotAReplyError,
  ReadMessageRequest,
  ReadMessageResult,
  ReadMessageSucceededResult,
  SendChannelMessageRequest,
  SendFileMessageRequest,
  SendMessageReplyRequest,
  SendMessageRequest,
  SendMessageResult,
  SendTextMessageRequest,
  SendThreadMessageRequest,
  SentFileMessageResult,
  SentTextMessageResult,
  TextUserMessage,
} from './message';
import {
  CreatedThreadResult,
  CreateThreadRequest,
  CreateThreadResult,
  GetThreadChannelRequest,
  GetThreadChannelResult,
  GetThreadChannelSucceededResult,
  GetThreadMessageRequest,
  GetThreadMessageResult,
  GetThreadMessageSucceededResult,
  GetThreadsRequest,
  GetThreadsResult,
  GetThreadsSucceededResult,
  ReadThreadRequest,
  ReadThreadResult,
  ReadThreadSucceededResult,
  Thread,
} from './thread';
import {
  ChatKittyFailedResult,
  failed,
  GetCountResult,
  GetCountSucceedResult,
  succeeded,
} from './result';
import {
  BlockUserRequest,
  BlockUserResult,
  BlockUserSucceededResult,
  ChatKittyUserReference,
  GetUserIsChannelMemberRequest,
  GetUserIsChannelMemberResult,
  GetUserIsChannelMemberSucceededResult,
  GetUserResult,
  GetUsersRequest,
  GetUsersResult,
  GetUsersSucceededResult,
  GetUserSucceededResult,
  User,
} from './user';
import {
  AddChannelModeratorRequest,
  AddChannelModeratorResult,
  AddedChannelModeratorResult,
  CannotAddModeratorToChannelError,
  Channel,
  ChannelNotInvitableError,
  ChannelNotPubliclyJoinableError,
  ClearChannelHistoryRequest,
  ClearChannelHistoryResult,
  ClearChannelHistorySucceededResult,
  CreateChannelRequest,
  CreateChannelResult,
  CreatedChannelResult,
  DirectChannel,
  GetChannelMembersRequest,
  GetChannelResult,
  GetChannelsRequest,
  GetChannelsResult,
  GetChannelsSucceededResult,
  GetChannelSucceededResult,
  GetChannelUnreadRequest,
  GetChannelUnreadResult,
  GetChannelUnreadSucceededResult,
  GetUnreadChannelsRequest,
  HideChannelRequest,
  HideChannelResult,
  HideChannelSucceededResult,
  InvitedUserResult,
  InviteUserRequest,
  InviteUserResult,
  JoinChannelRequest,
  JoinChannelResult,
  JoinedChannelResult,
  LeaveChannelRequest,
  LeaveChannelResult,
  LeftChannelResult,
  MuteChannelRequest,
  MuteChannelResult,
  MutedChannelResult,
  NotAChannelMemberError,
  ReadChannelRequest,
  ReadChannelResult,
  ReadChannelSucceededResult,
  UnmuteChannelRequest,
  UnmuteChannelResult,
  UnmutedChannelResult,
  UpdateChannelRequest,
  UpdateChannelResult,
  UpdatedChannelResult,
} from './channel';
import {
  GetReactionsRequest,
  GetReactionsResult,
  GetReactionsSucceededResult,
  ReactedToMessageResult,
  Reaction,
  ReactToMessageRequest,
  ReactToMessageResult,
  RemovedReactionResult,
  RemoveReactionRequest,
  RemoveReactionResult,
} from './reaction';
import {
  Keystrokes,
  SendChannelKeystrokesRequest,
  SendKeystrokesRequest,
  SendThreadKeystrokesRequest,
} from './keystrokes';
import {
  GetReadReceiptsRequest,
  GetReadReceiptsResult,
  GetReadReceiptsSucceededResult,
  ReadReceipt,
} from './read-receipt';
import { ChatKittyPaginator } from './pagination';
import {
  DeleteUserBlockListItemRequest,
  DeleteUserBlockListItemResult,
  DeleteUserBlockListItemSucceededResult,
  GetUserBlockListResult,
  GetUserBlockListSucceededResult,
  UserBlockListItem,
} from './user-block-list-item';
import {
  TriggeredEventResult,
  TriggerEventRequest,
  TriggerEventResult,
  Event,
} from './event';
import {
  ChatSession,
  StartChatSessionRequest,
  StartChatSessionResult,
  StartedChatSessionResult,
} from './chat-session';
import { debounceTime } from 'rxjs/operators';
import {
  NoActiveSessionError,
  SessionActiveError,
  StartedSessionResult,
  StartSessionInProgressError,
  StartSessionRequest,
  StartSessionResult,
} from './user-session';
import {
  ChatKittyUploadResult,
  CreateChatKittyExternalFileProperties,
  CreateChatKittyFileProperties,
} from './file';
import { environment } from './environment/environment';
import { Notification } from './notification';

export class ChatKitty {
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

  private static channelRelay(id: number): string {
    return '/application/v1/channels/' + id + '.relay';
  }

  private static userRelay(id: number): string {
    return '/application/v1/users/' + id + '.relay';
  }

  protected readonly stompX: StompX;

  protected readonly currentUserSubject =
    new BehaviorSubject<CurrentUser | null>(null);

  private readonly lostConnectionSubject = new Subject<void>();
  private readonly resumedConnectionSubject = new Subject<void>();

  private writeFileGrant?: string;
  private chatSessions: Map<number, ChatSession> = new Map();

  private messageMapper: MessageMapper = new MessageMapper('');

  private keyStrokesSubject = new Subject<SendKeystrokesRequest>();

  private isStartingSession = false;

  currentUser?: CurrentUser;

  public Calls: Calls = new (class ChatKittyCalls {
    private static callRelay(id: number): string {
      return '/application/v1/calls/' + id + '.relay';
    }

    public localStream: MediaStream | null = null;

    public currentCall: Call | null = null;

    public isMuted: boolean = false;

    public isCameraOn: boolean = false;

    private configuration: {
      media: { audio: boolean; video: boolean };
    } | null = null;

    private readonly participantAcceptedCallSubject = new Subject<User>();
    private readonly participantDeclinedCallSubject = new Subject<User>();
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

      this.configuration = configuration;

      this.localStream = (await mediaDevices.getUserMedia(
        constraints
      )) as MediaStream;

      this.isMuted = !configuration.media.audio;
      this.isCameraOn = configuration.media.video;
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

    public declineCall(
      request: DeclineCallRequest
    ): Promise<DeclineCallResult> {
      return new Promise((resolve) => {
        this.kitty.stompX.sendAction<never>({
          destination: request.call._actions.decline,
          body: {},
          onSuccess: (call) => {
            resolve(new DeclinedCallResult(call));
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

          this.isMuted = !track.enabled;
        });
      }
    };

    toggleCamera = () => {
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => {
          track.enabled = !track.enabled;

          this.isCameraOn = track.enabled;
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
      const user = this.kitty.currentUser;

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
      const user = this.kitty.currentUser;

      if (!user) {
        throw new NoActiveSessionError();
      }

      const unsubscribe = this.kitty.stompX.listenForEvent<Call>({
        topic: user._topics.calls,
        event: 'me.call.active',
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

    public onParticipantDeclinedCall(
      onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
    ): ChatKittyUnsubscribe {
      const subscription = this.participantDeclinedCallSubject.subscribe(
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
      this.localStream?.release();
    }

    private startCallSession(call: Call): Promise<void> {
      return new Promise((resolve) => {
        let participantAcceptedCallUnsubscribe: () => void;
        let participantDeclinedCallUnsubscribe: () => void;
        let participantLeftCallUnsubscribe: () => void;

        participantAcceptedCallUnsubscribe =
          this.kitty.stompX.listenForEvent<User>({
            topic: call._topics.participants,
            event: 'call.participant.accepted',
            onSuccess: (user) => {
              this.participantAcceptedCallSubject.next(user);
            },
          });

        participantDeclinedCallUnsubscribe =
          this.kitty.stompX.listenForEvent<User>({
            topic: call._topics.participants,
            event: 'call.participant.declined',
            onSuccess: (user) => {
              this.participantDeclinedCallSubject.next(user);
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
          participantDeclinedCallUnsubscribe?.();
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

            this.callEndedSubject.next(call);
          },
        });

        const activeCallUnsubscribe = this.kitty.stompX.listenForEvent<Call>({
          topic: call._topics.self,
          event: 'call.self.active',
          onSuccess: (c) => {
            this.currentCall = c;
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
              activeCallUnsubscribe();
              endedCallUnsubscribe();

              callUnsubscribe();
            };

            this.kitty.stompX.sendAction<never>({
              destination: call._actions.ready,
              body: {},
              onSent: () => {
                this.currentCall = call;

                this.endCallUnsubscribe = () => {
                  end();

                  if (this.configuration) {
                    this.isMuted = !this.configuration.media.audio;
                    this.isCameraOn = this.configuration.media.video;
                  }

                  this.currentCall = null;
                  this.endCallUnsubscribe = undefined;
                };

                resolve();
              },
            });
          },
        });
      });
    }
  })(this);

  public constructor(private readonly configuration: ChatKittyConfiguration) {
    this.stompX = new StompX({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production,
    });

    this.keyStrokesSubject
      .asObservable()
      .pipe(debounceTime(150))
      .subscribe((request) => {
        let destination = '';

        const channel = (request as SendChannelKeystrokesRequest).channel;
        const thread = (request as SendThreadKeystrokesRequest).thread;

        if (channel) {
          destination = channel._actions.keystrokes;
        }

        if (thread) {
          destination = thread._actions.keystrokes;
        }

        this.stompX.sendAction<never>({
          destination,
          body: {
            keys: request.keys,
          },
        });
      });
  }

  public startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResult> {
    if (this.isStartingSession) {
      throw new StartSessionInProgressError();
    }

    if (this.stompX.initialized) {
      throw new SessionActiveError();
    }

    this.isStartingSession = true;

    return new Promise((resolve) => {
      this.stompX.connect<CurrentUser>({
        apiKey: this.configuration.apiKey,
        username: request.username,
        authParams: request.authParams,
        onSuccess: (user, writeFileGrant, readFileGrant) => {
          this.stompX.listenToTopic({ topic: user._topics.self });
          this.stompX.listenToTopic({ topic: user._topics.channels });
          this.stompX.listenToTopic({ topic: user._topics.messages });
          this.stompX.listenToTopic({ topic: user._topics.notifications });
          this.stompX.listenToTopic({ topic: user._topics.contacts });
          this.stompX.listenToTopic({ topic: user._topics.participants });
          this.stompX.listenToTopic({ topic: user._topics.users });
          this.stompX.listenToTopic({ topic: user._topics.reactions });
          this.stompX.listenToTopic({ topic: user._topics.threads });
          this.stompX.listenToTopic({ topic: user._topics.calls });

          this.writeFileGrant = writeFileGrant;

          this.messageMapper = new MessageMapper(readFileGrant);

          this.isStartingSession = false;

          resolve(new StartedSessionResult({ user: user }));
        },
        onConnected: (user) => {
          this.currentUser = user;

          this.currentUserSubject.next(user);
        },
        onConnectionLost: () => this.lostConnectionSubject.next(),
        onConnectionResumed: () => this.resumedConnectionSubject.next(),
        onError: (error) => {
          this.isStartingSession = false;

          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public endSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stompX.disconnect({
        onSuccess: () => {
          this.currentUser = undefined;
          this.currentUserSubject.next(null);

          resolve();
        },
        onError: (e) => {
          reject(e);
        },
      });
    });
  }

  public getCurrentUser(): Promise<GetCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<CurrentUser>({
        destination: currentUser._relays.self,
        onSuccess: (user) => {
          resolve(new GetCurrentUserSuccessfulResult(user));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public onCurrentUserChanged(
    onNextOrObserver:
      | ChatKittyObserver<CurrentUser | null>
      | ((user: CurrentUser | null) => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.currentUserSubject.subscribe((user) => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver(user);
      } else {
        onNextOrObserver.onNext(user);
      }
    });

    return () => subscription.unsubscribe();
  }

  public onCurrentUserOnline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.resumedConnectionSubject.subscribe(() => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver();
      } else {
        if (this.currentUser) {
          onNextOrObserver.onNext(this.currentUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }

  public onCurrentUserOffline(
    onNextOrObserver: ChatKittyObserver<CurrentUser> | (() => void)
  ): ChatKittyUnsubscribe {
    const subscription = this.lostConnectionSubject.subscribe(() => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver();
      } else {
        if (this.currentUser) {
          onNextOrObserver.onNext(this.currentUser);
        }
      }
    });

    return () => subscription.unsubscribe();
  }

  public updateCurrentUser(
    update: (user: CurrentUser) => CurrentUser
  ): Promise<UpdateCurrentUserResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<CurrentUser>({
        destination: currentUser._actions.update,
        body: update(currentUser),
        onSuccess: (user) => {
          this.currentUserSubject.next(user);

          resolve(new UpdatedCurrentUserResult(user));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public updateCurrentUserDisplayPicture(
    request: UpdateCurrentUserDisplayPictureRequest
  ): Promise<UpdateCurrentUserDisplayPictureResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const file = request.file;

      if (file instanceof Blob) {
        this.stompX.sendToStream<CurrentUser>({
          stream: currentUser._streams.displayPicture,
          grant: <string>this.writeFileGrant,
          blob: file,
          onSuccess: (user) => {
            resolve(new UpdatedCurrentUserDisplayPictureResult(user));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
          progressListener: {
            onStarted: () => request.progressListener?.onStarted?.(),
            onProgress: (progress) =>
              request.progressListener?.onProgress(progress),
            onCompleted: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.COMPLETED
              ),
            onFailed: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.FAILED
              ),
            onCancelled: () =>
              request.progressListener?.onCompleted(
                ChatKittyUploadResult.CANCELLED
              ),
          },
        });
      } else {
        this.stompX.sendAction<CurrentUser>({
          destination: currentUser._actions.updateDisplayPicture,
          body: file,
          onSuccess: (user) => {
            resolve(new UpdatedCurrentUserResult(user));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      }
    });
  }

  public updateChannel(
    request: UpdateChannelRequest
  ): Promise<UpdateChannelResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.update,
        body: request.channel,
        onSuccess: (channel) => {
          resolve(new UpdatedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public createChannel(
    request: CreateChannelRequest
  ): Promise<CreateChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: currentUser._actions.createChannel,
        events: [
          'me.channel.created',
          'me.channel.upserted',
          'member.channel.upserted',
        ],
        body: request,
        onSuccess: (channel) => {
          resolve(new CreatedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getChannels(request?: GetChannelsRequest): Promise<GetChannelsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      const parameters: { subscribable?: boolean; name?: string } = {};

      let relay = currentUser._relays.channels;

      if (isGetChannelsRequest(request)) {
        if (request.filter?.joined === false) {
          relay = currentUser._relays.joinableChannels;
        }

        if (request.filter?.joined === true) {
          parameters.subscribable = true;
        }

        if (request.filter?.unread) {
          relay = currentUser._relays.unreadChannels;
        }
      }

      const name = request?.filter?.name;

      if (name) {
        parameters.name = name;
      }

      ChatKittyPaginator.createInstance<Channel>({
        stompX: this.stompX,
        relay: relay,
        contentName: 'channels',
        parameters: parameters,
      })
        .then((paginator) => resolve(new GetChannelsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getChannel(id: number): Promise<GetChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: ChatKitty.channelRelay(id),
        onSuccess: (channel) => {
          resolve(new GetChannelSucceededResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public joinChannel(request: JoinChannelRequest): Promise<JoinChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.join;

    if (!destination) {
      throw new ChannelNotPubliclyJoinableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: request,
        onSuccess: (channel) => {
          resolve(new JoinedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public leaveChannel(
    request: LeaveChannelRequest
  ): Promise<LeaveChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.leave;

    if (!destination) {
      throw new NotAChannelMemberError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: {},
        onSuccess: (channel) => {
          resolve(new LeftChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public addChannelModerator(
    request: AddChannelModeratorRequest
  ): Promise<AddChannelModeratorResult> {
    const destination = request.channel._actions.addModerator;

    if (!destination) {
      throw new CannotAddModeratorToChannelError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: destination,
        body: request.user,
        onSuccess: (channel) => {
          resolve(new AddedChannelModeratorResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getUnreadChannelsCount(
    request?: GetUnreadChannelsRequest
  ): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const parameters: { unread: true; type?: string } = {
      unread: true,
    };

    if (isGetChannelsUnreadRequest(request)) {
      parameters.type = request.filter?.type;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.channelsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getChannelUnread(
    request: GetChannelUnreadRequest
  ): Promise<GetChannelUnreadResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.channel._relays.unread,
        onSuccess: (resource) => {
          resolve(new GetChannelUnreadSucceededResult(resource.exists));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public readChannel(request: ReadChannelRequest): Promise<ReadChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.read,
        body: {},
        onSent: () => resolve(new ReadChannelSucceededResult(request.channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public muteChannel(request: MuteChannelRequest): Promise<MuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.mute,
        body: {
          state: 'ON',
        },
        onSuccess: (channel) => {
          resolve(new MutedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public unmuteChannel(
    request: UnmuteChannelRequest
  ): Promise<UnmuteChannelResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<Channel>({
        destination: request.channel._actions.mute,
        body: {
          state: 'OFF',
        },
        onSuccess: (channel) => {
          resolve(new UnmutedChannelResult(channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public clearChannelHistory(
    request: ClearChannelHistoryRequest
  ): Promise<ClearChannelHistoryResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.clearHistory,
        body: {},
        onSuccess: (channel) =>
          resolve(new ClearChannelHistorySucceededResult(channel)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public hideChannel(request: HideChannelRequest): Promise<HideChannelResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<DirectChannel>({
        destination: request.channel._actions.hide,
        body: {},
        onSuccess: (resource) =>
          resolve(new HideChannelSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public startChatSession(
    request: StartChatSessionRequest
  ): StartChatSessionResult {
    const onReceivedMessage = request.onReceivedMessage;
    const onReceivedKeystrokes = request.onReceivedKeystrokes;
    const onParticipantEnteredChat = request.onParticipantEnteredChat;
    const onParticipantLeftChat = request.onParticipantLeftChat;
    const onTypingStarted = request.onTypingStarted;
    const onTypingStopped = request.onTypingStopped;
    const onParticipantPresenceChanged = request.onParticipantPresenceChanged;
    const onEventTriggered = request.onEventTriggered;
    const onMessageUpdated = request.onMessageUpdated;
    const onChannelUpdated = request.onChannelUpdated;
    const onMessageRead = request.onMessageRead;
    const onMessageReactionAdded = request.onMessageReactionAdded;
    const onMessageReactionRemoved = request.onMessageReactionRemoved;
    const onThreadReceivedMessage = request.onThreadReceivedMessage;
    const onThreadReceivedKeystrokes = request.onThreadReceivedKeystrokes;
    const onThreadTypingStarted = request.onThreadTypingStarted;
    const onThreadTypingStopped = request.onThreadTypingStopped;

    let receivedMessageUnsubscribe: () => void;
    let receivedKeystrokesUnsubscribe: () => void;
    let participantEnteredChatUnsubscribe: () => void;
    let participantLeftChatUnsubscribe: () => void;
    let typingStartedUnsubscribe: () => void;
    let typingStoppedUnsubscribe: () => void;
    let participantPresenceChangedUnsubscribe: () => void;
    let eventTriggeredUnsubscribe: () => void;
    let messageUpdatedUnsubscribe: () => void;
    let channelUpdatedUnsubscribe: () => void;
    let messageReadUnsubscribe: () => void;
    let messageReactionAddedUnsubscribe: () => void;
    let messageReactionRemovedUnsubscribe: () => void;
    let threadReceivedMessageUnsubscribe: () => void;
    let threadReceivedKeystrokesUnsubscribe: () => void;
    let threadTypingStartedUnsubscribe: () => void;
    let threadTypingStoppedUnsubscribe: () => void;

    if (onReceivedMessage) {
      receivedMessageUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'channel.message.created',
        onSuccess: (message) => {
          const destination = message._relays.parent;

          if (destination) {
            this.stompX.relayResource<Message>({
              destination,
              onSuccess: (parent) => {
                onReceivedMessage(
                  this.messageMapper.map(message),
                  this.messageMapper.map(parent)
                );
              },
            });
          } else {
            onReceivedMessage(this.messageMapper.map(message));
          }
        },
      });
    }

    if (onReceivedKeystrokes) {
      receivedKeystrokesUnsubscribe = this.stompX.listenForEvent<Keystrokes>({
        topic: request.channel._topics.keystrokes,
        event: 'thread.keystrokes.created',
        onSuccess: (keystrokes) => {
          onReceivedKeystrokes(keystrokes);
        },
      });
    }

    if (onTypingStarted) {
      typingStartedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.typing,
        event: 'thread.typing.started',
        onSuccess: (user) => {
          onTypingStarted(user);
        },
      });
    }

    if (onTypingStopped) {
      typingStoppedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.typing,
        event: 'thread.typing.stopped',
        onSuccess: (user) => {
          onTypingStopped(user);
        },
      });
    }

    if (onParticipantEnteredChat) {
      participantEnteredChatUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'channel.participant.active',
        onSuccess: (user) => {
          onParticipantEnteredChat(user);
        },
      });
    }

    if (onParticipantLeftChat) {
      participantLeftChatUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'channel.participant.inactive',
        onSuccess: (user) => {
          onParticipantLeftChat(user);
        },
      });
    }

    if (onParticipantPresenceChanged) {
      participantPresenceChangedUnsubscribe = this.stompX.listenForEvent<User>({
        topic: request.channel._topics.participants,
        event: 'participant.presence.changed',
        onSuccess: (user) => {
          onParticipantPresenceChanged(user);
        },
      });
    }

    if (onMessageUpdated) {
      messageUpdatedUnsubscribe = this.stompX.listenForEvent<Message>({
        topic: request.channel._topics.messages,
        event: 'thread.message.updated',
        onSuccess: (message) => {
          onMessageUpdated(message);
        },
      });
    }

    if (onEventTriggered) {
      eventTriggeredUnsubscribe = this.stompX.listenForEvent<Event>({
        topic: request.channel._topics.events,
        event: 'channel.event.triggered',
        onSuccess: (event) => {
          onEventTriggered(event);
        },
      });
    }

    if (onChannelUpdated) {
      channelUpdatedUnsubscribe = this.stompX.listenForEvent<Channel>({
        topic: request.channel._topics.self,
        event: 'channel.self.updated',
        onSuccess: (channel) => {
          onChannelUpdated(channel);
        },
      });
    }

    if (onMessageRead) {
      messageReadUnsubscribe = this.stompX.listenForEvent<ReadReceipt>({
        topic: request.channel._topics.readReceipts,
        event: 'message.read_receipt.created',
        onSuccess: (receipt) => {
          this.stompX.relayResource<Message>({
            destination: receipt._relays.message,
            onSuccess: (message) => {
              onMessageRead(message, receipt);
            },
          });
        },
      });
    }

    if (onMessageReactionAdded) {
      messageReactionAddedUnsubscribe = this.stompX.listenForEvent<Reaction>({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.created',
        onSuccess: (reaction) => {
          this.stompX.relayResource<Message>({
            destination: reaction._relays.message,
            onSuccess: (message) => {
              onMessageReactionAdded(message, reaction);
            },
          });
        },
      });
    }

    if (onMessageReactionRemoved) {
      messageReactionRemovedUnsubscribe = this.stompX.listenForEvent<Reaction>({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.removed',
        onSuccess: (reaction) => {
          this.stompX.relayResource<Message>({
            destination: reaction._relays.message,
            onSuccess: (message) => {
              onMessageReactionRemoved(message, reaction);
            },
          });
        },
      });
    }

    let end = () => {
      messageReactionRemovedUnsubscribe?.();
      messageReactionAddedUnsubscribe?.();
      messageReadUnsubscribe?.();
      channelUpdatedUnsubscribe?.();
      messageUpdatedUnsubscribe?.();
      eventTriggeredUnsubscribe?.();
      participantPresenceChangedUnsubscribe?.();
      participantLeftChatUnsubscribe?.();
      participantEnteredChatUnsubscribe?.();
      typingStoppedUnsubscribe?.();
      typingStartedUnsubscribe?.();
      receivedKeystrokesUnsubscribe?.();
      receivedMessageUnsubscribe?.();
      threadReceivedMessageUnsubscribe?.();
      threadReceivedKeystrokesUnsubscribe?.();
      threadTypingStartedUnsubscribe?.();
      threadTypingStoppedUnsubscribe?.();
    };

    const channelUnsubscribe = this.stompX.listenToTopic({
      topic: request.channel._topics.self,
      onSuccess: () => {
        const messagesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.messages,
        });

        const keystrokesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.keystrokes,
        });

        const typingUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.typing,
        });

        const participantsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.participants,
        });

        const readReceiptsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.readReceipts,
        });

        const reactionsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.reactions,
        });

        const eventsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.events,
        });

        const superEnd = end;

        end = () => {
          superEnd();

          eventsUnsubscribe?.();
          reactionsUnsubscribe?.();
          readReceiptsUnsubscribe?.();
          participantsUnsubscribe?.();
          typingUnsubscribe?.();
          keystrokesUnsubscribe?.();
          messagesUnsubscribe?.();

          channelUnsubscribe();

          this.chatSessions.delete(request.channel.id);
        };
      },
    });

    let activeThread: Thread | null = null;

    const session = {
      channel: request.channel,
      thread: activeThread,
      end: () => end(),
      setThread: (thread: Thread) => {
        threadReceivedMessageUnsubscribe?.();
        threadReceivedKeystrokesUnsubscribe?.();
        threadTypingStartedUnsubscribe?.();
        threadTypingStoppedUnsubscribe?.();

        if (onThreadReceivedMessage) {
          threadReceivedMessageUnsubscribe =
            this.stompX.listenForEvent<Message>({
              topic: thread._topics.messages,
              event: 'thread.message.created',
              onSuccess: (message) => {
                onThreadReceivedMessage(
                  thread,
                  this.messageMapper.map(message)
                );
              },
            });
        }

        if (onThreadReceivedKeystrokes) {
          threadReceivedKeystrokesUnsubscribe =
            this.stompX.listenForEvent<Keystrokes>({
              topic: thread._topics.keystrokes,
              event: 'thread.keystrokes.created',
              onSuccess: (keystrokes) => {
                onThreadReceivedKeystrokes(thread, keystrokes);
              },
            });
        }

        if (onThreadTypingStarted) {
          threadTypingStartedUnsubscribe = this.stompX.listenForEvent<User>({
            topic: thread._topics.typing,
            event: 'thread.typing.started',
            onSuccess: (user) => {
              onThreadTypingStarted(thread, user);
            },
          });
        }

        if (onThreadTypingStopped) {
          threadTypingStoppedUnsubscribe = this.stompX.listenForEvent<User>({
            topic: thread._topics.typing,
            event: 'thread.typing.stopped',
            onSuccess: (user) => {
              onThreadTypingStopped(thread, user);
            },
          });
        }

        activeThread = thread;
      },
    };

    this.chatSessions.set(request.channel.id, session);

    return new StartedChatSessionResult(session);
  }

  public sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let destination = '';
      let stream = '';

      const sendChannelMessageRequest = request as SendChannelMessageRequest;

      if (sendChannelMessageRequest.channel !== undefined) {
        destination = sendChannelMessageRequest.channel._actions.message;
        stream = sendChannelMessageRequest.channel._streams.messages;
      }

      const sendMessageReplyRequest = request as SendMessageReplyRequest;

      if (sendMessageReplyRequest.message !== undefined) {
        destination = sendMessageReplyRequest.message._actions.reply;
        stream = sendMessageReplyRequest.message._streams.replies;
      }

      const sendThreadMessageRequest = request as SendThreadMessageRequest;

      if (sendThreadMessageRequest.thread !== undefined) {
        destination = sendThreadMessageRequest.thread._actions.message;
        stream = sendThreadMessageRequest.thread._streams.messages;
      }

      if (isSendChannelTextMessageRequest(request)) {
        this.stompX.sendAction<TextUserMessage>({
          destination: destination,
          body: {
            type: 'TEXT',
            body: request.body,
            groupTag: request.groupTag,
            properties: request.properties,
          },
          onSuccess: (message) => {
            resolve(new SentTextMessageResult(this.messageMapper.map(message)));
          },
          onError: (error) => {
            resolve(new ChatKittyFailedResult(error));
          },
        });
      }

      if (isSendChannelFileMessageRequest(request)) {
        const file = request.file;

        if (isCreateChatKittyExternalFileProperties(file)) {
          this.stompX.sendAction<FileUserMessage>({
            destination: destination,
            body: {
              type: 'FILE',
              file: file,
              groupTag: request.groupTag,
              properties: request.properties,
            },
            onSuccess: (message) => {
              resolve(
                new SentFileMessageResult(this.messageMapper.map(message))
              );
            },
            onError: (error) => {
              resolve(new ChatKittyFailedResult(error));
            },
          });
        } else {
          const properties: Map<string, unknown> = new Map();

          if (request.groupTag) {
            properties.set('groupTag', request.groupTag);
          }

          if (request.properties) {
            properties.set('properties', request.properties);
          }

          this.stompX.sendToStream<FileUserMessage>({
            stream: stream,
            grant: <string>this.writeFileGrant,
            blob: file as Blob,
            properties: properties,
            onSuccess: (message) => {
              resolve(
                new SentFileMessageResult(this.messageMapper.map(message))
              );
            },
            onError: (error) => {
              resolve(new ChatKittyFailedResult(error));
            },
            progressListener: {
              onStarted: () => request.progressListener?.onStarted?.(),
              onProgress: (progress) =>
                request.progressListener?.onProgress(progress),
              onCompleted: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.COMPLETED
                ),
              onFailed: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.FAILED
                ),
              onCancelled: () =>
                request.progressListener?.onCompleted(
                  ChatKittyUploadResult.CANCELLED
                ),
            },
          });
        }
      }
    });
  }

  public getMessages(request: GetMessagesRequest): Promise<GetMessagesResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = '';

    let parameters: Record<string, unknown> | undefined;

    if (isGetChannelMessagesRequest(request)) {
      relay = request.channel._relays.messages;

      parameters = {
        ...request.filter,
      };
    }

    if (isGetMessageRepliesRequest(request)) {
      relay = request.message._relays.replies;
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Message>({
        stompX: this.stompX,
        relay: relay,
        parameters: parameters,
        contentName: 'messages',
        mapper: (message) => this.messageMapper.map(message),
      })
        .then((paginator) => resolve(new GetMessagesSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getUnreadMessagesCount(
    request?: GetUnreadMessagesCountRequest
  ): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = currentUser._relays.unreadMessagesCount;

    if (isGetUnreadMessagesCountRequest(request)) {
      relay = request.channel._relays.messagesCount;
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: relay,
        parameters: {
          unread: true,
        },
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public triggerEvent(
    request: TriggerEventRequest
  ): Promise<TriggerEventResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.channel._actions.triggerEvent,
        body: {
          type: request.type,
          properties: request.properties,
        },
        onSent: () => {
          resolve(new TriggeredEventResult(request.channel));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public readMessage(request: ReadMessageRequest): Promise<ReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.message._actions.read,
        body: {},
        onSent: () => resolve(new ReadMessageSucceededResult(request.message)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getLastReadMessage(
    request: GetLastReadMessageRequest
  ): Promise<GetLastReadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.channel._relays.lastReadMessage,
        parameters: {
          username: request.username,
        },
        onSuccess: (resource) => {
          resolve(new GetLastReadMessageResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public editMessage(request: EditMessageRequest): Promise<EditMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.edit,
        body: {
          body: request.body,
        },
        onSuccess: (message) =>
          resolve(new EditedMessageSucceededResult(message)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getMessageRepliesCount(
    request: GetMessageRepliesCountRequest
  ): Promise<GetCountResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<{ count: number }>({
        destination: request.message._relays.repliesCount,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getMessageChannel(
    request: GetMessageChannelRequest
  ): Promise<GetMessageChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.message._relays.channel,
        onSuccess: (resource) => {
          resolve(new GetMessageChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getMessageParent(
    request: GetMessageParentRequest
  ): Promise<GetMessageParentResult> {
    return new Promise((resolve) => {
      const destination = request.message._relays.parent;

      if (!destination) {
        throw new MessageNotAReplyError(request.message);
      }

      this.stompX.relayResource<Message>({
        destination,
        onSuccess: (resource) => {
          resolve(new GetMessageParentSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public createThread(
    request: CreateThreadRequest
  ): Promise<CreateThreadResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Thread>({
        destination: request.channel._actions.createThread,
        body: { name: request.name, properties: request.properties },
        onSuccess: (thread) => resolve(new CreatedThreadResult(thread)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getThreads(request: GetThreadsRequest): Promise<GetThreadsResult> {
    const parameters: { includeMainThread?: false; standalone?: true } = {};

    if (request.filter?.includeMainThread === false) {
      parameters.includeMainThread = false;
    }

    if (request.filter?.standalone === true) {
      parameters.standalone = true;
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Thread>({
        stompX: this.stompX,
        relay: request.channel._relays.threads,
        contentName: 'threads',
        parameters,
      })
        .then((paginator) => resolve(new GetThreadsSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getThreadChannel(
    request: GetThreadChannelRequest
  ): Promise<GetThreadChannelResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Channel>({
        destination: request.thread._relays.channel,
        onSuccess: (resource) => {
          resolve(new GetThreadChannelSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public getThreadMessage(
    request: GetThreadMessageRequest
  ): Promise<GetThreadMessageResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<Message>({
        destination: request.thread._relays.message,
        onSuccess: (resource) => {
          resolve(new GetThreadMessageSucceededResult(resource));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public readThread(request: ReadThreadRequest): Promise<ReadThreadResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<never>({
        destination: request.thread._actions.read,
        body: {},
        onSent: () => resolve(new ReadThreadSucceededResult(request.thread)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public reactToMessage(
    request: ReactToMessageRequest
  ): Promise<ReactToMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Reaction>({
        destination: request.message._actions.react,
        body: { emoji: request.emoji },
        onSuccess: (reaction) => resolve(new ReactedToMessageResult(reaction)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getReactions(
    request: GetReactionsRequest
  ): Promise<GetReactionsResult> {
    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<Reaction>({
        stompX: this.stompX,
        relay: request.message._relays.reactions,
        contentName: 'reactions',
      })
        .then((paginator) =>
          resolve(new GetReactionsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public removeReaction(
    request: RemoveReactionRequest
  ): Promise<RemoveReactionResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Reaction>({
        destination: request.message._actions.removeReaction,
        body: {
          emoji: request.emoji,
        },
        onSuccess: (reaction) => resolve(new RemovedReactionResult(reaction)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public deleteMessageForMe(
    request: DeleteMessageForMeRequest
  ): Promise<DeleteMessageForMeResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.deleteForMe,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteMessageForMeSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public deleteMessage(
    request: DeleteMessageRequest
  ): Promise<DeleteMessageResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<Message>({
        destination: request.message._actions.delete,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteMessageSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public sendKeystrokes(request: SendKeystrokesRequest) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    this.keyStrokesSubject.next(request);
  }

  public onNotificationReceived(
    onNextOrObserver:
      | ChatKittyObserver<Notification>
      | ((notification: Notification) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Notification>({
      topic: currentUser._topics.notifications,
      event: 'me.notification.created',
      onSuccess: (notification) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(notification);
        } else {
          onNextOrObserver.onNext(notification);
        }
      },
    });

    return () => unsubscribe;
  }

  public onChannelJoined(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.joined',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  public onChannelHidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.hidden',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  public onChannelUnhidden(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.unhidden',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  public onChannelLeft(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.left',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  public onChannelUpdated(
    onNextOrObserver: ChatKittyObserver<Channel> | ((channel: Channel) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<Channel>({
      topic: currentUser._topics.channels,
      event: 'me.channel.updated',
      onSuccess: (channel) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      },
    });

    return () => unsubscribe;
  }

  public getChannelMembers(
    request: GetChannelMembersRequest
  ): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<User>({
        stompX: this.stompX,
        relay: request.channel._relays.members,
        contentName: 'users',
        parameters: {
          ...request.filter,
        },
      })
        .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getReadReceipts(
    request: GetReadReceiptsRequest
  ): Promise<GetReadReceiptsResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<ReadReceipt>({
        stompX: this.stompX,
        relay: request.message._relays.readReceipts,
        contentName: 'receipts',
      })
        .then((paginator) =>
          resolve(new GetReadReceiptsSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getUsers(request?: GetUsersRequest): Promise<GetUsersResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined;

      if (isGetUsersRequest(request)) {
        parameters = {
          ...request.filter,
        };
      }

      ChatKittyPaginator.createInstance<User>({
        stompX: this.stompX,
        relay: currentUser._relays.contacts,
        contentName: 'users',
        parameters: parameters,
      })
        .then((paginator) => resolve(new GetUsersSucceededResult(paginator)))
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public getUsersCount(request?: GetUsersRequest): Promise<GetCountResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      let parameters: Record<string, unknown> | undefined;

      if (isGetUsersRequest(request)) {
        parameters = {
          ...request.filter,
        };
      }

      this.stompX.relayResource<{ count: number }>({
        destination: currentUser._relays.contactsCount,
        parameters: parameters,
        onSuccess: (resource) => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public onUserPresenceChanged(
    onNextOrObserver: ChatKittyObserver<User> | ((user: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.contacts,
      event: 'contact.presence.changed',
      onSuccess: (user) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(user);
        } else {
          onNextOrObserver.onNext(user);
        }
      },
    });

    return () => unsubscribe;
  }

  public inviteUser(request: InviteUserRequest): Promise<InviteUserResult> {
    const destination = request.channel._actions.invite;

    if (!destination) {
      throw new ChannelNotInvitableError(request.channel);
    }

    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: destination,
        body: {
          user: request.user,
        },
        onSuccess: (resource) => {
          resolve(new InvitedUserResult(resource));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public onParticipantStartedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.participants,
      event: 'participant.typing.started',
      onSuccess: (participant) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      },
    });

    return () => unsubscribe;
  }

  public onParticipantStoppedTyping(
    onNextOrObserver: ChatKittyObserver<User> | ((participant: User) => void)
  ): ChatKittyUnsubscribe {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent<User>({
      topic: currentUser._topics.participants,
      event: 'participant.typing.stopped',
      onSuccess: (participant) => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      },
    });

    return () => unsubscribe;
  }

  public getUser(param: number): Promise<GetUserResult> {
    return new Promise((resolve) => {
      this.stompX.relayResource<User>({
        destination: ChatKitty.userRelay(param),
        onSuccess: (user) => {
          resolve(new GetUserSucceededResult(user));
        },
      });
    });
  }

  public getUserIsChannelMember(
    request: GetUserIsChannelMemberRequest
  ): Promise<GetUserIsChannelMemberResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      this.stompX.relayResource<{ exists: boolean }>({
        destination: request.user._relays.channelMember,
        parameters: {
          channelId: request.channel.id,
        },
        onSuccess: (resource) => {
          resolve(new GetUserIsChannelMemberSucceededResult(resource.exists));
        },
        onError: (error) => {
          resolve(new ChatKittyFailedResult(error));
        },
      });
    });
  }

  public blockUser(request: BlockUserRequest): Promise<BlockUserResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: `/application/v1/users/${request.user.id}.block`,
        body: {},
        onSuccess: (resource) => {
          resolve(new BlockUserSucceededResult(resource));
        },
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }

  public getUserBlockList(): Promise<GetUserBlockListResult> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise((resolve) => {
      ChatKittyPaginator.createInstance<UserBlockListItem>({
        stompX: this.stompX,
        relay: currentUser._relays.userBlockListItems,
        contentName: 'items',
      })
        .then((paginator) =>
          resolve(new GetUserBlockListSucceededResult(paginator))
        )
        .catch((error) => resolve(new ChatKittyFailedResult(error)));
    });
  }

  public deleteUserBlockListItem(
    request: DeleteUserBlockListItemRequest
  ): Promise<DeleteUserBlockListItemResult> {
    return new Promise((resolve) => {
      this.stompX.sendAction<User>({
        destination: request.item._actions.delete,
        body: {},
        onSuccess: (resource) =>
          resolve(new DeleteUserBlockListItemSucceededResult(resource)),
        onError: (error) => resolve(new ChatKittyFailedResult(error)),
      });
    });
  }
}

export declare class ChatKittyConfiguration {
  apiKey: string;
  isSecure?: boolean;
  host?: string;
}

class MessageMapper {
  readonly readFileGrant: string;

  constructor(grant: string) {
    this.readFileGrant = grant;
  }

  public map<M extends Message>(message: M): M {
    if (isFileMessage(message)) {
      return {
        ...message,
        file: {
          ...message.file,
          url: message.file.url + `?grant=${this.readFileGrant}`,
        },
      };
    } else {
      return {
        ...message,
      };
    }
  }
}

function isGetChannelsRequest(
  param: GetChannelsRequest | undefined
): param is GetChannelsRequest {
  const request = param as GetChannelsRequest;

  return request?.filter !== undefined;
}

function isGetUsersRequest(
  param: GetUsersRequest | undefined
): param is GetUsersRequest {
  const request = param as GetUsersRequest;

  return request?.filter !== undefined;
}

function isGetChannelsUnreadRequest(
  param: GetUnreadChannelsRequest | undefined
): param is GetUnreadChannelsRequest {
  const request = param as GetUnreadChannelsRequest;

  return request?.filter !== undefined;
}

function isGetUnreadMessagesCountRequest(
  param: GetUnreadMessagesCountRequest | undefined
): param is GetUnreadMessagesCountRequest {
  const request = param as GetUnreadMessagesCountRequest;

  return request?.channel !== undefined;
}

function isSendChannelTextMessageRequest(
  request: SendMessageRequest
): request is SendTextMessageRequest {
  return (request as SendTextMessageRequest).body !== undefined;
}

function isSendChannelFileMessageRequest(
  request: SendMessageRequest
): request is SendFileMessageRequest {
  return (request as SendFileMessageRequest).file !== undefined;
}

function isGetChannelMessagesRequest(
  request: GetMessagesRequest
): request is GetChannelMessagesRequest {
  return (request as GetChannelMessagesRequest).channel !== undefined;
}

function isGetMessageRepliesRequest(
  request: GetMessagesRequest
): request is GetMessageRepliesRequest {
  return (request as GetMessageRepliesRequest).message !== undefined;
}

function isCreateChatKittyExternalFileProperties(
  result: CreateChatKittyFileProperties
): result is CreateChatKittyExternalFileProperties {
  return (result as CreateChatKittyExternalFileProperties).url !== undefined;
}

interface Calls {
  localStream: MediaStream | null;

  currentCall: Call | null;

  isMuted: boolean;

  isCameraOn: boolean;

  initialize(configuration: {
    media: { audio: boolean; video: boolean };
  }): void;

  startCall(request: StartCallRequest): Promise<StartCallResult>;

  acceptCall(request: AcceptCallRequest): Promise<AcceptCallResult>;

  declineCall(request: DeclineCallRequest): Promise<DeclineCallResult>;

  leaveCall(): void;

  switchCamera(): void;

  toggleMute(): void;

  toggleCamera(): void;

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

  onParticipantDeclinedCall(
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
