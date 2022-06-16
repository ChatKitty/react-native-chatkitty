export function isSystemSentMessageNotification(notification) {
  return notification.data.type === 'SYSTEM:SENT:MESSAGE';
}
export function isUserSentMessageNotification(notification) {
  return notification.data.type === 'USER:SENT:MESSAGE';
}
export function isUserRepliedToMessageNotification(notification) {
  return notification.data.type === 'USER:REPLIED_TO:MESSAGE';
}
export function isUserMentionedNotification(notification) {
  return notification.data.type === 'USER:MENTIONED:USER';
}
export function isUserMentionedChannelNotification(notification) {
  return notification.data.type === 'USER:MENTIONED:CHANNEL';
}
//# sourceMappingURL=notification.js.map