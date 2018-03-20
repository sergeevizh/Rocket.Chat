Meteor.publish('allUsers', function() {
	if (!this.userId) {
		return this.ready();
	}

	return RocketChat.models.Users.findUsers({
		fields: {
			username: 1,
			name: 1,
			status: 1,
			utcOffset: 1,
			roles: 1
		}
	});
});

RocketChat.models.Users.on('changed', function(type, user) {
	if (type === 'updated' && user.status === 'offline') {
		// If non-admin user went offline, kick from channels
		/* const channels = RocketChat.models.Subscriptions.findByUserId(user._id).fetch();
		const nonQueued = RocketChat.models.Subscriptions.findNonQueuedByUserId(user._id).fetch();
		nonQueued.forEach((sub) => {
			RocketChat.models.Subscriptions.removeByRoomIdAndUserId(sub.rid, user._id);
		}); */
	}
});
