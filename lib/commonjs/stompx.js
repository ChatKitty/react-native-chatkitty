"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxStomp = require("@stomp/rx-stomp");

var _stompjs = require("@stomp/stompjs");

var _axios = _interopRequireDefault(require("axios"));

var _operators = require("rxjs/operators");

var _uuid = require("uuid");

var _base = require("base-64");

var _version = require("./environment/version");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let TransportFallback;
Promise.resolve().then(() => _interopRequireWildcard(require('sockjs-client'))).then(sockjs => {
  TransportFallback = sockjs;
}).catch(error => {
  ErrorMessageTransportFallback.errorMessage = error.message;
  TransportFallback = {
    default: ErrorMessageTransportFallback
  };
});

class ErrorMessageTransportFallback {
  constructor() {
    throw new Error('Encountered error when attempting to use transport fallback: ' + ErrorMessageTransportFallback.errorMessage);
  }

}

_defineProperty(ErrorMessageTransportFallback, "errorMessage", void 0);

class StompX {
  constructor(configuration) {
    _defineProperty(this, "host", void 0);

    _defineProperty(this, "wsScheme", void 0);

    _defineProperty(this, "httpScheme", void 0);

    _defineProperty(this, "rxStompConfig", void 0);

    _defineProperty(this, "axios", void 0);

    _defineProperty(this, "topics", new Map());

    _defineProperty(this, "pendingActions", new Map());

    _defineProperty(this, "pendingRelayErrors", new Map());

    _defineProperty(this, "pendingActionErrors", new Map());

    _defineProperty(this, "eventHandlers", new Map());

    _defineProperty(this, "rxStomp", new _rxStomp.RxStomp());

    _defineProperty(this, "initialized", false);

    this.host = configuration.host;

    if (configuration.isSecure) {
      this.wsScheme = 'wss';
      this.httpScheme = 'https';
    } else {
      this.wsScheme = 'ws';
      this.httpScheme = 'http';
    }

    this.rxStompConfig = {
      stompVersions: new _stompjs.Versions(['1.2']),
      connectionTimeout: 60000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 60000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: message => {
        if (configuration.isDebug) {
          console.log('StompX Debug:\n' + message);
        }
      }
    };
    this.axios = _axios.default.create({
      baseURL: this.httpScheme + '://' + this.host
    });
  }

  connect(request) {
    const host = this.host;
    const headers = {
      'StompX-User': request.username,
      'StompX-User-Agent': `ChatKitty-RN/${_version.version}`
    };

    if (request.authParams) {
      headers['StompX-Auth-Params'] = (0, _base.encode)(JSON.stringify(request.authParams));
    }

    if (typeof WebSocket === 'function') {
      this.rxStompConfig.brokerURL = `${this.wsScheme}://${host}/rtm/websocket?api-key=${encodeURIComponent(request.apiKey)}`;
    } else {
      this.rxStompConfig.webSocketFactory = () => {
        return new TransportFallback.default(`${this.httpScheme}://${host}/rtm?api-key=${encodeURIComponent(request.apiKey)}`);
      };
    }

    this.rxStomp.configure({ ...this.rxStompConfig,
      connectHeaders: headers
    });
    this.rxStomp.activate();
    this.rxStomp.connected$.subscribe(() => {
      this.relayResource({
        destination: '/application/v1/user.relay',
        onSuccess: user => {
          if (this.initialized) {
            request.onConnected(user);
          } else {
            this.rxStomp.watch('/user/queue/v1/errors', {
              id: StompX.generateSubscriptionId()
            }).subscribe(message => {
              const error = JSON.parse(message.body);
              const subscription = message.headers['subscription-id'];
              const receipt = message.headers['receipt-id'];

              if (subscription) {
                const handler = this.pendingRelayErrors.get(subscription);

                if (handler) {
                  handler(error);
                  this.pendingRelayErrors.delete(subscription);
                }
              }

              if (receipt) {
                const handler = this.pendingActionErrors.get(receipt);

                if (handler) {
                  handler(error);
                  this.pendingActionErrors.delete(receipt);
                }
              }

              if (!subscription && !receipt) {
                this.pendingActionErrors.forEach(handler => {
                  handler(error);
                });
                this.pendingActionErrors.clear();
              }
            });
            this.relayResource({
              destination: '/application/v1/user.write_file_access_grant.relay',
              onSuccess: write => {
                this.relayResource({
                  destination: '/application/v1/user.read_file_access_grant.relay',
                  onSuccess: read => {
                    request.onSuccess(user, write.grant, read.grant);
                    request.onConnected(user);
                    this.initialized = true;
                  }
                });
              }
            });
          }
        }
      });
    });
    this.rxStomp.connectionState$.subscribe(state => {
      if (state === _rxStomp.RxStompState.CLOSED) {
        request.onConnectionLost();
      }

      if (state === _rxStomp.RxStompState.OPEN) {
        request.onConnectionResumed();
      }
    });
    this.rxStomp.stompErrors$.subscribe(frame => {
      let error;

      try {
        error = JSON.parse(frame.body);
      } catch (e) {
        error = {
          error: 'UnknownChatKittyError',
          message: 'An unknown error occurred.',
          timestamp: new Date().toISOString()
        };
      }

      if (error.error === 'AccessDeniedError') {
        const onResult = () => request.onError(error);

        this.disconnect({
          onSuccess: onResult,
          onError: onResult
        });
      } else {
        request.onError(error);
      }
    });
    this.rxStomp.webSocketErrors$.subscribe(() => {
      request.onError({
        error: 'ChatKittyConnectionError',
        message: 'Could not connect to ChatKitty',
        timestamp: new Date().toISOString()
      });
    });
  }

  relayResource(request) {
    this.guardConnected(() => {
      const subscriptionId = StompX.generateSubscriptionId();

      if (request.onError) {
        this.pendingRelayErrors.set(subscriptionId, request.onError);
      }

      this.rxStomp.stompClient.subscribe(request.destination, message => {
        request.onSuccess(JSON.parse(message.body).resource);
      }, { ...request.parameters,
        id: subscriptionId
      });
    });
  }

  listenToTopic(request) {
    let unsubscribe = () => {// Do nothing
    };

    this.guardConnected(() => {
      const subscriptionReceipt = StompX.generateReceipt();
      const onSuccess = request.onSuccess;

      if (onSuccess) {
        this.rxStomp.watchForReceipt(subscriptionReceipt, () => {
          onSuccess();
        });
      }

      const subscription = this.rxStomp.watch(request.topic, {
        id: StompX.generateSubscriptionId(),
        receipt: subscriptionReceipt,
        ack: 'client-individual'
      }).subscribe(message => {
        const event = JSON.parse(message.body);
        const receipt = message.headers['receipt-id'];

        if (receipt) {
          const action = this.pendingActions.get(receipt);

          if (action && (!action.types || action.types.find(type => type === event.type))) {
            action.action(event.resource);
            this.pendingActions.delete(receipt);
          }
        }

        const handlers = this.eventHandlers.get(request.topic);

        if (handlers) {
          handlers.forEach(handler => {
            if (handler.event === event.type) {
              handler.onSuccess(event.resource);
            }
          });
        }

        message.ack();
      });
      this.topics.set(request.topic, subscription);

      unsubscribe = () => {
        subscription.unsubscribe();
        this.topics.delete(request.topic);
      };
    });
    return () => unsubscribe();
  }

  listenForEvent(request) {
    let handlers = this.eventHandlers.get(request.topic);

    if (handlers === undefined) {
      handlers = new Set();
    }

    const handler = {
      event: request.event,
      onSuccess: request.onSuccess
    };
    handlers.add(handler);
    this.eventHandlers.set(request.topic, handlers);
    return () => {
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  sendAction(request) {
    this.guardConnected(() => {
      const receipt = StompX.generateReceipt();

      if (request.onSent) {
        this.rxStomp.watchForReceipt(receipt, request.onSent);
      }

      if (request.onSuccess) {
        this.pendingActions.set(receipt, {
          types: request.events,
          action: request.onSuccess
        });
      }

      if (request.onError) {
        this.pendingActionErrors.set(receipt, request.onError);
      }

      this.rxStomp.publish({
        destination: request.destination,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'receipt': receipt
        },
        body: JSON.stringify(request.body)
      });
    });
  }

  sendToStream(request) {
    var _request$properties, _request$progressList, _request$progressList2;

    const data = new FormData();
    data.append('file', request.blob);
    (_request$properties = request.properties) === null || _request$properties === void 0 ? void 0 : _request$properties.forEach((value, key) => {
      data.append(key, JSON.stringify(value));
    });
    (_request$progressList = request.progressListener) === null || _request$progressList === void 0 ? void 0 : (_request$progressList2 = _request$progressList.onStarted) === null || _request$progressList2 === void 0 ? void 0 : _request$progressList2.call(_request$progressList);
    this.axios({
      method: 'post',
      url: request.stream,
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Grant': request.grant
      },
      onUploadProgress: progressEvent => {
        var _request$progressList3, _request$progressList4;

        (_request$progressList3 = request.progressListener) === null || _request$progressList3 === void 0 ? void 0 : (_request$progressList4 = _request$progressList3.onProgress) === null || _request$progressList4 === void 0 ? void 0 : _request$progressList4.call(_request$progressList3, progressEvent.loaded / progressEvent.total);
      }
    }).then(response => {
      var _request$progressList5, _request$progressList6, _request$onSuccess;

      (_request$progressList5 = request.progressListener) === null || _request$progressList5 === void 0 ? void 0 : (_request$progressList6 = _request$progressList5.onCompleted) === null || _request$progressList6 === void 0 ? void 0 : _request$progressList6.call(_request$progressList5);
      (_request$onSuccess = request.onSuccess) === null || _request$onSuccess === void 0 ? void 0 : _request$onSuccess.call(request, response.data);
    }).catch(error => {
      var _request$progressList7, _request$progressList8, _request$onError;

      (_request$progressList7 = request.progressListener) === null || _request$progressList7 === void 0 ? void 0 : (_request$progressList8 = _request$progressList7.onFailed) === null || _request$progressList8 === void 0 ? void 0 : _request$progressList8.call(_request$progressList7);
      (_request$onError = request.onError) === null || _request$onError === void 0 ? void 0 : _request$onError.call(request, error);
    });
  }

  disconnect(request) {
    this.initialized = false;
    this.rxStomp.deactivate().then(request.onSuccess).catch(request.onError);
    this.rxStomp = new _rxStomp.RxStomp();
  }

  guardConnected(action) {
    this.rxStomp.connected$.pipe((0, _operators.take)(1)).subscribe(() => {
      action();
    });
  }

  static generateSubscriptionId() {
    return 'subscription-id-' + (0, _uuid.v4)();
  }

  static generateReceipt() {
    return 'receipt-' + (0, _uuid.v4)();
  }

}

exports.default = StompX;
//# sourceMappingURL=stompx.js.map