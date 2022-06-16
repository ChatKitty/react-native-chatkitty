import { ChatKittySucceededResult } from './result';
import { ChatKittyError } from './error';
export function isConferenceCall(call) {
  return call.type === 'CONFERENCE';
}
export function isPresenterCall(call) {
  return call.type === 'PRESENTER';
}
export class StartedCallResult extends ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}
export class GetCallsSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class GetCallSucceededResult extends ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}
export class AcceptedCallResult extends ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}
export class DeclinedCallResult extends ChatKittySucceededResult {
  constructor(call) {
    super();
    this.call = call;
  }

}
export class NoActiveCallError extends ChatKittyError {
  constructor() {
    super('NoActiveCallError', "You're not currently in a call.");
  }

}
//# sourceMappingURL=call.js.map