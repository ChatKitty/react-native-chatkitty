import { ChatKittyUserReference, User } from './user';
import { Channel } from './channel';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyError } from './error';

export type Call = ConferenceCall | PresenterCall;

type CallProperties = {
  id: number;
  type: string;
  creator: User;
  state: string;
  p2p: boolean;
  properties: unknown;
  createdTime: string;
  endTime?: string;
  _relays: CallRelays;
  _topics: CallTopics;
  _actions: CallActions;
};

export type ConferenceCall = CallProperties;

export type PresenterCall = CallProperties;

export interface CallRelays {
  self: string;
}

export interface CallTopics {
  self: string;
  participants: string;
  signals: string;
}

export interface CallActions {
  ready: string;
  reject: string;
  signal: string;
}

export function isConferenceCall(call: Call): call is ConferenceCall {
  return call.type === 'CONFERENCE';
}

export function isPresenterCall(call: Call): call is PresenterCall {
  return call.type === 'PRESENTER';
}

type StartChannelCallRequest = {
  channel: Channel;
  type?: string;
};

type StartDirectCallRequest = {
  members: ChatKittyUserReference[];
};

export type StartCallRequest = (
  | StartChannelCallRequest
  | StartDirectCallRequest
) & {
  properties?: unknown;
};

export type StartCallResult = StartedCallResult | ChatKittyFailedResult;

export class StartedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export interface GetCallsRequest {
  channel: Channel;
  filter?: GetCallsFilter;
}

export interface GetCallsFilter {
  active?: boolean;
}

export type GetCallsResult = GetCallsSucceededResult | ChatKittyFailedResult;

export class GetCallsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Call>) {
    super();
  }
}

export type GetCallResult = GetCallSucceededResult | ChatKittyFailedResult;

export class GetCallSucceededResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export interface AcceptCallRequest {
  call: Call;
}

export type AcceptCallResult = AcceptedCallResult | ChatKittyFailedResult;

export class AcceptedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export interface RejectCallRequest {
  call: Call;
}

export type RejectCallResult = RejectedCallResult | ChatKittyFailedResult;

export class RejectedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export class NoActiveCallError extends ChatKittyError {
  constructor() {
    super('NoActiveCallError', "You're not currently in a call.");
  }
}
