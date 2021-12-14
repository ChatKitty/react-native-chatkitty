import { ChatKittyError } from './error';

// @ts-ignore
export interface ChatKittyResult<S extends ChatKittySucceededResult> {
  succeeded: boolean;
  cancelled: boolean;
  failed: boolean;
}

export abstract class ChatKittySucceededResult {
  succeeded = true;
  cancelled = false;
  failed = false;
}

export abstract class ChatKittyCancelledResult {
  succeeded = false;
  cancelled = true;
  failed = false;
}

export class ChatKittyFailedResult {
  succeeded = false;
  cancelled = false;
  failed = true;

  constructor(public error: ChatKittyError) {}
}

export type GetCountResult =
  | ChatKittyResult<GetCountSucceedResult>
  | GetCountSucceedResult
  | ChatKittyFailedResult;

export class GetCountSucceedResult extends ChatKittySucceededResult {
  constructor(public count: number) {
    super();
  }
}

export function succeeded<R extends ChatKittySucceededResult>(
  result: ChatKittyResult<R>
): result is R {
  return result.succeeded;
}

export function failed<R extends ChatKittyFailedResult>(
  result: ChatKittyResult<never>
): result is R {
  return result.failed;
}

export function cancelled<R extends ChatKittyCancelledResult>(
  result: ChatKittyResult<never>
): result is R {
  return result.cancelled;
}
