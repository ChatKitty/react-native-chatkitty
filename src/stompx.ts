import { RxStomp, RxStompConfig, RxStompState } from '@stomp/rx-stomp';
import { StompHeaders, Versions } from '@stomp/stompjs';
import Axios, { AxiosInstance } from 'axios';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { v4 } from 'uuid';

import { version } from './environment/version';

let TransportFallback: { default: { new (arg: string): unknown } };

import('sockjs-client')
  .then((sockjs) => {
    TransportFallback = sockjs;
  })
  .catch((error) => {
    ErrorMessageTransportFallback.errorMessage = error.message;

    TransportFallback = { default: ErrorMessageTransportFallback };
  });

class ErrorMessageTransportFallback {
  static errorMessage: string;

  constructor() {
    throw new Error(
      'Encountered error when attempting to use transport fallback: ' +
        ErrorMessageTransportFallback.errorMessage
    );
  }
}

export default class StompX {
  private readonly host: string;

  private readonly wsScheme: string;

  private readonly httpScheme: string;

  private readonly rxStompConfig: RxStompConfig;

  private readonly axios: AxiosInstance;

  private readonly rxStomp: RxStomp = new RxStomp();

  private readonly topics: Map<string, Subscription> = new Map();

  private readonly pendingActions: Map<string, (resource: unknown) => void> =
    new Map();

  private readonly pendingRelayErrors: Map<
    string,
    (error: StompXError) => void
  > = new Map();

  private readonly pendingActionErrors: Map<
    string,
    (error: StompXError) => void
  > = new Map();

  private readonly eventHandlers: Map<
    string,
    Set<StompXEventHandler<unknown>>
  > = new Map();

  public initialized = false;

  constructor(configuration: StompXConfiguration) {
    this.host = configuration.host;

    if (configuration.isSecure) {
      this.wsScheme = 'wss';
      this.httpScheme = 'https';
    } else {
      this.wsScheme = 'ws';
      this.httpScheme = 'http';
    }

    this.rxStompConfig = {
      stompVersions: new Versions(['1.2']),
      connectionTimeout: 60000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 60000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      debug: (message) => {
        if (configuration.isDebug) {
          console.log('StompX Debug:\n' + message);
        }
      },
    };

    this.axios = Axios.create({
      baseURL: this.httpScheme + '://' + this.host,
    });
  }

  public connect<U>(request: StompXConnectRequest<U>) {
    const host = this.host;

    const headers: StompHeaders = {
      'StompX-User': request.username,
      'StompX-User-Agent': `ChatKitty-JS/${version}`,
    };

    if (request.authParams) {
      headers['StompX-Auth-Params'] = JSON.stringify(request.authParams);
    }

    if (typeof WebSocket === 'function') {
      this.rxStompConfig.brokerURL = `${
        this.wsScheme
      }://${host}/stompx/websocket?api_key=${encodeURIComponent(
        request.apiKey
      )}`;
    } else {
      this.rxStompConfig.webSocketFactory = () => {
        return new TransportFallback.default(
          `${this.httpScheme}://${host}/stompx?api_key=${encodeURIComponent(
            request.apiKey
          )}`
        );
      };
    }

    this.rxStomp.configure({
      ...this.rxStompConfig,
      connectHeaders: headers,
    });

    this.rxStomp.activate();

    this.rxStomp.connected$.subscribe(() => {
      this.relayResource<U>({
        destination: '/application/v1/users/me.relay',
        onSuccess: (user) => {
          if (this.initialized) {
            request.onConnected(user);
          } else {
            this.rxStomp
              .watch('/user/queue/v1/errors', {
                id: StompX.generateSubscriptionId(),
              })
              .subscribe((message) => {
                const error: StompXError = JSON.parse(message.body);

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
                  this.pendingActionErrors.forEach((handler) => {
                    handler(error);
                  });

                  this.pendingActionErrors.clear();
                }
              });

            this.relayResource<{ grant: string }>({
              destination:
                '/application/v1/users/me.write_file_access_grant.relay',
              onSuccess: (write) => {
                this.relayResource<{ grant: string }>({
                  destination:
                    '/application/v1/users/me.read_file_access_grant.relay',
                  onSuccess: (read) => {
                    request.onSuccess(user, write.grant, read.grant);

                    request.onConnected(user);

                    this.initialized = true;
                  },
                });
              },
            });
          }
        },
      });
    });

    this.rxStomp.connectionState$.subscribe((state) => {
      if (state == RxStompState.CLOSED) {
        request.onConnectionLost();
      }

      if (state == RxStompState.OPEN) {
        request.onConnectionResumed();
      }
    });

    this.rxStomp.stompErrors$.subscribe((frame) => {
      let error: StompXError;

      try {
        error = JSON.parse(frame.body);
      } catch (e) {
        error = {
          error: 'UnknownChatKittyError',
          message: 'An unknown error occurred.',
          timestamp: new Date().toISOString(),
        };
      }

      if (error.error == 'AccessDeniedError') {
        const onResult = () => request.onError(error);

        this.disconnect({ onSuccess: onResult, onError: onResult });
      }
    });

    this.rxStomp.webSocketErrors$.subscribe(() => {
      request.onError({
        error: 'ChatKittyConnectionError',
        message: 'Could not connect to ChatKitty',
        timestamp: new Date().toISOString(),
      });
    });
  }

  public relayResource<R>(request: StompXRelayResourceRequest<R>) {
    this.guardConnected(() => {
      const subscriptionId = StompX.generateSubscriptionId();

      if (request.onError) {
        this.pendingRelayErrors.set(subscriptionId, request.onError);
      }

      this.rxStomp.stompClient.subscribe(
        request.destination,
        (message) => {
          request.onSuccess(JSON.parse(message.body).resource);
        },
        {
          ...request.parameters,
          id: subscriptionId,
        }
      );
    });
  }

  public listenToTopic(request: StompXListenToTopicRequest): () => void {
    let unsubscribe = () => {
      // Do nothing
    };

    this.guardConnected(() => {
      const subscriptionReceipt = StompX.generateReceipt();

      const onSuccess = request.onSuccess;

      if (onSuccess) {
        this.rxStomp.watchForReceipt(subscriptionReceipt, () => {
          onSuccess();
        });
      }

      const subscription = this.rxStomp
        .watch(request.topic, {
          id: StompX.generateSubscriptionId(),
          receipt: subscriptionReceipt,
          ack: 'client-individual',
        })
        .subscribe((message) => {
          const event: StompXEvent<unknown> = JSON.parse(message.body);

          const receipt = message.headers['receipt-id'];

          if (receipt) {
            const action = this.pendingActions.get(receipt);

            if (action) {
              action(event.resource);

              this.pendingActions.delete(receipt);
            }
          }

          const handlers = this.eventHandlers.get(request.topic);

          if (handlers) {
            handlers.forEach((handler) => {
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

  public listenForEvent<R>(
    request: StompXListenForEventRequest<R>
  ): () => void {
    let handlers = this.eventHandlers.get(request.topic);

    if (handlers === undefined) {
      handlers = new Set<StompXEventHandler<unknown>>();
    }

    const handler = {
      event: request.event,
      onSuccess: request.onSuccess as (resource: unknown) => void,
    };

    handlers.add(handler);

    this.eventHandlers.set(request.topic, handlers);

    return () => {
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  public sendAction<R>(request: StompXPerformActionRequest<R>) {
    this.guardConnected(() => {
      const receipt = StompX.generateReceipt();

      if (request.onSent) {
        this.rxStomp.watchForReceipt(receipt, request.onSent);
      }

      if (request.onSuccess) {
        this.pendingActions.set(
          receipt,
          request.onSuccess as (resource: unknown) => void
        );
      }

      if (request.onError) {
        this.pendingActionErrors.set(receipt, request.onError);
      }

      this.rxStomp.publish({
        destination: request.destination,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'receipt': receipt,
        },
        body: JSON.stringify(request.body),
      });
    });
  }

  public sendToStream<R>(request: StompXSendToStreamRequest<R>) {
    const data = new FormData();

    data.append('file', request.blob);

    request.properties?.forEach((value, key) => {
      data.append(key, JSON.stringify(value));
    });

    request.progressListener?.onStarted?.();

    this.axios({
      method: 'post',
      url: request.stream,
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Grant': request.grant,
      },
      onUploadProgress: (progressEvent) => {
        request.progressListener?.onProgress?.(
          progressEvent.loaded / progressEvent.total
        );
      },
    })
      .then((response) => {
        request.progressListener?.onCompleted?.();

        request.onSuccess?.(response.data);
      })
      .catch((error) => {
        request.progressListener?.onFailed?.();

        request.onError?.(error);
      });
  }

  public disconnect(request: StompXDisconnectRequest) {
    this.initialized = false;

    this.rxStomp.deactivate().then(request.onSuccess).catch(request.onError);
  }

  private guardConnected(action: () => void) {
    this.rxStomp.connected$.pipe(take(1)).subscribe(() => {
      action();
    });
  }

  private static generateSubscriptionId(): string {
    return 'subscription-id-' + v4();
  }

  private static generateReceipt(): string {
    return 'receipt-' + v4();
  }
}

export interface StompXConfiguration {
  isSecure: boolean;
  host: string;
  isDebug: boolean;
}

export interface StompXConnectRequest<U> {
  apiKey: string;
  username: string;
  authParams?: unknown;
  onSuccess: (user: U, writeFileGrant: string, readFileGrant: string) => void;
  onConnected: (user: U) => void;
  onConnectionLost: () => void;
  onConnectionResumed: () => void;
  onError: (error: StompXError) => void;
}

export interface StompXDisconnectRequest {
  onSuccess: () => void;
  onError: (e: unknown) => void;
}

export interface StompXListenForEventRequest<R> {
  topic: string;
  event: string;
  onSuccess: (resource: R) => void;
}

export interface StompXListenToTopicRequest {
  topic: string;
  onSuccess?: () => void;
}

export interface StompXPage {
  _embedded?: Record<string, unknown>;
  page: StompXPageMetadata;
  _relays: StompXPageRelays;
}

export interface StompXPageMetadata {
  size: number;
  totalElement: number;
  totalPages: number;
  number: number;
}

export interface StompXPageRelays {
  first?: string;
  prev?: string;
  self: string;
  next?: string;
  last?: string;
}

export interface StompXRelayParameters {
  [key: string]: unknown;
}

export interface StompXPerformActionRequest<R> {
  destination: string;
  body: unknown;
  onSent?: () => void;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
}

export interface StompXRelayResourceRequest<R> {
  destination: string;
  parameters?: StompXRelayParameters;
  onSuccess: (resource: R) => void;
  onError?: (error: StompXError) => void;
}

export interface StompXSendToStreamRequest<R> {
  stream: string;
  grant: string;
  blob: unknown;
  properties?: Map<string, unknown>;
  onSuccess?: (resource: R) => void;
  onError?: (error: StompXError) => void;
  progressListener?: StompXUploadProgressListener;
}

export interface StompXEvent<R> {
  type: string;
  version: string;
  resource: R;
}

export interface StompXError {
  error: string;
  message: string;
  timestamp: string;
}

export interface StompXEventHandler<R> {
  event: string;
  onSuccess: (resource: R) => void;
}

export interface StompXUploadProgressListener {
  onStarted?: () => void;
  onProgress?: (progress: number) => void;
  onCompleted?: () => void;
  onFailed?: () => void;
  onCancelled?: () => void;
}
