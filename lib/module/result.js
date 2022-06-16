function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// @ts-ignore
export class ChatKittySucceededResult {
  constructor() {
    _defineProperty(this, "succeeded", true);

    _defineProperty(this, "cancelled", false);

    _defineProperty(this, "failed", false);
  }

}
export class ChatKittyCancelledResult {
  constructor() {
    _defineProperty(this, "succeeded", false);

    _defineProperty(this, "cancelled", true);

    _defineProperty(this, "failed", false);
  }

}
export class ChatKittyFailedResult {
  constructor(error) {
    this.error = error;

    _defineProperty(this, "succeeded", false);

    _defineProperty(this, "cancelled", false);

    _defineProperty(this, "failed", true);
  }

}
export class GetCountSucceedResult extends ChatKittySucceededResult {
  constructor(count) {
    super();
    this.count = count;
  }

}
export function succeeded(result) {
  return result.succeeded;
}
export function failed(result) {
  return result.failed;
}
export function cancelled(result) {
  return result.cancelled;
}
//# sourceMappingURL=result.js.map