import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export class StartedSessionResult extends ChatKittySucceededResult {
  constructor(session) {
    super();
    this.session = session;
  }

}
export class SessionActiveError extends ChatKittyError {
  constructor() {
    super('SessionActiveError', 'A user session is already active and must be ended before this instance can start a new session.');
  }

}
export class NoActiveSessionError extends ChatKittyError {
  constructor() {
    super('NoActiveSessionError', "You're not connected to ChatKitty.");
  }

}
//# sourceMappingURL=user-session.js.map