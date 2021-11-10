import {
  ChatKittyUploadProgressListener,
  CreateChatKittyFileProperties,
} from './file';
import { ChatKittyFailedResult, ChatKittySucceededResult } from './result';
import { BaseUser } from './user';

export type CurrentUser = BaseUser & {
  _relays: CurrentUserRelays;
  _topics: CurrentUserTopics;
  _actions: CurrentUserActions;
  _streams: CurrentUserStreams;
};

export interface CurrentUserRelays {
  self: string;
  readFileAccessGrant: string;
  writeFileAccessGrant: string;
  channelsCount: string;
  channels: string;
  joinableChannels: string;
  unreadChannelsCount: string;
  unreadChannels: string;
  unreadMessagesCount: string;
  contactsCount: string;
  contacts: string;
  userBlockListItems: string;
}

export interface CurrentUserTopics {
  self: string;
  channels: string;
  calls: string;
  messages: string;
  notifications: string;
  contacts: string;
  participants: string;
  users: string;
  reactions: string;
}

export interface CurrentUserActions {
  update: string;
  createChannel: string;
  updateDisplayPicture: string;
}

export interface CurrentUserStreams {
  displayPicture: string;
}

export type GetCurrentUserResult =
  | GetCurrentUserSuccessfulResult
  | ChatKittyFailedResult;

export class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export type UpdateCurrentUserResult =
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}

export interface UpdateCurrentUserDisplayPictureRequest {
  file: CreateChatKittyFileProperties;
  progressListener?: ChatKittyUploadProgressListener;
}

export type UpdateCurrentUserDisplayPictureResult =
  | UpdatedCurrentUserResult
  | ChatKittyFailedResult;

export class UpdatedCurrentUserDisplayPictureResult extends ChatKittySucceededResult {
  constructor(public user: CurrentUser) {
    super();
  }
}
