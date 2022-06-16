"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemovedReactionResult = exports.ReactedToMessageResult = exports.GetReactionsSucceededResult = void 0;

var _result = require("./result");

class ReactedToMessageResult extends _result.ChatKittySucceededResult {
  constructor(reaction) {
    super();
    this.reaction = reaction;
  }

}

exports.ReactedToMessageResult = ReactedToMessageResult;

class GetReactionsSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetReactionsSucceededResult = GetReactionsSucceededResult;

class RemovedReactionResult extends _result.ChatKittySucceededResult {
  constructor(reaction) {
    super();
    this.reaction = reaction;
  }

}

exports.RemovedReactionResult = RemovedReactionResult;
//# sourceMappingURL=reaction.js.map