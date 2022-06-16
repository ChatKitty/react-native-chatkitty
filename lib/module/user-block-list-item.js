import { ChatKittySucceededResult } from './result';
export class GetUserBlockListSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class DeleteUserBlockListItemSucceededResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
//# sourceMappingURL=user-block-list-item.js.map