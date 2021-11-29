import { Channel } from './channel';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

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

interface CallRelays {
  self: string;
}

interface CallTopics {
  self: string;
  participants: string;
  signals: string;
}

interface CallActions {
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

export interface StartCallRequest {
  channel: Channel;
  type?: string;
  properties?: unknown;
}

export type StartCallResult = StartedCallResult | ChatKittyFailedResult;

export class StartedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export function startedCall(
  result: StartCallResult
): result is StartedCallResult {
  return (result as StartedCallResult).call !== undefined;
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

export interface RejectCallRequest {
  call: Call;
}

export type RejectCallResult = RejectedCallResult | ChatKittyFailedResult;

export class RejectedCallResult extends ChatKittySucceededResult {
  constructor(public call: Call) {
    super();
  }
}

export function rejectedCall(
  result: RejectCallRequest
): result is RejectedCallResult {
  return (result as RejectedCallResult).call !== undefined;
}
