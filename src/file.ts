export interface ChatKittyFile {
  type: string;
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export type CreateChatKittyFileProperties =
  | CreateChatKittyExternalFileProperties
  | Blob;

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
