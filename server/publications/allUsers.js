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
	console.log('users.on(changed) type:', type);
	console.log('users.on(changed) user:', user);
	console.log('type === updated:', type === 'updated');
	console.log('user.status === online:', user.status === 'online');
	console.log('user.status === offline:', user.status === 'offline');
	if (type === 'updated' && user.status === 'offline') {
		// If non-admin user went offline, kick from channels
		const channels = RocketChat.models.Subscriptions.findByUserId(user._id).fetch();
		console.log('channels: ', channels);
		const nonQueued = RocketChat.models.Subscriptions.findNonQueuedByUserId(user._id).fetch();
		console.log('nonQueued: ', nonQueued);
		nonQueued.forEach((sub) => {
			RocketChat.models.Subscriptions.removeByRoomIdAndUserId(sub.rid, user._id);
		});
	}
});
