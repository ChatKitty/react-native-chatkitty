import { MediaStream } from 'react-native-webrtc';

import { Call } from './call';
import { ChatKittyUnsubscribe } from './observer';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export interface CallSession {
  call: Call;
  stream: MediaStream;
  end: ChatKittyUnsubscribe;
}

export interface StartCallSessionRequest {
  call: Call;
  stream: MediaStream;
  onParticipantAcceptedCall?: (user: User) => void;
  onParticipantRejectedCall?: (user: User) => void;
  onParticipantEnteredCall?: (user: User) => void;
  onParticipantAddedStream?: (user: User, stream: MediaStream) => void;
  onParticipantLeftCall?: (user: User) => void;
  onCallEnded?: (call: Call) => void;
}

export type StartCallSessionResult =
  | StartedCallSessionResult
  | ChatKittyFailedResult;

export class StartedCallSessionResult extends ChatKittySucceededResult {
  constructor(public session: CallSession) {
    super();
  }
}

export function startedCallSession(
  result: StartCallSessionResult
): result is StartedCallSessionResult {
  return (result as StartedCallSessionResult).session !== undefined;
}
