import { Channel } from './channel';

export interface Keystrokes {
  username: string;
  keys: string;
  _relays: KeystrokesRelays;
}

export interface KeystrokesRelays {
  thread: string;
  user: string;
}

export type SendKeystrokesRequest = SendChannelKeystrokesRequest;

export interface SendChannelKeystrokesRequest {
  channel: Channel;
  keys: string;
}
