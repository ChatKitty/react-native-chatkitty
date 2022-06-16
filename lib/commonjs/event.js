"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TriggeredEventResult = void 0;

var _result = require("./result");

class TriggeredEventResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.TriggeredEventResult = TriggeredEventResult;
//# sourceMappingURL=event.js.map