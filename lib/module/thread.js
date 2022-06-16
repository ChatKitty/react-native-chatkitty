import { ChatKittySucceededResult } from './result';
export class CreatedThreadResult extends ChatKittySucceededResult {
  constructor(thread) {
    super();
    this.thread = thread;
  }

}
export class GetThreadsSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class GetThreadChannelSucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class GetThreadMessageSucceededResult extends ChatKittySucceededResult {
  constructor(message) {
    super();
    this.message = message;
  }

}
export class ReadThreadSucceededResult extends ChatKittySucceededResult {
  constructor(thread) {
    super();
    this.thread = thread;
  }

}
//# sourceMappingURL=thread.js.map