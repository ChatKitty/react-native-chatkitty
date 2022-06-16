"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSystemSentMessageNotification = isSystemSentMessageNotification;
exports.isUserMentionedChannelNotification = isUserMentionedChannelNotification;
exports.isUserMentionedNotification = isUserMentionedNotification;
exports.isUserRepliedToMessageNotification = isUserRepliedToMessageNotification;
exports.isUserSentMessageNotification = isUserSentMessageNotification;

function isSystemSentMessageNotification(notification) {
  return notification.data.type === 'SYSTEM:SENT:MESSAGE';
}

function isUserSentMessageNotification(notification) {
  return notification.data.type === 'USER:SENT:MESSAGE';
}

function isUserRepliedToMessageNotification(notification) {
  return notification.data.type === 'USER:REPLIED_TO:MESSAGE';
}

function isUserMentionedNotification(notification) {
  return notification.data.type === 'USER:MENTIONED:USER';
}

function isUserMentionedChannelNotification(notification) {
  return notification.data.type === 'USER:MENTIONED:CHANNEL';
}
//# sourceMappingURL=notification.js.map