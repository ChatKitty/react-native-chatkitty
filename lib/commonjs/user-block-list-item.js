"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetUserBlockListSucceededResult = exports.DeleteUserBlockListItemSucceededResult = void 0;

var _result = require("./result");

class GetUserBlockListSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetUserBlockListSucceededResult = GetUserBlockListSucceededResult;

class DeleteUserBlockListItemSucceededResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.DeleteUserBlockListItemSucceededResult = DeleteUserBlockListItemSucceededResult;
//# sourceMappingURL=user-block-list-item.js.map