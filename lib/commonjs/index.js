"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  multiply: true
};
exports.default = void 0;
exports.multiply = multiply;

var _reactNative = require("react-native");

require("text-encoding");

var _chatkitty = _interopRequireDefault(require("./chatkitty"));

var _call = require("./call");

Object.keys(_call).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _call[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _call[key];
    }
  });
});

var _channel = require("./channel");

Object.keys(_channel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _channel[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _channel[key];
    }
  });
});

var _chatSession = require("./chat-session");

Object.keys(_chatSession).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _chatSession[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _chatSession[key];
    }
  });
});

var _currentUser = require("./current-user");

Object.keys(_currentUser).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _currentUser[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _currentUser[key];
    }
  });
});

var _emoji = require("./emoji");

Object.keys(_emoji).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _emoji[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _emoji[key];
    }
  });
});

var _error = require("./error");

Object.keys(_error).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _error[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _error[key];
    }
  });
});

var _file = require("./file");

Object.keys(_file).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _file[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _file[key];
    }
  });
});

var _keystrokes = require("./keystrokes");

Object.keys(_keystrokes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _keystrokes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _keystrokes[key];
    }
  });
});

var _message = require("./message");

Object.keys(_message).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _message[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _message[key];
    }
  });
});

var _model = require("./model");

Object.keys(_model).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _model[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _model[key];
    }
  });
});

var _notification = require("./notification");

Object.keys(_notification).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _notification[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _notification[key];
    }
  });
});

var _observer = require("./observer");

Object.keys(_observer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _observer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _observer[key];
    }
  });
});

var _pagination = require("./pagination");

Object.keys(_pagination).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _pagination[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pagination[key];
    }
  });
});

var _reaction = require("./reaction");

Object.keys(_reaction).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reaction[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reaction[key];
    }
  });
});

var _readReceipt = require("./read-receipt");

Object.keys(_readReceipt).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _readReceipt[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _readReceipt[key];
    }
  });
});

var _result = require("./result");

Object.keys(_result).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _result[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _result[key];
    }
  });
});

var _thread = require("./thread");

Object.keys(_thread).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _thread[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _thread[key];
    }
  });
});

var _user = require("./user");

Object.keys(_user).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _user[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _user[key];
    }
  });
});

var _userBlockListItem = require("./user-block-list-item");

Object.keys(_userBlockListItem).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _userBlockListItem[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _userBlockListItem[key];
    }
  });
});

var _userSession = require("./user-session");

Object.keys(_userSession).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _userSession[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _userSession[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LINKING_ERROR = `The package 'react-native-chatkitty' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo managed workflow\n';
const ChatKittyNative = _reactNative.NativeModules.ChatKitty ? _reactNative.NativeModules.ChatKitty : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }

});

function multiply(a, b) {
  return ChatKittyNative.multiply(a, b);
}

var _default = _chatkitty.default;
exports.default = _default;
//# sourceMappingURL=index.js.map