import { Channel } from './channel';
import { ChatKittyModelReference } from './model';
import { ChatKittyPaginator } from './pagination';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';

export interface BaseUser {
  id: number;
  name: string;
  displayName: string;
  displayPictureUrl: string;
  isGuest: boolean;
  presence: UserPresence;
  properties: unknown;
}

export interface UserPresence {
  status: string;
  online: boolean;
}

export type User = BaseUser & {
  _relays: UserRelays;
};

export interface UserRelays {
  self: string;
  channelMember: string;
}

export type ChatKittyUserReference =
  | ChatKittyModelReference
  | {
      username: string;
    };

export interface GetUsersRequest {
  filter?: GetUsersFilter;
}

export interface GetUsersFilter {
  name?: string;
  displayName?: string;
  online?: boolean;
}

export type GetUsersResult = GetUsersSucceededResult | ChatKittyFailedResult;

export class GetUsersSucceededResult extends ChatKittySucceededResult {
  constructor(public paginator: ChatKittyPaginator<User>) {
    super();
  }
}

export type GetUserResult = GetUserSucceededResult | ChatKittyFailedResult;

export class GetUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}

export interface GetUserIsChannelMemberRequest {
  user: User;
  channel: Channel;
}

export type GetUserIsChannelMemberResult =
  | GetUserIsChannelMemberSucceededResult
  | ChatKittyFailedResult;

export class GetUserIsChannelMemberSucceededResult extends ChatKittySucceededResult {
  constructor(public isMember: boolean) {
    super();
  }
}

export interface BlockUserRequest {
  user: User;
}

export type BlockUserResult = BlockUserSucceededResult | ChatKittyFailedResult;

export class BlockUserSucceededResult extends ChatKittySucceededResult {
  constructor(public user: User) {
    super();
  }
}
