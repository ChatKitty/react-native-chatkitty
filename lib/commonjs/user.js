"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetUsersSucceededResult = exports.GetUserSucceededResult = exports.GetUserIsChannelMemberSucceededResult = exports.BlockUserSucceededResult = void 0;

var _result = require("./result");

class GetUsersSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetUsersSucceededResult = GetUsersSucceededResult;

class GetUserSucceededResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.GetUserSucceededResult = GetUserSucceededResult;

class GetUserIsChannelMemberSucceededResult extends _result.ChatKittySucceededResult {
  constructor(isMember) {
    super();
    this.isMember = isMember;
  }

}

exports.GetUserIsChannelMemberSucceededResult = GetUserIsChannelMemberSucceededResult;

class BlockUserSucceededResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.BlockUserSucceededResult = BlockUserSucceededResult;
//# sourceMappingURL=user.js.map