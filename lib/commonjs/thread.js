"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadThreadSucceededResult = exports.GetThreadsSucceededResult = exports.GetThreadMessageSucceededResult = exports.GetThreadChannelSucceededResult = exports.CreatedThreadResult = void 0;

var _result = require("./result");

class CreatedThreadResult extends _result.ChatKittySucceededResult {
  constructor(thread) {
    super();
    this.thread = thread;
  }

}

exports.CreatedThreadResult = CreatedThreadResult;

class GetThreadsSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetThreadsSucceededResult = GetThreadsSucceededResult;

class GetThreadChannelSucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.GetThreadChannelSucceededResult = GetThreadChannelSucceededResult;

class GetThreadMessageSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.GetThreadMessageSucceededResult = GetThreadMessageSucceededResult;

class ReadThreadSucceededResult extends _result.ChatKittySucceededResult {
  constructor(thread) {
    super();
    this.thread = thread;
  }

}

exports.ReadThreadSucceededResult = ReadThreadSucceededResult;
//# sourceMappingURL=thread.js.map