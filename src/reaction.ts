import { Emoji } from './emoji';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { User } from './user';

export interface Reaction {
  emoji: Emoji;
  user: User;
  createdTime: string;
  _relays: ReactionRelays;
}

export interface ReactionRelays {
  message: string;
}

export interface ReactionSummary {
  emojis: ReactionSummaryEmoji[];
}

export interface ReactionSummaryEmoji {
  emoji: Emoji;
  users: User[];
  count: number;
}

export interface ReactToMessageRequest {
  message: Message;
  emoji: string;
}

export type ReactToMessageResult =
  | ReactedToMessageResult
  | ChatKittyFailedResult;

export class ReactedToMessageResult extends ChatKittySucceededResult {
  constructor(public reaction: Reaction) {
    super();
  }
}

export interface GetReactionsRequest {
  message: Message;
}

export type GetReactionsResult =
  | GetReactionsSucceededResult
  | ChatKittyFailedResult;

export class GetReactionsSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<Reaction>) {
    super();
  }
}

export interface RemoveReactionRequest {
  message: Message;
  emoji: string;
}

export type RemoveReactionResult =
  | RemovedReactionResult
  | ChatKittyFailedResult;

export class RemovedReactionResult extends ChatKittySucceededResult {
  constructor(public reaction: Reaction) {
    super();
  }
}
