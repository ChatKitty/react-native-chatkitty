"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartedChatSessionResult = void 0;

var _result = require("./result");

class StartedChatSessionResult extends _result.ChatKittySucceededResult {
  constructor(session) {
    super();
    this.session = session;
  }

}

exports.StartedChatSessionResult = StartedChatSessionResult;
//# sourceMappingURL=chat-session.js.map