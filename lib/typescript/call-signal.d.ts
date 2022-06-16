import { RTCIceCandidateType, RTCSessionDescriptionType } from 'react-native-webrtc';
import { User } from './user';
import { ChatKittyModelReference } from './model';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
export declare type CallSignal = CreateOfferCallSignal | AnswerOfferCallSignal | AddCandidateCallSignal | SendDescriptionCallSignal | DisconnectPeerCallSignal;
declare type CallSignalProperties = {
    type: string;
    peer: User;
    createdTime: string;
};
declare type SystemCallSignal = CallSignalProperties;
declare type ClientCallSignal = {
    payload: unknown;
} & CallSignalProperties;
export declare type CreateOfferCallSignal = SystemCallSignal;
export declare type AnswerOfferCallSignal = SystemCallSignal;
export declare type AddCandidateCallSignal = {
    payload: RTCIceCandidateType;
} & ClientCallSignal;
export declare type SendDescriptionCallSignal = {
    payload: RTCSessionDescriptionType;
} & ClientCallSignal;
export declare type DisconnectPeerCallSignal = SystemCallSignal;
export declare function isCreateOfferCallSignal(signal: CallSignal): signal is CreateOfferCallSignal;
export declare function isAnswerOfferCallSignal(signal: CallSignal): signal is AnswerOfferCallSignal;
export declare function isAddCandidateCallSignal(signal: CallSignal): signal is AddCandidateCallSignal;
export declare function isSendDescriptionCallSignal(signal: CallSignal): signal is SendDescriptionCallSignal;
export declare function isDisconnectPeerCallSignal(signal: CallSignal): signal is DisconnectPeerCallSignal;
export interface CreateCallSignalRequest {
    type: string;
    peer: ChatKittyModelReference;
    payload: RTCIceCandidateType | RTCSessionDescriptionType;
}
export declare type CreateCallSignalResult = CreatedCallSignalResult | ChatKittyFailedResult;
export declare class CreatedCallSignalResult extends ChatKittySucceededResult {
    signal: CallSignal;
    constructor(signal: CallSignal);
}
export declare function createdCallSignal(result: CreateCallSignalResult): result is CreatedCallSignalResult;
export {};
