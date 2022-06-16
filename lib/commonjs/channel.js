"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpdatedChannelResult = exports.UnmutedChannelResult = exports.ReadChannelSucceededResult = exports.NotAChannelMemberError = exports.MutedChannelResult = exports.LeftChannelResult = exports.JoinedChannelResult = exports.InvitedUserResult = exports.HideChannelSucceededResult = exports.GetChannelsSucceededResult = exports.GetChannelUnreadSucceededResult = exports.GetChannelSucceededResult = exports.DeletedChannelResult = exports.CreatedChannelResult = exports.ClearChannelHistorySucceededResult = exports.ChannelNotPubliclyJoinableError = exports.ChannelNotInvitableError = exports.CannotAddModeratorToChannelError = exports.AddedChannelModeratorResult = void 0;
exports.isDirectChannel = isDirectChannel;
exports.isPrivateChannel = isPrivateChannel;
exports.isPublicChannel = isPublicChannel;

var _error = require("./error");

var _result = require("./result");

function isDirectChannel(channel) {
  return channel.type === 'DIRECT';
}

function isPublicChannel(channel) {
  return channel.type === 'PUBLIC';
}

function isPrivateChannel(channel) {
  return channel.type === 'PRIVATE';
}

class CreatedChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.CreatedChannelResult = CreatedChannelResult;

class GetChannelsSucceededResult extends _result.ChatKittySucceededResult {
  constructor(paginator) {
    super();
    this.paginator = paginator;
  }

}

exports.GetChannelsSucceededResult = GetChannelsSucceededResult;

class GetChannelSucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.GetChannelSucceededResult = GetChannelSucceededResult;

class GetChannelUnreadSucceededResult extends _result.ChatKittySucceededResult {
  constructor(unread) {
    super();
    this.unread = unread;
  }

}

exports.GetChannelUnreadSucceededResult = GetChannelUnreadSucceededResult;

class JoinedChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.JoinedChannelResult = JoinedChannelResult;

class ChannelNotPubliclyJoinableError extends _error.ChatKittyError {
  constructor(channel) {
    super('ChannelNotPubliclyJoinableError', `The channel ${channel.name} can't be joined without an invite.`);
    this.channel = channel;
  }

}

exports.ChannelNotPubliclyJoinableError = ChannelNotPubliclyJoinableError;

class AddedChannelModeratorResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.AddedChannelModeratorResult = AddedChannelModeratorResult;

class CannotAddModeratorToChannelError extends _error.ChatKittyError {
  constructor(channel) {
    super('CannotAddModeratorToChannel', `The channel ${channel.name} is not a group channel and cannot have moderators.`);
    this.channel = channel;
  }

}

exports.CannotAddModeratorToChannelError = CannotAddModeratorToChannelError;

class MutedChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.MutedChannelResult = MutedChannelResult;

class UnmutedChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.UnmutedChannelResult = UnmutedChannelResult;

class LeftChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.LeftChannelResult = LeftChannelResult;

class NotAChannelMemberError extends _error.ChatKittyError {
  constructor(channel) {
    super('NotAChannelMemberError', `You are not a member of channel ${channel.name}.`);
    this.channel = channel;
  }

}

exports.NotAChannelMemberError = NotAChannelMemberError;

class ReadChannelSucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.ReadChannelSucceededResult = ReadChannelSucceededResult;

class ClearChannelHistorySucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.ClearChannelHistorySucceededResult = ClearChannelHistorySucceededResult;

class HideChannelSucceededResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.HideChannelSucceededResult = HideChannelSucceededResult;

class InvitedUserResult extends _result.ChatKittySucceededResult {
  constructor(user) {
    super();
    this.user = user;
  }

}

exports.InvitedUserResult = InvitedUserResult;

class ChannelNotInvitableError extends _error.ChatKittyError {
  constructor(channel) {
    super('ChannelNotInvitableError', `The channel ${channel.name} does not accept invites.`);
    this.channel = channel;
  }

}

exports.ChannelNotInvitableError = ChannelNotInvitableError;

class UpdatedChannelResult extends _result.ChatKittySucceededResult {
  constructor(channel) {
    super();
    this.channel = channel;
  }

}

exports.UpdatedChannelResult = UpdatedChannelResult;

class DeletedChannelResult extends _result.ChatKittySucceededResult {
  constructor() {
    super();
  }

}

exports.DeletedChannelResult = DeletedChannelResult;
//# sourceMappingURL=channel.js.map