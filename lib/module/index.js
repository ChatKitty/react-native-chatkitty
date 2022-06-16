import { NativeModules, Platform } from 'react-native';
import 'text-encoding';
import ChatKitty from './chatkitty';
export * from './call';
export * from './channel';
export * from './chat-session';
export * from './current-user';
export * from './emoji';
export * from './error';
export * from './file';
export * from './keystrokes';
export * from './message';
export * from './model';
export * from './notification';
export * from './observer';
export * from './pagination';
export * from './reaction';
export * from './read-receipt';
export * from './result';
export * from './thread';
export * from './user';
export * from './user-block-list-item';
export * from './user-session';
const LINKING_ERROR = `The package 'react-native-chatkitty' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo managed workflow\n';
const ChatKittyNative = NativeModules.ChatKitty ? NativeModules.ChatKitty : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }

});
export function multiply(a, b) {
  return ChatKittyNative.multiply(a, b);
}
export default ChatKitty;
//# sourceMappingURL=index.js.map