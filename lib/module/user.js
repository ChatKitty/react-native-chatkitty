import { ChatKittySucceededResult } from './result';
export class GetUsersSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class GetUserSucceededResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
export class GetUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
  constructor(isMember) {
    super();
    this.isMember = isMember;
  }

}
export class BlockUserSucceededResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
//# sourceMappingURL=user.js.map