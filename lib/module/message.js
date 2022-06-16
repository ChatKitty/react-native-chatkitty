import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export function isTextMessage(message) {
  return message.body !== undefined;
}
export function isFileMessage(message) {
  return message.file !== undefined;
}
export function isUserMessage(message) {
  return message.user !== undefined;
}
export function isSystemMessage(message) {
  return message.user === undefined;
}
export class GetMessagesSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class GetLastReadMessageResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class ReadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class EditedMessageSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class DeleteMessageForMeSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class DeleteMessageSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class SentTextMessageResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class SentFileMessageResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export function sentTextMessage(result) {
  const message = result.message;
  return message !== undefined && message.type === 'TEXT';
}
export function sentFileMessage(result) {
  const message = result.message;
  return message !== undefined && message.type === 'FILE';
}
export class GetMessageChannelSucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class GetMessageParentSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class MessageNotAReplyError extends ChatKittyError {
  constructor(messageModel) {
    super('MessageNotAReplyError', `Message ${messageModel.id} is not a reply.`);
    this.messageModel = messageModel;
  }

}
//# sourceMappingURL=message.js.map