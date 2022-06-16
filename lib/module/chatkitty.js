function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { BehaviorSubject, Subject } from 'rxjs';
import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';
import { AcceptedCallResult, GetCallsSucceededResult, GetCallSucceededResult, DeclinedCallResult, StartedCallResult, NoActiveCallError } from './call';
import { isAddCandidateCallSignal, isAnswerOfferCallSignal, isCreateOfferCallSignal, isDisconnectPeerCallSignal, isSendDescriptionCallSignal } from './call-signal';
import StompX from './stompx';
import { GetCurrentUserSuccessfulResult, UpdatedCurrentUserDisplayPictureResult, UpdatedCurrentUserResult } from './current-user';
import { DeleteMessageForMeSucceededResult, DeleteMessageSucceededResult, EditedMessageSucceededResult, GetLastReadMessageResult, GetMessageChannelSucceededResult, GetMessageParentSucceededResult, GetMessagesSucceededResult, isFileMessage, MessageNotAReplyError, ReadMessageSucceededResult, SentFileMessageResult, SentTextMessageResult } from './message';
import { CreatedThreadResult, GetThreadChannelSucceededResult, GetThreadMessageSucceededResult, GetThreadsSucceededResult, ReadThreadSucceededResult } from './thread';
import { ChatKittyFailedResult, failed, GetCountSucceedResult, succeeded } from './result';
import { BlockUserSucceededResult, GetUserIsChannelMemberSucceededResult, GetUsersSucceededResult, GetUserSucceededResult } from './user';
import { AddedChannelModeratorResult, CannotAddModeratorToChannelError, ChannelNotInvitableError, ChannelNotPubliclyJoinableError, ClearChannelHistorySucceededResult, CreatedChannelResult, DeletedChannelResult, GetChannelsSucceededResult, GetChannelSucceededResult, GetChannelUnreadSucceededResult, HideChannelSucceededResult, InvitedUserResult, JoinedChannelResult, LeftChannelResult, MutedChannelResult, NotAChannelMemberError, ReadChannelSucceededResult, UnmutedChannelResult, UpdatedChannelResult } from './channel';
import { GetReactionsSucceededResult, ReactedToMessageResult, RemovedReactionResult } from './reaction';
import { GetReadReceiptsSucceededResult } from './read-receipt';
import { ChatKittyPaginator } from './pagination';
import { DeleteUserBlockListItemSucceededResult, GetUserBlockListSucceededResult } from './user-block-list-item';
import { TriggeredEventResult } from './event';
import { StartedChatSessionResult } from './chat-session';
import { debounceTime } from 'rxjs/operators';
import { NoActiveSessionError, SessionActiveError, StartedSessionResult } from './user-session';
import { ChatKittyUploadResult } from './file';
import { environment } from './environment/environment';
import { GetUserMediaSettingsSucceededResult } from './user-media-settings';
export class ChatKitty {
  static getInstance(apiKey) {
    let instance = ChatKitty._instances.get(apiKey);

    if (instance !== undefined) {
      return instance;
    }

    instance = new ChatKitty({
      apiKey: apiKey
    });

    ChatKitty._instances.set(apiKey, instance);

    return instance;
  }

  static channelRelay(id) {
    return '/application/v1/channels/' + id + '.relay';
  }

  static userRelay(id) {
    return '/application/v1/users/' + id + '.relay';
  }

  constructor(configuration) {
    this.configuration = configuration;

    _defineProperty(this, "stompX", void 0);

    _defineProperty(this, "currentUserSubject", new BehaviorSubject(null));

    _defineProperty(this, "lostConnectionSubject", new Subject());

    _defineProperty(this, "resumedConnectionSubject", new Subject());

    _defineProperty(this, "writeFileGrant", void 0);

    _defineProperty(this, "chatSessions", new Map());

    _defineProperty(this, "messageMapper", new MessageMapper(''));

    _defineProperty(this, "keyStrokesSubject", new Subject());

    _defineProperty(this, "currentUser", void 0);

    _defineProperty(this, "Calls", new class ChatKittyCalls {
      static callRelay(id) {
        return '/application/v1/calls/' + id + '.relay';
      }

      static userMediaSettingsRelay(id) {
        return '/application/v1/users/' + id + '.media_settings.relay';
      }

      constructor(kitty) {
        this.kitty = kitty;

        _defineProperty(this, "localStream", null);

        _defineProperty(this, "currentCall", null);

        _defineProperty(this, "isMuted", false);

        _defineProperty(this, "isCameraOn", false);

        _defineProperty(this, "configuration", null);

        _defineProperty(this, "participantAcceptedCallSubject", new Subject());

        _defineProperty(this, "participantDeclinedCallSubject", new Subject());

        _defineProperty(this, "participantActiveSubject", new Subject());

        _defineProperty(this, "participantLeftCallSubject", new Subject());

        _defineProperty(this, "participantMediaSettingsUpdatedSubject", new Subject());

        _defineProperty(this, "callEndedSubject", new Subject());

        _defineProperty(this, "endCallUnsubscribe", void 0);

        _defineProperty(this, "switchCamera", () => {
          if (this.localStream) {
            this.localStream.getVideoTracks() // @ts-ignore
            .forEach(track => track._switchCamera());
          }
        });

        _defineProperty(this, "toggleMute", () => {
          if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
              this.isMuted = !track.enabled;
            });

            if (this.kitty.currentUser) {
              this.kitty.stompX.sendAction({
                destination: this.kitty.currentUser._actions.updateMediaSettingsAudioEnabled,
                body: {
                  enabled: !this.isMuted
                }
              });
            }
          }
        });

        _defineProperty(this, "toggleCamera", () => {
          if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
              track.enabled = !track.enabled;
              this.isCameraOn = track.enabled;
            });

            if (this.kitty.currentUser) {
              this.kitty.stompX.sendAction({
                destination: this.kitty.currentUser._actions.updateMediaSettingsVideoEnabled,
                body: {
                  enabled: this.isCameraOn
                }
              });
            }
          }
        });
      }

      async initialize(configuration) {
        const isFrontCamera = true;
        const devices = await mediaDevices.enumerateDevices();
        const facing = isFrontCamera ? 'front' : 'environment';
        const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
        const facingMode = isFrontCamera ? 'user' : 'environment';
        const constraints = {
          audio: configuration.media.audio,
          video: configuration.media.video && {
            mandatory: {
              minWidth: 1280,
              minHeight: 720,
              minFrameRate: 30
            },
            facingMode,
            optional: videoSourceId ? [{
              sourceId: videoSourceId
            }] : []
          }
        };
        this.configuration = configuration;
        this.localStream = await mediaDevices.getUserMedia(constraints);
        this.isMuted = !configuration.media.audio;
        this.isCameraOn = configuration.media.video;

        if (this.kitty.currentUser) {
          this.kitty.stompX.sendAction({
            destination: this.kitty.currentUser._actions.updateMediaSettingsAudioEnabled,
            body: {
              enabled: !this.isMuted
            }
          });
          this.kitty.stompX.sendAction({
            destination: this.kitty.currentUser._actions.updateMediaSettingsVideoEnabled,
            body: {
              enabled: this.isCameraOn
            }
          });
        }
      }

      startCall(request) {
        return new Promise(async resolve => {
          const type = request.type;
          let channel = request.channel;

          if (!channel) {
            const members = request.members;
            const result = await this.kitty.createChannel({
              type: 'DIRECT',
              members
            });

            if (succeeded(result)) {
              channel = result.channel;
            }

            if (failed(result)) {
              resolve(result);
            }
          }

          this.kitty.stompX.sendAction({
            destination: channel._actions.call,
            body: {
              type,
              properties: request.properties
            },
            onSuccess: call => {
              this.startCallSession(call).then(() => resolve(new StartedCallResult(call)));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            }
          });
        });
      }

      acceptCall(request) {
        return new Promise(resolve => {
          this.startCallSession(request.call).then(() => {
            resolve(new AcceptedCallResult(request.call));
          });
        });
      }

      declineCall(request) {
        return new Promise(resolve => {
          this.kitty.stompX.sendAction({
            destination: request.call._actions.decline,
            body: {},
            onSuccess: call => {
              resolve(new DeclinedCallResult(call));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            }
          });
        });
      }

      leaveCall() {
        var _this$endCallUnsubscr;

        (_this$endCallUnsubscr = this.endCallUnsubscribe) === null || _this$endCallUnsubscr === void 0 ? void 0 : _this$endCallUnsubscr.call(this);
      }

      getCalls(request) {
        var _request$filter;

        const parameters = {};
        const active = request === null || request === void 0 ? void 0 : (_request$filter = request.filter) === null || _request$filter === void 0 ? void 0 : _request$filter.active;

        if (active) {
          parameters.active = active;
        }

        return new Promise(resolve => {
          ChatKittyPaginator.createInstance({
            stompX: this.kitty.stompX,
            relay: request.channel._relays.calls,
            contentName: 'calls',
            parameters: parameters
          }).then(paginator => resolve(new GetCallsSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
        });
      }

      getCall(id) {
        return new Promise(resolve => {
          this.kitty.stompX.relayResource({
            destination: ChatKittyCalls.callRelay(id),
            onSuccess: call => {
              resolve(new GetCallSucceededResult(call));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            }
          });
        });
      }

      getCurrentCallParticipants() {
        const currentCall = this.currentCall;

        if (!currentCall) {
          throw new NoActiveCallError();
        }

        return new Promise(resolve => {
          ChatKittyPaginator.createInstance({
            stompX: this.kitty.stompX,
            relay: currentCall._relays.participants,
            contentName: 'users'
          }).then(paginator => resolve(new GetUsersSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
        });
      }

      getUserMediaSettings(request) {
        return new Promise(resolve => {
          this.kitty.stompX.relayResource({
            destination: ChatKittyCalls.userMediaSettingsRelay(request.user.id),
            onSuccess: settings => {
              resolve(new GetUserMediaSettingsSucceededResult(settings));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            }
          });
        });
      }

      onCallInvite(onNextOrObserver) {
        const user = this.kitty.currentUser;

        if (!user) {
          throw new NoActiveSessionError();
        }

        const unsubscribe = this.kitty.stompX.listenForEvent({
          topic: user._topics.calls,
          event: 'user.call.invited',
          onSuccess: call => {
            if (typeof onNextOrObserver === 'function') {
              onNextOrObserver(call);
            } else {
              onNextOrObserver.onNext(call);
            }
          }
        });
        return () => unsubscribe;
      }

      onCallActive(onNextOrObserver) {
        const user = this.kitty.currentUser;

        if (!user) {
          throw new NoActiveSessionError();
        }

        const unsubscribe = this.kitty.stompX.listenForEvent({
          topic: user._topics.calls,
          event: 'user.call.active',
          onSuccess: call => {
            if (typeof onNextOrObserver === 'function') {
              onNextOrObserver(call);
            } else {
              onNextOrObserver.onNext(call);
            }
          }
        });
        return () => unsubscribe;
      }

      onParticipantAcceptedCall(onNextOrObserver) {
        const subscription = this.participantAcceptedCallSubject.subscribe(user => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(user);
          } else {
            onNextOrObserver.onNext(user);
          }
        });
        return () => subscription.unsubscribe();
      }

      onParticipantDeclinedCall(onNextOrObserver) {
        const subscription = this.participantDeclinedCallSubject.subscribe(user => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(user);
          } else {
            onNextOrObserver.onNext(user);
          }
        });
        return () => subscription.unsubscribe();
      }

      onParticipantActive(onNextOrObserver) {
        const subscription = this.participantActiveSubject.subscribe(event => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(event.user, event.stream);
          } else {
            onNextOrObserver.onNext(event);
          }
        });
        return () => subscription.unsubscribe();
      }

      onParticipantMediaSettingsUpdated(onNextOrObserver) {
        const subscription = this.participantMediaSettingsUpdatedSubject.subscribe(settings => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(settings);
          } else {
            onNextOrObserver.onNext(settings);
          }
        });
        return () => subscription.unsubscribe();
      }

      onParticipantLeftCall(onNextOrObserver) {
        const subscription = this.participantLeftCallSubject.subscribe(user => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(user);
          } else {
            onNextOrObserver.onNext(user);
          }
        });
        return () => subscription.unsubscribe();
      }

      onCallEnded(onNextOrObserver) {
        const subscription = this.callEndedSubject.subscribe(call => {
          if (typeof onNextOrObserver === 'function') {
            onNextOrObserver(call);
          } else {
            onNextOrObserver.onNext(call);
          }
        });
        return () => subscription.unsubscribe();
      }

      close() {
        var _this$endCallUnsubscr2, _this$localStream;

        (_this$endCallUnsubscr2 = this.endCallUnsubscribe) === null || _this$endCallUnsubscr2 === void 0 ? void 0 : _this$endCallUnsubscr2.call(this);
        (_this$localStream = this.localStream) === null || _this$localStream === void 0 ? void 0 : _this$localStream.release();
      }

      startCallSession(call) {
        return new Promise(resolve => {
          let participantAcceptedCallUnsubscribe;
          let participantDeclinedCallUnsubscribe;
          let participantLeftCallUnsubscribe;
          let userMediaSettingsUpdatedUnsubscribe;
          participantAcceptedCallUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.participants,
            event: 'call.participant.accepted',
            onSuccess: user => {
              this.participantAcceptedCallSubject.next(user);
            }
          });
          participantDeclinedCallUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.participants,
            event: 'call.participant.declined',
            onSuccess: user => {
              this.participantDeclinedCallSubject.next(user);
            }
          });
          participantLeftCallUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.participants,
            event: 'call.participant.left',
            onSuccess: user => {
              this.participantLeftCallSubject.next(user);
            }
          });
          userMediaSettingsUpdatedUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.userMediaSettings,
            event: 'call.user_media_settings.updated',
            onSuccess: settings => {
              this.participantMediaSettingsUpdatedSubject.next(settings);
            }
          });
          const signalSubject = new Subject();
          const signalDispatcher = new CallSignalDispatcher(this.kitty.stompX, call);
          const receivedCallSignalUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.signals,
            event: 'call.signal.created',
            onSuccess: signal => {
              signalSubject.next(signal);
            }
          });

          let end = () => {
            var _userMediaSettingsUpd, _participantLeftCallU, _participantDeclinedC, _participantAcceptedC;

            (_userMediaSettingsUpd = userMediaSettingsUpdatedUnsubscribe) === null || _userMediaSettingsUpd === void 0 ? void 0 : _userMediaSettingsUpd();
            (_participantLeftCallU = participantLeftCallUnsubscribe) === null || _participantLeftCallU === void 0 ? void 0 : _participantLeftCallU();
            (_participantDeclinedC = participantDeclinedCallUnsubscribe) === null || _participantDeclinedC === void 0 ? void 0 : _participantDeclinedC();
            (_participantAcceptedC = participantAcceptedCallUnsubscribe) === null || _participantAcceptedC === void 0 ? void 0 : _participantAcceptedC();
            receivedCallSignalUnsubscribe();
            signalsSubscription.unsubscribe();
          };

          const connections = new Map();
          const endedCallUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.self,
            event: 'call.self.ended',
            onSuccess: endedCall => {
              end();
              connections.forEach(connection => connection.close());
              connections.clear();
              this.callEndedSubject.next(endedCall);
            }
          });
          const activeCallUnsubscribe = this.kitty.stompX.listenForEvent({
            topic: call._topics.self,
            event: 'call.self.active',
            onSuccess: c => {
              this.currentCall = c;
            }
          });

          const onCreateOffer = async signal => {
            const peer = signal.peer;

            if (connections.has(peer.id)) {
              return;
            }

            const connection = new P2PConnection(peer, this.localStream, signalDispatcher, (user, stream) => this.participantActiveSubject.next({
              user,
              stream
            }));
            await connection.createOffer();
            connections.set(peer.id, connection);
          };

          const onAnswerOffer = signal => {
            const peer = signal.peer;

            if (connections.has(peer.id)) {
              return;
            }

            const connection = new P2PConnection(peer, this.localStream, signalDispatcher, (user, stream) => this.participantActiveSubject.next({
              user,
              stream
            }));
            connections.set(peer.id, connection);
          };

          const onDisconnect = signal => {
            const connection = connections.get(signal.peer.id);

            if (connection) {
              connection.close();
            }
          };

          const signalsSubscription = signalSubject.subscribe({
            next: async signal => {
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
            }
          });
          const callUnsubscribe = this.kitty.stompX.listenToTopic({
            topic: call._topics.self,
            onSuccess: () => {
              const participantsUnsubscribe = this.kitty.stompX.listenToTopic({
                topic: call._topics.participants
              });
              const userMediaSettingsUnsubscribe = this.kitty.stompX.listenToTopic({
                topic: call._topics.userMediaSettings
              });
              const signalsUnsubscribe = this.kitty.stompX.listenToTopic({
                topic: call._topics.signals
              });
              const superEnd = end;

              end = () => {
                superEnd();
                participantsUnsubscribe();
                userMediaSettingsUnsubscribe();
                signalsUnsubscribe();
                activeCallUnsubscribe();
                endedCallUnsubscribe();
                callUnsubscribe();
              };

              this.kitty.stompX.sendAction({
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
                }
              });
            }
          });
        });
      }

    }(this));

    this.stompX = new StompX({
      isSecure: configuration.isSecure === undefined || configuration.isSecure,
      host: configuration.host || 'api.chatkitty.com',
      isDebug: !environment.production
    });
    this.keyStrokesSubject.asObservable().pipe(debounceTime(150)).subscribe(request => {
      let destination = '';
      const channel = request.channel;
      const thread = request.thread;

      if (channel) {
        destination = channel._actions.keystrokes;
      }

      if (thread) {
        destination = thread._actions.keystrokes;
      }

      this.stompX.sendAction({
        destination,
        body: {
          keys: request.keys
        }
      });
    });
  }

  startSession(request) {
    if (this.stompX.initialized) {
      throw new SessionActiveError();
    }

    return new Promise(resolve => {
      this.stompX.connect({
        apiKey: this.configuration.apiKey,
        username: request.username,
        authParams: request.authParams,
        onSuccess: (user, writeFileGrant, readFileGrant) => {
          this.stompX.listenToTopic({
            topic: user._topics.self
          });
          this.stompX.listenToTopic({
            topic: user._topics.channels
          });
          this.stompX.listenToTopic({
            topic: user._topics.messages
          });
          this.stompX.listenToTopic({
            topic: user._topics.notifications
          });
          this.stompX.listenToTopic({
            topic: user._topics.contacts
          });
          this.stompX.listenToTopic({
            topic: user._topics.participants
          });
          this.stompX.listenToTopic({
            topic: user._topics.users
          });
          this.stompX.listenToTopic({
            topic: user._topics.reactions
          });
          this.stompX.listenToTopic({
            topic: user._topics.threads
          });
          this.stompX.listenToTopic({
            topic: user._topics.calls
          });
          this.writeFileGrant = writeFileGrant;
          this.messageMapper = new MessageMapper(readFileGrant);
          resolve(new StartedSessionResult({
            user: user
          }));
        },
        onConnected: user => {
          this.currentUser = user;
          this.currentUserSubject.next(user);
        },
        onConnectionLost: () => this.lostConnectionSubject.next(),
        onConnectionResumed: () => this.resumedConnectionSubject.next(),
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  endSession() {
    return new Promise((resolve, reject) => {
      this.stompX.disconnect({
        onSuccess: () => {
          this.currentUser = undefined;
          this.currentUserSubject.next(null);
          resolve();
        },
        onError: e => {
          reject(e);
        }
      });
    });
  }

  getCurrentUser() {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: currentUser._relays.self,
        onSuccess: user => {
          resolve(new GetCurrentUserSuccessfulResult(user));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  onCurrentUserChanged(onNextOrObserver) {
    const subscription = this.currentUserSubject.subscribe(user => {
      if (typeof onNextOrObserver === 'function') {
        onNextOrObserver(user);
      } else {
        onNextOrObserver.onNext(user);
      }
    });
    return () => subscription.unsubscribe();
  }

  onCurrentUserOnline(onNextOrObserver) {
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

  onCurrentUserOffline(onNextOrObserver) {
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

  updateCurrentUser(update) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: currentUser._actions.update,
        body: update(currentUser),
        onSuccess: user => {
          this.currentUserSubject.next(user);
          resolve(new UpdatedCurrentUserResult(user));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  updateCurrentUserDisplayPicture(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      const file = request.file; // eslint-disable-next-line no-undef

      if (file instanceof Blob) {
        this.stompX.sendToStream({
          stream: currentUser._streams.displayPicture,
          grant: this.writeFileGrant,
          blob: file,
          onSuccess: user => {
            resolve(new UpdatedCurrentUserDisplayPictureResult(user));
          },
          onError: error => {
            resolve(new ChatKittyFailedResult(error));
          },
          progressListener: {
            onStarted: () => {
              var _request$progressList, _request$progressList2;

              return (_request$progressList = request.progressListener) === null || _request$progressList === void 0 ? void 0 : (_request$progressList2 = _request$progressList.onStarted) === null || _request$progressList2 === void 0 ? void 0 : _request$progressList2.call(_request$progressList);
            },
            onProgress: progress => {
              var _request$progressList3;

              return (_request$progressList3 = request.progressListener) === null || _request$progressList3 === void 0 ? void 0 : _request$progressList3.onProgress(progress);
            },
            onCompleted: () => {
              var _request$progressList4;

              return (_request$progressList4 = request.progressListener) === null || _request$progressList4 === void 0 ? void 0 : _request$progressList4.onCompleted(ChatKittyUploadResult.COMPLETED);
            },
            onFailed: () => {
              var _request$progressList5;

              return (_request$progressList5 = request.progressListener) === null || _request$progressList5 === void 0 ? void 0 : _request$progressList5.onCompleted(ChatKittyUploadResult.FAILED);
            },
            onCancelled: () => {
              var _request$progressList6;

              return (_request$progressList6 = request.progressListener) === null || _request$progressList6 === void 0 ? void 0 : _request$progressList6.onCompleted(ChatKittyUploadResult.CANCELLED);
            }
          }
        });
      } else {
        this.stompX.sendAction({
          destination: currentUser._actions.updateDisplayPicture,
          body: file,
          onSuccess: user => {
            resolve(new UpdatedCurrentUserResult(user));
          },
          onError: error => {
            resolve(new ChatKittyFailedResult(error));
          }
        });
      }
    });
  }

  updateChannel(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.update,
        body: request.channel,
        onSuccess: channel => {
          resolve(new UpdatedChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  deleteChannel(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.delete,
        body: {},
        onSuccess: () => {
          resolve(new DeletedChannelResult());
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  createChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: currentUser._actions.createChannel,
        events: ['user.channel.created', 'user.channel.upserted', 'member.channel.upserted'],
        body: request,
        onSuccess: channel => {
          resolve(new CreatedChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getChannels(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      var _request$filter5;

      const parameters = {};
      let relay = currentUser._relays.channels;

      if (isGetChannelsRequest(request)) {
        var _request$filter2, _request$filter3, _request$filter4;

        if (((_request$filter2 = request.filter) === null || _request$filter2 === void 0 ? void 0 : _request$filter2.joined) === false) {
          relay = currentUser._relays.joinableChannels;
        }

        if (((_request$filter3 = request.filter) === null || _request$filter3 === void 0 ? void 0 : _request$filter3.joined) === true) {
          parameters.subscribable = true;
        }

        if ((_request$filter4 = request.filter) !== null && _request$filter4 !== void 0 && _request$filter4.unread) {
          relay = currentUser._relays.unreadChannels;
        }
      }

      const name = request === null || request === void 0 ? void 0 : (_request$filter5 = request.filter) === null || _request$filter5 === void 0 ? void 0 : _request$filter5.name;

      if (name) {
        parameters.name = name;
      }

      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: relay,
        contentName: 'channels',
        parameters: parameters
      }).then(paginator => resolve(new GetChannelsSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getChannel(id) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: ChatKitty.channelRelay(id),
        onSuccess: channel => {
          resolve(new GetChannelSucceededResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  joinChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.join;

    if (!destination) {
      throw new ChannelNotPubliclyJoinableError(request.channel);
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: destination,
        body: request,
        onSuccess: channel => {
          resolve(new JoinedChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  leaveChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const destination = request.channel._actions.leave;

    if (!destination) {
      throw new NotAChannelMemberError(request.channel);
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: destination,
        body: {},
        onSuccess: channel => {
          resolve(new LeftChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  addChannelModerator(request) {
    const destination = request.channel._actions.addModerator;

    if (!destination) {
      throw new CannotAddModeratorToChannelError(request.channel);
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: destination,
        body: request.user,
        onSuccess: channel => {
          resolve(new AddedChannelModeratorResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getUnreadChannelsCount(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const parameters = {
      unread: true
    };

    if (isGetChannelsUnreadRequest(request)) {
      var _request$filter6;

      parameters.type = (_request$filter6 = request.filter) === null || _request$filter6 === void 0 ? void 0 : _request$filter6.type;
    }

    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: currentUser._relays.channelsCount,
        parameters: parameters,
        onSuccess: resource => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getChannelUnread(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.channel._relays.unread,
        onSuccess: resource => {
          resolve(new GetChannelUnreadSucceededResult(resource.exists));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  readChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.read,
        body: {},
        onSent: () => resolve(new ReadChannelSucceededResult(request.channel)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  muteChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.mute,
        body: {
          state: 'ON'
        },
        onSuccess: channel => {
          resolve(new MutedChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  unmuteChannel(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.mute,
        body: {
          state: 'OFF'
        },
        onSuccess: channel => {
          resolve(new UnmutedChannelResult(channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  clearChannelHistory(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.clearHistory,
        body: {},
        onSuccess: channel => resolve(new ClearChannelHistorySucceededResult(channel)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  hideChannel(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.hide,
        body: {},
        onSuccess: resource => resolve(new HideChannelSucceededResult(resource)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  startChatSession(request) {
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
    let receivedMessageUnsubscribe;
    let receivedKeystrokesUnsubscribe;
    let participantEnteredChatUnsubscribe;
    let participantLeftChatUnsubscribe;
    let typingStartedUnsubscribe;
    let typingStoppedUnsubscribe;
    let participantPresenceChangedUnsubscribe;
    let eventTriggeredUnsubscribe;
    let messageUpdatedUnsubscribe;
    let channelUpdatedUnsubscribe;
    let messageReadUnsubscribe;
    let messageReactionAddedUnsubscribe;
    let messageReactionRemovedUnsubscribe;
    let threadReceivedMessageUnsubscribe;
    let threadReceivedKeystrokesUnsubscribe;
    let threadTypingStartedUnsubscribe;
    let threadTypingStoppedUnsubscribe;

    if (onReceivedMessage) {
      receivedMessageUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.messages,
        event: 'channel.message.created',
        onSuccess: message => {
          const destination = message._relays.parent;

          if (destination) {
            this.stompX.relayResource({
              destination,
              onSuccess: parent => {
                onReceivedMessage(this.messageMapper.map(message), this.messageMapper.map(parent));
              }
            });
          } else {
            onReceivedMessage(this.messageMapper.map(message));
          }
        }
      });
    }

    if (onReceivedKeystrokes) {
      receivedKeystrokesUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.keystrokes,
        event: 'thread.keystrokes.created',
        onSuccess: keystrokes => {
          onReceivedKeystrokes(keystrokes);
        }
      });
    }

    if (onTypingStarted) {
      typingStartedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.typing,
        event: 'thread.typing.started',
        onSuccess: user => {
          onTypingStarted(user);
        }
      });
    }

    if (onTypingStopped) {
      typingStoppedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.typing,
        event: 'thread.typing.stopped',
        onSuccess: user => {
          onTypingStopped(user);
        }
      });
    }

    if (onParticipantEnteredChat) {
      participantEnteredChatUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.participants,
        event: 'channel.participant.active',
        onSuccess: user => {
          onParticipantEnteredChat(user);
        }
      });
    }

    if (onParticipantLeftChat) {
      participantLeftChatUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.participants,
        event: 'channel.participant.inactive',
        onSuccess: user => {
          onParticipantLeftChat(user);
        }
      });
    }

    if (onParticipantPresenceChanged) {
      participantPresenceChangedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.participants,
        event: 'participant.presence.changed',
        onSuccess: user => {
          onParticipantPresenceChanged(user);
        }
      });
    }

    if (onMessageUpdated) {
      messageUpdatedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.messages,
        event: 'channel.message.updated',
        onSuccess: message => {
          onMessageUpdated(message);
        }
      });
    }

    if (onEventTriggered) {
      eventTriggeredUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.events,
        event: 'channel.event.triggered',
        onSuccess: event => {
          onEventTriggered(event);
        }
      });
    }

    if (onChannelUpdated) {
      channelUpdatedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.self,
        event: 'channel.self.updated',
        onSuccess: channel => {
          onChannelUpdated(channel);
        }
      });
    }

    if (onMessageRead) {
      messageReadUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.readReceipts,
        event: 'message.read_receipt.created',
        onSuccess: receipt => {
          this.stompX.relayResource({
            destination: receipt._relays.message,
            onSuccess: message => {
              onMessageRead(message, receipt);
            }
          });
        }
      });
    }

    if (onMessageReactionAdded) {
      messageReactionAddedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.created',
        onSuccess: reaction => {
          this.stompX.relayResource({
            destination: reaction._relays.message,
            onSuccess: message => {
              onMessageReactionAdded(message, reaction);
            }
          });
        }
      });
    }

    if (onMessageReactionRemoved) {
      messageReactionRemovedUnsubscribe = this.stompX.listenForEvent({
        topic: request.channel._topics.reactions,
        event: 'message.reaction.removed',
        onSuccess: reaction => {
          this.stompX.relayResource({
            destination: reaction._relays.message,
            onSuccess: message => {
              onMessageReactionRemoved(message, reaction);
            }
          });
        }
      });
    }

    let end = () => {
      var _messageReactionRemov, _messageReactionAdded, _messageReadUnsubscri, _channelUpdatedUnsubs, _messageUpdatedUnsubs, _eventTriggeredUnsubs, _participantPresenceC, _participantLeftChatU, _participantEnteredCh, _typingStoppedUnsubsc, _typingStartedUnsubsc, _receivedKeystrokesUn, _receivedMessageUnsub, _threadReceivedMessag, _threadReceivedKeystr, _threadTypingStartedU, _threadTypingStoppedU;

      (_messageReactionRemov = messageReactionRemovedUnsubscribe) === null || _messageReactionRemov === void 0 ? void 0 : _messageReactionRemov();
      (_messageReactionAdded = messageReactionAddedUnsubscribe) === null || _messageReactionAdded === void 0 ? void 0 : _messageReactionAdded();
      (_messageReadUnsubscri = messageReadUnsubscribe) === null || _messageReadUnsubscri === void 0 ? void 0 : _messageReadUnsubscri();
      (_channelUpdatedUnsubs = channelUpdatedUnsubscribe) === null || _channelUpdatedUnsubs === void 0 ? void 0 : _channelUpdatedUnsubs();
      (_messageUpdatedUnsubs = messageUpdatedUnsubscribe) === null || _messageUpdatedUnsubs === void 0 ? void 0 : _messageUpdatedUnsubs();
      (_eventTriggeredUnsubs = eventTriggeredUnsubscribe) === null || _eventTriggeredUnsubs === void 0 ? void 0 : _eventTriggeredUnsubs();
      (_participantPresenceC = participantPresenceChangedUnsubscribe) === null || _participantPresenceC === void 0 ? void 0 : _participantPresenceC();
      (_participantLeftChatU = participantLeftChatUnsubscribe) === null || _participantLeftChatU === void 0 ? void 0 : _participantLeftChatU();
      (_participantEnteredCh = participantEnteredChatUnsubscribe) === null || _participantEnteredCh === void 0 ? void 0 : _participantEnteredCh();
      (_typingStoppedUnsubsc = typingStoppedUnsubscribe) === null || _typingStoppedUnsubsc === void 0 ? void 0 : _typingStoppedUnsubsc();
      (_typingStartedUnsubsc = typingStartedUnsubscribe) === null || _typingStartedUnsubsc === void 0 ? void 0 : _typingStartedUnsubsc();
      (_receivedKeystrokesUn = receivedKeystrokesUnsubscribe) === null || _receivedKeystrokesUn === void 0 ? void 0 : _receivedKeystrokesUn();
      (_receivedMessageUnsub = receivedMessageUnsubscribe) === null || _receivedMessageUnsub === void 0 ? void 0 : _receivedMessageUnsub();
      (_threadReceivedMessag = threadReceivedMessageUnsubscribe) === null || _threadReceivedMessag === void 0 ? void 0 : _threadReceivedMessag();
      (_threadReceivedKeystr = threadReceivedKeystrokesUnsubscribe) === null || _threadReceivedKeystr === void 0 ? void 0 : _threadReceivedKeystr();
      (_threadTypingStartedU = threadTypingStartedUnsubscribe) === null || _threadTypingStartedU === void 0 ? void 0 : _threadTypingStartedU();
      (_threadTypingStoppedU = threadTypingStoppedUnsubscribe) === null || _threadTypingStoppedU === void 0 ? void 0 : _threadTypingStoppedU();
    };

    const channelUnsubscribe = this.stompX.listenToTopic({
      topic: request.channel._topics.self,
      onSuccess: () => {
        const messagesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.messages
        });
        const keystrokesUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.keystrokes
        });
        const typingUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.typing
        });
        const participantsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.participants
        });
        const readReceiptsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.readReceipts
        });
        const reactionsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.reactions
        });
        const eventsUnsubscribe = this.stompX.listenToTopic({
          topic: request.channel._topics.events
        });
        const superEnd = end;

        end = () => {
          superEnd();
          eventsUnsubscribe === null || eventsUnsubscribe === void 0 ? void 0 : eventsUnsubscribe();
          reactionsUnsubscribe === null || reactionsUnsubscribe === void 0 ? void 0 : reactionsUnsubscribe();
          readReceiptsUnsubscribe === null || readReceiptsUnsubscribe === void 0 ? void 0 : readReceiptsUnsubscribe();
          participantsUnsubscribe === null || participantsUnsubscribe === void 0 ? void 0 : participantsUnsubscribe();
          typingUnsubscribe === null || typingUnsubscribe === void 0 ? void 0 : typingUnsubscribe();
          keystrokesUnsubscribe === null || keystrokesUnsubscribe === void 0 ? void 0 : keystrokesUnsubscribe();
          messagesUnsubscribe === null || messagesUnsubscribe === void 0 ? void 0 : messagesUnsubscribe();
          channelUnsubscribe();
          this.chatSessions.delete(request.channel.id);
        };
      }
    });
    let activeThread = null;
    const session = {
      channel: request.channel,
      thread: activeThread,
      end: () => end(),
      setThread: thread => {
        var _threadReceivedMessag2, _threadReceivedKeystr2, _threadTypingStartedU2, _threadTypingStoppedU2;

        (_threadReceivedMessag2 = threadReceivedMessageUnsubscribe) === null || _threadReceivedMessag2 === void 0 ? void 0 : _threadReceivedMessag2();
        (_threadReceivedKeystr2 = threadReceivedKeystrokesUnsubscribe) === null || _threadReceivedKeystr2 === void 0 ? void 0 : _threadReceivedKeystr2();
        (_threadTypingStartedU2 = threadTypingStartedUnsubscribe) === null || _threadTypingStartedU2 === void 0 ? void 0 : _threadTypingStartedU2();
        (_threadTypingStoppedU2 = threadTypingStoppedUnsubscribe) === null || _threadTypingStoppedU2 === void 0 ? void 0 : _threadTypingStoppedU2();

        if (onThreadReceivedMessage) {
          threadReceivedMessageUnsubscribe = this.stompX.listenForEvent({
            topic: thread._topics.messages,
            event: 'thread.message.created',
            onSuccess: message => {
              onThreadReceivedMessage(thread, this.messageMapper.map(message));
            }
          });
        }

        if (onThreadReceivedKeystrokes) {
          threadReceivedKeystrokesUnsubscribe = this.stompX.listenForEvent({
            topic: thread._topics.keystrokes,
            event: 'thread.keystrokes.created',
            onSuccess: keystrokes => {
              onThreadReceivedKeystrokes(thread, keystrokes);
            }
          });
        }

        if (onThreadTypingStarted) {
          threadTypingStartedUnsubscribe = this.stompX.listenForEvent({
            topic: thread._topics.typing,
            event: 'thread.typing.started',
            onSuccess: user => {
              onThreadTypingStarted(thread, user);
            }
          });
        }

        if (onThreadTypingStopped) {
          threadTypingStoppedUnsubscribe = this.stompX.listenForEvent({
            topic: thread._topics.typing,
            event: 'thread.typing.stopped',
            onSuccess: user => {
              onThreadTypingStopped(thread, user);
            }
          });
        }

        activeThread = thread;
      }
    };
    this.chatSessions.set(request.channel.id, session);
    return new StartedChatSessionResult(session);
  }

  sendMessage(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      let destination = '';
      let stream = '';
      const sendChannelMessageRequest = request;

      if (sendChannelMessageRequest.channel !== undefined) {
        destination = sendChannelMessageRequest.channel._actions.message;
        stream = sendChannelMessageRequest.channel._streams.messages;
      }

      const sendMessageReplyRequest = request;

      if (sendMessageReplyRequest.message !== undefined) {
        destination = sendMessageReplyRequest.message._actions.reply;
        stream = sendMessageReplyRequest.message._streams.replies;
      }

      const sendThreadMessageRequest = request;

      if (sendThreadMessageRequest.thread !== undefined) {
        destination = sendThreadMessageRequest.thread._actions.message;
        stream = sendThreadMessageRequest.thread._streams.messages;
      }

      if (isSendChannelTextMessageRequest(request)) {
        this.stompX.sendAction({
          destination: destination,
          body: {
            type: 'TEXT',
            body: request.body,
            groupTag: request.groupTag,
            properties: request.properties
          },
          onSuccess: message => {
            resolve(new SentTextMessageResult(this.messageMapper.map(message)));
          },
          onError: error => {
            resolve(new ChatKittyFailedResult(error));
          }
        });
      }

      if (isSendChannelFileMessageRequest(request)) {
        const file = request.file;

        if (isCreateChatKittyExternalFileProperties(file)) {
          this.stompX.sendAction({
            destination: destination,
            body: {
              type: 'FILE',
              file: file,
              groupTag: request.groupTag,
              properties: request.properties
            },
            onSuccess: message => {
              resolve(new SentFileMessageResult(this.messageMapper.map(message)));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            }
          });
        } else {
          const properties = new Map();

          if (request.groupTag) {
            properties.set('groupTag', request.groupTag);
          }

          if (request.properties) {
            properties.set('properties', request.properties);
          }

          this.stompX.sendToStream({
            stream: stream,
            grant: this.writeFileGrant,
            blob: file,
            properties: properties,
            onSuccess: message => {
              resolve(new SentFileMessageResult(this.messageMapper.map(message)));
            },
            onError: error => {
              resolve(new ChatKittyFailedResult(error));
            },
            progressListener: {
              onStarted: () => {
                var _request$progressList7, _request$progressList8;

                return (_request$progressList7 = request.progressListener) === null || _request$progressList7 === void 0 ? void 0 : (_request$progressList8 = _request$progressList7.onStarted) === null || _request$progressList8 === void 0 ? void 0 : _request$progressList8.call(_request$progressList7);
              },
              onProgress: progress => {
                var _request$progressList9;

                return (_request$progressList9 = request.progressListener) === null || _request$progressList9 === void 0 ? void 0 : _request$progressList9.onProgress(progress);
              },
              onCompleted: () => {
                var _request$progressList10;

                return (_request$progressList10 = request.progressListener) === null || _request$progressList10 === void 0 ? void 0 : _request$progressList10.onCompleted(ChatKittyUploadResult.COMPLETED);
              },
              onFailed: () => {
                var _request$progressList11;

                return (_request$progressList11 = request.progressListener) === null || _request$progressList11 === void 0 ? void 0 : _request$progressList11.onCompleted(ChatKittyUploadResult.FAILED);
              },
              onCancelled: () => {
                var _request$progressList12;

                return (_request$progressList12 = request.progressListener) === null || _request$progressList12 === void 0 ? void 0 : _request$progressList12.onCompleted(ChatKittyUploadResult.CANCELLED);
              }
            }
          });
        }
      }
    });
  }

  getMessages(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = '';
    let parameters;

    if (isGetChannelMessagesRequest(request)) {
      relay = request.channel._relays.messages;
      parameters = { ...request.filter
      };
    }

    if (isGetMessageRepliesRequest(request)) {
      relay = request.message._relays.replies;
    }

    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: relay,
        parameters: parameters,
        contentName: 'messages',
        mapper: message => this.messageMapper.map(message)
      }).then(paginator => resolve(new GetMessagesSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUnreadMessagesCount(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    let relay = currentUser._relays.unreadMessagesCount;

    if (isGetUnreadMessagesCountRequest(request)) {
      relay = request.channel._relays.messagesCount;
    }

    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: relay,
        parameters: {
          unread: true
        },
        onSuccess: resource => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  triggerEvent(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.triggerEvent,
        body: {
          type: request.type,
          properties: request.properties
        },
        onSent: () => {
          resolve(new TriggeredEventResult(request.channel));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  readMessage(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.read,
        body: {},
        onSent: () => resolve(new ReadMessageSucceededResult(request.message)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  getLastReadMessage(request) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.channel._relays.lastReadMessage,
        parameters: {
          username: request.username
        },
        onSuccess: resource => {
          resolve(new GetLastReadMessageResult(resource));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  editMessage(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.edit,
        body: {
          body: request.body
        },
        onSuccess: message => resolve(new EditedMessageSucceededResult(message)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  getMessageRepliesCount(request) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.message._relays.repliesCount,
        onSuccess: resource => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getMessageChannel(request) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.message._relays.channel,
        onSuccess: resource => {
          resolve(new GetMessageChannelSucceededResult(resource));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getMessageParent(request) {
    return new Promise(resolve => {
      const destination = request.message._relays.parent;

      if (!destination) {
        throw new MessageNotAReplyError(request.message);
      }

      this.stompX.relayResource({
        destination,
        onSuccess: resource => {
          resolve(new GetMessageParentSucceededResult(resource));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  createThread(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.channel._actions.createThread,
        body: {
          name: request.name,
          properties: request.properties
        },
        onSuccess: thread => resolve(new CreatedThreadResult(thread)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  getThreads(request) {
    var _request$filter7, _request$filter8;

    const parameters = {};

    if (((_request$filter7 = request.filter) === null || _request$filter7 === void 0 ? void 0 : _request$filter7.includeMainThread) === false) {
      parameters.includeMainThread = false;
    }

    if (((_request$filter8 = request.filter) === null || _request$filter8 === void 0 ? void 0 : _request$filter8.standalone) === true) {
      parameters.standalone = true;
    }

    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: request.channel._relays.threads,
        contentName: 'threads',
        parameters
      }).then(paginator => resolve(new GetThreadsSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getThreadChannel(request) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.thread._relays.channel,
        onSuccess: resource => {
          resolve(new GetThreadChannelSucceededResult(resource));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  getThreadMessage(request) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.thread._relays.message,
        onSuccess: resource => {
          resolve(new GetThreadMessageSucceededResult(resource));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  readThread(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.thread._actions.read,
        body: {},
        onSent: () => resolve(new ReadThreadSucceededResult(request.thread)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  reactToMessage(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.react,
        body: {
          emoji: request.emoji
        },
        onSuccess: reaction => resolve(new ReactedToMessageResult(reaction)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  getReactions(request) {
    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: request.message._relays.reactions,
        contentName: 'reactions'
      }).then(paginator => resolve(new GetReactionsSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  removeReaction(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.removeReaction,
        body: {
          emoji: request.emoji
        },
        onSuccess: reaction => resolve(new RemovedReactionResult(reaction)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  deleteMessageForMe(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.deleteForMe,
        body: {},
        onSuccess: resource => resolve(new DeleteMessageForMeSucceededResult(resource)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  deleteMessage(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.message._actions.delete,
        body: {},
        onSuccess: resource => resolve(new DeleteMessageSucceededResult(resource)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  sendKeystrokes(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    this.keyStrokesSubject.next(request);
  }

  onNotificationReceived(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.notifications,
      event: 'user.notification.created',
      onSuccess: notification => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(notification);
        } else {
          onNextOrObserver.onNext(notification);
        }
      }
    });
    return () => unsubscribe;
  }

  onChannelJoined(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.channels,
      event: 'user.channel.joined',
      onSuccess: channel => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      }
    });
    return () => unsubscribe;
  }

  onChannelHidden(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.channels,
      event: 'user.channel.hidden',
      onSuccess: channel => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      }
    });
    return () => unsubscribe;
  }

  onChannelUnhidden(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.channels,
      event: 'user.channel.unhidden',
      onSuccess: channel => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      }
    });
    return () => unsubscribe;
  }

  onChannelLeft(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.channels,
      event: 'user.channel.left',
      onSuccess: channel => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      }
    });
    return () => unsubscribe;
  }

  onChannelUpdated(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.channels,
      event: 'user.channel.updated',
      onSuccess: channel => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(channel);
        } else {
          onNextOrObserver.onNext(channel);
        }
      }
    });
    return () => unsubscribe;
  }

  getChannelMembers(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: request.channel._relays.members,
        contentName: 'users',
        parameters: { ...request.filter
        }
      }).then(paginator => resolve(new GetUsersSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getReadReceipts(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: request.message._relays.readReceipts,
        contentName: 'receipts'
      }).then(paginator => resolve(new GetReadReceiptsSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUsers(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      let parameters;

      if (isGetUsersRequest(request)) {
        parameters = { ...request.filter
        };
      }

      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: currentUser._relays.contacts,
        contentName: 'users',
        parameters: parameters
      }).then(paginator => resolve(new GetUsersSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  getUsersCount(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      let parameters;

      if (isGetUsersRequest(request)) {
        parameters = { ...request.filter
        };
      }

      this.stompX.relayResource({
        destination: currentUser._relays.contactsCount,
        parameters: parameters,
        onSuccess: resource => {
          resolve(new GetCountSucceedResult(resource.count));
        },
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  onUserPresenceChanged(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.contacts,
      event: 'contact.presence.changed',
      onSuccess: user => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(user);
        } else {
          onNextOrObserver.onNext(user);
        }
      }
    });
    return () => unsubscribe;
  }

  inviteUser(request) {
    const destination = request.channel._actions.invite;

    if (!destination) {
      throw new ChannelNotInvitableError(request.channel);
    }

    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: destination,
        body: {
          user: request.user
        },
        onSuccess: resource => {
          resolve(new InvitedUserResult(resource));
        },
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  onParticipantStartedTyping(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.participants,
      event: 'participant.typing.started',
      onSuccess: participant => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      }
    });
    return () => unsubscribe;
  }

  onParticipantStoppedTyping(onNextOrObserver) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    const unsubscribe = this.stompX.listenForEvent({
      topic: currentUser._topics.participants,
      event: 'participant.typing.stopped',
      onSuccess: participant => {
        if (typeof onNextOrObserver === 'function') {
          onNextOrObserver(participant);
        } else {
          onNextOrObserver.onNext(participant);
        }
      }
    });
    return () => unsubscribe;
  }

  getUser(param) {
    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: ChatKitty.userRelay(param),
        onSuccess: user => {
          resolve(new GetUserSucceededResult(user));
        }
      });
    });
  }

  getUserIsChannelMember(request) {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      this.stompX.relayResource({
        destination: request.user._relays.channelMember,
        parameters: {
          channelId: request.channel.id
        },
        onSuccess: resource => {
          resolve(new GetUserIsChannelMemberSucceededResult(resource.exists));
        },
        onError: error => {
          resolve(new ChatKittyFailedResult(error));
        }
      });
    });
  }

  blockUser(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: `/application/v1/users/${request.user.id}.block`,
        body: {},
        onSuccess: resource => {
          resolve(new BlockUserSucceededResult(resource));
        },
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

  getUserBlockList() {
    const currentUser = this.currentUser;

    if (!currentUser) {
      throw new NoActiveSessionError();
    }

    return new Promise(resolve => {
      ChatKittyPaginator.createInstance({
        stompX: this.stompX,
        relay: currentUser._relays.userBlockListItems,
        contentName: 'items'
      }).then(paginator => resolve(new GetUserBlockListSucceededResult(paginator))).catch(error => resolve(new ChatKittyFailedResult(error)));
    });
  }

  deleteUserBlockListItem(request) {
    return new Promise(resolve => {
      this.stompX.sendAction({
        destination: request.item._actions.delete,
        body: {},
        onSuccess: resource => resolve(new DeleteUserBlockListItemSucceededResult(resource)),
        onError: error => resolve(new ChatKittyFailedResult(error))
      });
    });
  }

}

_defineProperty(ChatKitty, "_instances", new Map());

class MessageMapper {
  constructor(grant) {
    _defineProperty(this, "readFileGrant", void 0);

    this.readFileGrant = grant;
  }

  map(message) {
    if (isFileMessage(message)) {
      return { ...message,
        file: { ...message.file,
          url: message.file.url + `?grant=${this.readFileGrant}`
        }
      };
    } else {
      return { ...message
      };
    }
  }

}

function isGetChannelsRequest(param) {
  const request = param;
  return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}

function isGetUsersRequest(param) {
  const request = param;
  return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}

function isGetChannelsUnreadRequest(param) {
  const request = param;
  return (request === null || request === void 0 ? void 0 : request.filter) !== undefined;
}

function isGetUnreadMessagesCountRequest(param) {
  const request = param;
  return (request === null || request === void 0 ? void 0 : request.channel) !== undefined;
}

function isSendChannelTextMessageRequest(request) {
  return request.body !== undefined;
}

function isSendChannelFileMessageRequest(request) {
  return request.file !== undefined;
}

function isGetChannelMessagesRequest(request) {
  return request.channel !== undefined;
}

function isGetMessageRepliesRequest(request) {
  return request.message !== undefined;
}

function isCreateChatKittyExternalFileProperties(result) {
  return result.url !== undefined;
}

class P2PConnection {
  constructor(peer, stream, signalDispatcher, onParticipantActive) {
    this.peer = peer;
    this.stream = stream;
    this.signalDispatcher = signalDispatcher;
    this.onParticipantActive = onParticipantActive;

    _defineProperty(this, "offerAnswerOptions", void 0);

    _defineProperty(this, "rtcPeerConnection", void 0);

    _defineProperty(this, "createOffer", async () => {
      const description = await this.rtcPeerConnection.createOffer(this.offerAnswerOptions);
      await this.rtcPeerConnection.setLocalDescription(description);
      this.signalDispatcher.dispatch({
        type: 'SEND_DESCRIPTION',
        peer: this.peer,
        payload: description
      });
    });

    _defineProperty(this, "answerOffer", async description => {
      await this.rtcPeerConnection.setRemoteDescription(description);

      if (description.type === 'offer') {
        const answer = await this.rtcPeerConnection.createAnswer(this.offerAnswerOptions);
        await this.rtcPeerConnection.setLocalDescription(answer);
        this.signalDispatcher.dispatch({
          type: 'SEND_DESCRIPTION',
          peer: this.peer,
          payload: answer
        });
      }
    });

    _defineProperty(this, "addCandidate", async candidate => {
      await this.rtcPeerConnection.addIceCandidate(candidate);
    });

    _defineProperty(this, "close", () => {
      this.rtcPeerConnection.close();
    });

    this.offerAnswerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    };
    this.rtcPeerConnection = new RTCPeerConnection(P2PConnection.rtcConfiguration);

    this.rtcPeerConnection.onicecandidate = event => {
      if (event.candidate) {
        signalDispatcher.dispatch({
          type: 'ADD_CANDIDATE',
          peer: {
            id: peer.id
          },
          payload: event.candidate
        });
      }
    };

    this.rtcPeerConnection.onaddstream = event => {
      var _this$onParticipantAc;

      (_this$onParticipantAc = this.onParticipantActive) === null || _this$onParticipantAc === void 0 ? void 0 : _this$onParticipantAc.call(this, peer, event.stream);
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

}

_defineProperty(P2PConnection, "rtcConfiguration", {
  iceServers: [{
    username: 'participant',
    credential: 'chatkittyturn0',
    urls: ['turn:3.215.180.233:3478']
  }]
});

class CallSignalDispatcher {
  constructor(stompX, call) {
    this.stompX = stompX;
    this.call = call;

    _defineProperty(this, "dispatch", request => {
      this.stompX.sendAction({
        destination: this.call._actions.signal,
        body: request
      });
    });
  }

}

export default ChatKitty;
//# sourceMappingURL=chatkitty.js.map