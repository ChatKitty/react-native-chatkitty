import { ChatKittySucceededResult } from './result';
export class ReactedToMessageResult extends ChatKittySucceededResult {
  constructor(reaction) {
    super();
    this.reaction = reaction;
  }

}
export class GetReactionsSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class RemovedReactionResult extends ChatKittySucceededResult {
  constructor(reaction) {
    super();
    this.reaction = reaction;
  }

}
//# sourceMappingURL=reaction.js.map