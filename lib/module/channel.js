import { ChatKittyError } from './error';
import { ChatKittySucceededResult } from './result';
export function isDirectChannel(channel) {
  return channel.type === 'DIRECT';
}
export function isPublicChannel(channel) {
  return channel.type === 'PUBLIC';
}
export function isPrivateChannel(channel) {
  return channel.type === 'PRIVATE';
}
export class CreatedChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class GetChannelsSucceededResult extends ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}
export class GetChannelSucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class GetChannelUnreadSucceededResult extends ChatKittySucceededResult {
  constructor(unread) {
    super();
    this.unread = unread;
  }

}
export class JoinedChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class ChannelNotPubliclyJoinableError extends ChatKittyError {
  constructor(channel) {
    super('ChannelNotPubliclyJoinableError', `The channel ${channel.name} can't be joined without an invite.`);
    this.channel = channel;
  }

}
export class AddedChannelModeratorResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class CannotAddModeratorToChannelError extends ChatKittyError {
  constructor(channel) {
    super('CannotAddModeratorToChannel', `The channel ${channel.name} is not a group channel and cannot have moderators.`);
    this.channel = channel;
  }

}
export class MutedChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class UnmutedChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class LeftChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class NotAChannelMemberError extends ChatKittyError {
  constructor(channel) {
    super('NotAChannelMemberError', `You are not a member of channel ${channel.name}.`);
    this.channel = channel;
  }

}
export class ReadChannelSucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class ClearChannelHistorySucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class HideChannelSucceededResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class InvitedUserResult extends ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}
export class ChannelNotInvitableError extends ChatKittyError {
  constructor(channel) {
    super('ChannelNotInvitableError', `The channel ${channel.name} does not accept invites.`);
    this.channel = channel;
  }

}
export class UpdatedChannelResult extends ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}
export class DeletedChannelResult extends ChatKittySucceededResult {
  constructor() {
    super();
  }

}
//# sourceMappingURL=channel.js.map