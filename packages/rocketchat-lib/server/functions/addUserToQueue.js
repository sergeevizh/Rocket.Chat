RocketChat.addUserToQueue = function(room, user) {
	const now = new Date();

	// Check if user is already in room
	const subscription = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(room._id, user._id);
	if (subscription) {
		return;
	}

	const muted = room.ro && !RocketChat.authz.hasPermission(user._id, 'post-readonly');
	RocketChat.models.Rooms.addUsernameToQueueById(room._id, user.username, muted);
	RocketChat.models.Subscriptions.createWithRoomAndUser(room, user, {
		ts: now,
		open: false,
		alert: true,
		unread: 1,
		userMentions: 1,
		groupMentions: 0,
		queuing: true,
		ro: true
	});

	return true;
};
