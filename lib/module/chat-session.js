import { ChatKittySucceededResult } from './result';
export class StartedChatSessionResult extends ChatKittySucceededResult {
  constructor(session) {
    super();
    this.session = session;
  }

}
//# sourceMappingURL=chat-session.js.map