import {
  ChatKittyFailedResult,
  ChatKittyResult,
  ChatKittySucceededResult,
} from './result';
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

export type GetUserMediaSettingsResult =
  | ChatKittyResult<GetUserMediaSettingsSucceededResult>
  | GetUserMediaSettingsSucceededResult
  | ChatKittyFailedResult;

export class GetUserMediaSettingsSucceededResult extends ChatKittySucceededResult {
  constructor(public settings: UserMediaSettings) {
    super();
  }
}
