"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetReadReceiptsSucceededResult = void 0;

var _result = require("./result");

class GetReadReceiptsSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetReadReceiptsSucceededResult = GetReadReceiptsSucceededResult;
//# sourceMappingURL=read-receipt.js.map