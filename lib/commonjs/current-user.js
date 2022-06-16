"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpdatedCurrentUserResult = exports.UpdatedCurrentUserDisplayPictureResult = exports.GetCurrentUserSuccessfulResult = void 0;

var _result = require("./result");

class GetCurrentUserSuccessfulResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.GetCurrentUserSuccessfulResult = GetCurrentUserSuccessfulResult;

class UpdatedCurrentUserResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.UpdatedCurrentUserResult = UpdatedCurrentUserResult;

class UpdatedCurrentUserDisplayPictureResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.UpdatedCurrentUserDisplayPictureResult = UpdatedCurrentUserDisplayPictureResult;
//# sourceMappingURL=current-user.js.map