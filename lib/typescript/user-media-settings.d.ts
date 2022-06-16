import { ChatKittyFailedResult, ChatKittyResult, ChatKittySucceededResult } from './result';
import { User } from './user';
export declare class UserMediaSettings {
    user: User;
    audio: UserMediaAudioSettings;
    video: UserMediaVideoSettings;
}
export declare class UserMediaAudioSettings {
    enabled: boolean;
}
export declare class UserMediaVideoSettings {
    enabled: boolean;
    minimumWidth: number;
    minimumHeight: number;
    minimumFrameRate: number;
}
export declare class GetUserMediaSettingsRequest {
    user: User;
}
export declare type GetUserMediaSettingsResult = ChatKittyResult<GetUserMediaSettingsSucceededResult> | GetUserMediaSettingsSucceededResult | ChatKittyFailedResult;
export declare class GetUserMediaSettingsSucceededResult extends ChatKittySucceededResult {
    settings: UserMediaSettings;
    constructor(settings: UserMediaSettings);
}
