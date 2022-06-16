"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartedSessionResult = exports.SessionActiveError = exports.NoActiveSessionError = void 0;

var _error = require("./error");

var _result = require("./result");

class StartedSessionResult extends _result.ChatKittySucceededResult {
  constructor(session) {
    super();
    this.session = session;
  }

}

exports.StartedSessionResult = StartedSessionResult;

class SessionActiveError extends _error.ChatKittyError {
  constructor() {
    super('SessionActiveError', 'A user session is already active and must be ended before this instance can start a new session.');
  }

}

exports.SessionActiveError = SessionActiveError;

class NoActiveSessionError extends _error.ChatKittyError {
  constructor() {
    super('NoActiveSessionError', "You're not connected to ChatKitty.");
  }

}

exports.NoActiveSessionError = NoActiveSessionError;
//# sourceMappingURL=user-session.js.map