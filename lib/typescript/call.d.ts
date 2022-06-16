import { ChatKittyUserReference, User } from './user';
import { Channel } from './channel';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyError } from './error';
export declare type Call = ConferenceCall | PresenterCall;
declare type CallProperties = {
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
export declare type ConferenceCall = CallProperties;
export declare type PresenterCall = CallProperties;
export interface CallRelays {
    self: string;
    participants: string;
}
export interface CallTopics {
    self: string;
    participants: string;
    userMediaSettings: string;
    signals: string;
}
export interface CallActions {
    ready: string;
    decline: string;
    signal: string;
}
export declare function isConferenceCall(call: Call): call is ConferenceCall;
export declare function isPresenterCall(call: Call): call is PresenterCall;
declare type StartChannelCallRequest = {
    channel: Channel;
    type?: string;
};
declare type StartDirectCallRequest = {
    members: ChatKittyUserReference[];
};
export declare type StartCallRequest = (StartChannelCallRequest | StartDirectCallRequest) & {
    properties?: unknown;
};
export declare type StartCallResult = StartedCallResult | ChatKittyFailedResult;
export declare class StartedCallResult extends ChatKittySucceededResult {
    call: Call;
    constructor(call: Call);
}
export interface GetCallsRequest {
    channel: Channel;
    filter?: GetCallsFilter;
}
export interface GetCallsFilter {
    active?: boolean;
}
export declare type GetCallsResult = GetCallsSucceededResult | ChatKittyFailedResult;
export declare class GetCallsSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<Call>;
    constructor(paginator: ChatKittyPaginator<Call>);
}
export declare type GetCallResult = GetCallSucceededResult | ChatKittyFailedResult;
export declare class GetCallSucceededResult extends ChatKittySucceededResult {
    call: Call;
    constructor(call: Call);
}
export interface AcceptCallRequest {
    call: Call;
}
export declare type AcceptCallResult = AcceptedCallResult | ChatKittyFailedResult;
export declare class AcceptedCallResult extends ChatKittySucceededResult {
    call: Call;
    constructor(call: Call);
}
export interface DeclineCallRequest {
    call: Call;
}
export declare type DeclineCallResult = DeclinedCallResult | ChatKittyFailedResult;
export declare class DeclinedCallResult extends ChatKittySucceededResult {
    call: Call;
    constructor(call: Call);
}
export declare class NoActiveCallError extends ChatKittyError {
    constructor();
}
export {};
