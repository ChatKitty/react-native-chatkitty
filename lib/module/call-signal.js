import { ChatKittySucceededResult } from './result';
export function isCreateOfferCallSignal(signal) {
  return signal.type === 'CREATE_OFFER';
}
export function isAnswerOfferCallSignal(signal) {
  return signal.type === 'ANSWER_OFFER';
}
export function isAddCandidateCallSignal(signal) {
  return signal.type === 'ADD_CANDIDATE';
}
export function isSendDescriptionCallSignal(signal) {
  return signal.type === 'SEND_DESCRIPTION';
}
export function isDisconnectPeerCallSignal(signal) {
  return signal.type === 'DISCONNECT_PEER';
}
export class CreatedCallSignalResult extends ChatKittySucceededResult {
  constructor(signal) {
    super();
    this.signal = signal;
  }

}
export function createdCallSignal(result) {
  return result.signal !== undefined;
}
//# sourceMappingURL=call-signal.js.map