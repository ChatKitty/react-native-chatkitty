"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreatedCallSignalResult = void 0;
exports.createdCallSignal = createdCallSignal;
exports.isAddCandidateCallSignal = isAddCandidateCallSignal;
exports.isAnswerOfferCallSignal = isAnswerOfferCallSignal;
exports.isCreateOfferCallSignal = isCreateOfferCallSignal;
exports.isDisconnectPeerCallSignal = isDisconnectPeerCallSignal;
exports.isSendDescriptionCallSignal = isSendDescriptionCallSignal;

var _result = require("./result");

function isCreateOfferCallSignal(signal) {
  return signal.type === 'CREATE_OFFER';
}

function isAnswerOfferCallSignal(signal) {
  return signal.type === 'ANSWER_OFFER';
}

function isAddCandidateCallSignal(signal) {
  return signal.type === 'ADD_CANDIDATE';
}

function isSendDescriptionCallSignal(signal) {
  return signal.type === 'SEND_DESCRIPTION';
}

function isDisconnectPeerCallSignal(signal) {
  return signal.type === 'DISCONNECT_PEER';
}

class CreatedCallSignalResult extends _result.ChatKittySucceededResult {
  constructor(signal) {
    super();
    this.signal = signal;
  }

}

exports.CreatedCallSignalResult = CreatedCallSignalResult;

function createdCallSignal(result) {
  return result.signal !== undefined;
}
//# sourceMappingURL=call-signal.js.map