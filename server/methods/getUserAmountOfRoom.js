Meteor.methods({
	getUserAmountOfRoom(roomId, includeAdmins = true) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getUserAmountOfRoom' });
		}

		const room = Meteor.call('canAccessRoom', roomId, Meteor.userId());
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'getUserAmountOfRoom' });
		}

		const filter = (record) => {
			if (!record._user) {
				console.log('Subscription without user', record._id);
				return false;
			}
			if (!room.usernames.includes(record._user.username)) {
				return false;
			}
			if (record.ro === true) { // User is queuing
				return false;
			}
			if (!includeAdmins && record._user.roles) {
				return (!record._user.roles.includes('admin') &&
					!record._user.roles.includes('expert') &&
					!record._user.roles.includes('moderator'));
			}
			return true;
		};

		const records = RocketChat.models.Subscriptions.findByRoomId(roomId).fetch();

		return records.filter(filter).length;
	}
});
