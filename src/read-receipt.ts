import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export interface ReadReceipt {
  user: User;
  createdTime: string;
  _relays: ReadReceiptRelays;
}

export interface ReadReceiptRelays {
  message: string;
}

export interface GetReadReceiptsRequest {
  message: Message;
}

export type GetReadReceiptsResult =
  | GetReadReceiptsSucceededResult
  | ChatKittyFailedResult;

export class GetReadReceiptsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<ReadReceipt>) {
    super();
  }
}
