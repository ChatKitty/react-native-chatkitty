"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartedCallResult = exports.NoActiveCallError = exports.GetCallsSucceededResult = exports.GetCallSucceededResult = exports.DeclinedCallResult = exports.AcceptedCallResult = void 0;
exports.isConferenceCall = isConferenceCall;
exports.isPresenterCall = isPresenterCall;

var _result = require("./result");

var _error = require("./error");

function isConferenceCall(call) {
  return call.type === 'CONFERENCE';
}

function isPresenterCall(call) {
  return call.type === 'PRESENTER';
}

class StartedCallResult extends _result.ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}

exports.StartedCallResult = StartedCallResult;

class GetCallsSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetCallsSucceededResult = GetCallsSucceededResult;

class GetCallSucceededResult extends _result.ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}

exports.GetCallSucceededResult = GetCallSucceededResult;

class AcceptedCallResult extends _result.ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}

exports.AcceptedCallResult = AcceptedCallResult;

class DeclinedCallResult extends _result.ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}

exports.DeclinedCallResult = DeclinedCallResult;

class NoActiveCallError extends _error.ChatKittyError {
  constructor() {
    super('NoActiveCallError', "You're not currently in a call.");
  }

}

exports.NoActiveCallError = NoActiveCallError;
//# sourceMappingURL=call.js.map