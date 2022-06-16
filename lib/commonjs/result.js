"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetCountSucceedResult = exports.ChatKittySucceededResult = exports.ChatKittyFailedResult = exports.ChatKittyCancelledResult = void 0;
exports.cancelled = cancelled;
exports.failed = failed;
exports.succeeded = succeeded;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// @ts-ignore
class ChatKittySucceededResult {
  constructor() {
    _defineProperty(this, "succeeded", true);

    _defineProperty(this, "cancelled", false);

    _defineProperty(this, "failed", false);
  }

}

exports.ChatKittySucceededResult = ChatKittySucceededResult;

class ChatKittyCancelledResult {
  constructor() {
    _defineProperty(this, "succeeded", false);

    _defineProperty(this, "cancelled", true);

    _defineProperty(this, "failed", false);
  }

}

exports.ChatKittyCancelledResult = ChatKittyCancelledResult;

class ChatKittyFailedResult {
  constructor(error) {
    this.error = error;

    _defineProperty(this, "succeeded", false);

    _defineProperty(this, "cancelled", false);

    _defineProperty(this, "failed", true);
  }

}

exports.ChatKittyFailedResult = ChatKittyFailedResult;

class GetCountSucceedResult extends ChatKittySucceededResult {
  constructor(count) {
    super();
    this.count = count;
  }

}

exports.GetCountSucceedResult = GetCountSucceedResult;

function succeeded(result) {
  return result.succeeded;
}

function failed(result) {
  return result.failed;
}

function cancelled(result) {
  return result.cancelled;
}
//# sourceMappingURL=result.js.map