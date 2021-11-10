export interface ChatKittyFile {
  type: string;
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export type CreateChatKittyFileProperties =
  | CreateChatKittyExternalFileProperties
  | { name: string; type: string; uri: string; size: number };

export interface CreateChatKittyExternalFileProperties {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export enum ChatKittyUploadResult {
  COMPLETED,
  FAILED,
  CANCELLED,
}

export interface ChatKittyUploadProgressListener {
  onStarted: () => void;
  onProgress: (progress: number) => void;
  onCompleted: (result: ChatKittyUploadResult) => void;
}
