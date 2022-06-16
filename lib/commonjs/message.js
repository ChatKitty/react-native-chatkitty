"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SentTextMessageResult = exports.SentFileMessageResult = exports.ReadMessageSucceededResult = exports.MessageNotAReplyError = exports.GetMessagesSucceededResult = exports.GetMessageParentSucceededResult = exports.GetMessageChannelSucceededResult = exports.GetLastReadMessageResult = exports.EditedMessageSucceededResult = exports.DeleteMessageSucceededResult = exports.DeleteMessageForMeSucceededResult = void 0;
exports.isFileMessage = isFileMessage;
exports.isSystemMessage = isSystemMessage;
exports.isTextMessage = isTextMessage;
exports.isUserMessage = isUserMessage;
exports.sentFileMessage = sentFileMessage;
exports.sentTextMessage = sentTextMessage;

var _error = require("./error");

var _result = require("./result");

function isTextMessage(message) {
  return message.body !== undefined;
}

function isFileMessage(message) {
  return message.file !== undefined;
}

function isUserMessage(message) {
  return message.user !== undefined;
}

function isSystemMessage(message) {
  return message.user === undefined;
}

class GetMessagesSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetMessagesSucceededResult = GetMessagesSucceededResult;

class GetLastReadMessageResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.GetLastReadMessageResult = GetLastReadMessageResult;

class ReadMessageSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.ReadMessageSucceededResult = ReadMessageSucceededResult;

class EditedMessageSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.EditedMessageSucceededResult = EditedMessageSucceededResult;

class DeleteMessageForMeSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.DeleteMessageForMeSucceededResult = DeleteMessageForMeSucceededResult;

class DeleteMessageSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.DeleteMessageSucceededResult = DeleteMessageSucceededResult;

class SentTextMessageResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.SentTextMessageResult = SentTextMessageResult;

class SentFileMessageResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.SentFileMessageResult = SentFileMessageResult;

function sentTextMessage(result) {
  const message = result.message;
  return message !== undefined && message.type === 'TEXT';
}

function sentFileMessage(result) {
  const message = result.message;
  return message !== undefined && message.type === 'FILE';
}

class GetMessageChannelSucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.GetMessageChannelSucceededResult = GetMessageChannelSucceededResult;

class GetMessageParentSucceededResult extends _result.ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}

exports.GetMessageParentSucceededResult = GetMessageParentSucceededResult;

class MessageNotAReplyError extends _error.ChatKittyError {
  constructor(messageModel) {
    super('MessageNotAReplyError', `Message ${messageModel.id} is not a reply.`);
    this.messageModel = messageModel;
  }

}

exports.MessageNotAReplyError = MessageNotAReplyError;
//# sourceMappingURL=message.js.map