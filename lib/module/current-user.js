import { ChatKittySucceededResult } from './result';
export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
export class UpdatedCurrentUserDisplayPictureResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
//# sourceMappingURL=current-user.js.map