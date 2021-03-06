import { ChatKittyUploadProgressListener, CreateChatKittyFileProperties } from './file';
import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
import { BaseUser } from './user';
export declare type CurrentUser = BaseUser & {
    _relays: CurrentUserRelays;
    _topics: CurrentUserTopics;
    _actions: CurrentUserActions;
    _streams: CurrentUserStreams;
};
export declare class CurrentUserRelays {
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
export declare class CurrentUserTopics {
    self: string;
    channels: string;
    messages: string;
    notifications: string;
    contacts: string;
    participants: string;
    users: string;
    reactions: string;
    threads: string;
    calls: string;
}
export declare class CurrentUserActions {
    createChannel: string;
    updateDisplayPicture: string;
    updateMediaSettingsAudioEnabled: string;
    updateMediaSettingsVideoEnabled: string;
    update: string;
}
export declare class CurrentUserStreams {
    displayPicture: string;
}
export declare type GetCurrentUserResult = ChatKittyResult<GetCurrentUserSuccessfulResult> | GetCurrentUserSuccessfulResult | ChatKittyFailedResult;
export declare class GetCurrentUserSuccessfulResult extends ChatKittySucceededResult {
    user: CurrentUser;
    constructor(user: CurrentUser);
}
export declare type UpdateCurrentUserResult = ChatKittyResult<UpdatedCurrentUserResult> | UpdatedCurrentUserResult | ChatKittyFailedResult;
export declare class UpdatedCurrentUserResult extends ChatKittySucceededResult {
    user: CurrentUser;
    constructor(user: CurrentUser);
}
export declare class UpdateCurrentUserDisplayPictureRequest {
    file: CreateChatKittyFileProperties;
    progressListener?: ChatKittyUploadProgressListener;
}
export declare type UpdateCurrentUserDisplayPictureResult = ChatKittyResult<UpdatedCurrentUserDisplayPictureResult> | UpdatedCurrentUserDisplayPictureResult | ChatKittyFailedResult;
export declare class UpdatedCurrentUserDisplayPictureResult extends ChatKittySucceededResult {
    user: CurrentUser;
    constructor(user: CurrentUser);
}
