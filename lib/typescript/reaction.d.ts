import { Emoji } from './emoji';
import { Message } from './message';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
import { User } from './user';
export declare class Reaction {
    emoji: Emoji;
    user: User;
    createdTime: string;
    _relays: ReactionRelays;
}
export declare class ReactionRelays {
    message: string;
}
export declare class ReactionSummary {
    emojis: ReactionSummaryEmoji[];
}
export declare class ReactionSummaryEmoji {
    emoji: Emoji;
    users: User[];
    count: number;
}
export declare class ReactToMessageRequest {
    message: Message;
    emoji: string;
}
export declare type ReactToMessageResult = ChatKittyResult<ReactedToMessageResult> | ReactedToMessageResult | ChatKittyFailedResult;
export declare class ReactedToMessageResult extends ChatKittySucceededResult {
    reaction: Reaction;
    constructor(reaction: Reaction);
}
export declare class GetReactionsRequest {
    message: Message;
}
export declare type GetReactionsResult = ChatKittyResult<GetReactionsSucceededResult> | GetReactionsSucceededResult | ChatKittyFailedResult;
export declare class GetReactionsSucceededResult extends ChatKittySucceededResult {
    paginator: ChatKittyPaginator<Reaction>;
    constructor(paginator: ChatKittyPaginator<Reaction>);
}
export declare class RemoveReactionRequest {
    message: Message;
    emoji: string;
}
export declare type RemoveReactionResult = ChatKittyResult<RemovedReactionResult> | RemovedReactionResult | ChatKittyFailedResult;
export declare class RemovedReactionResult extends ChatKittySucceededResult {
    reaction: Reaction;
    constructor(reaction: Reaction);
}
