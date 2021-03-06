Meteor.methods({
	getRoomByNameOrId(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'getRoomByNameOrId'
			});
		}

		const room = RocketChat.models.Rooms.findOneById(rid) || RocketChat.models.Rooms.findOneByName(rid);

		if (room == null) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomByNameOrId'
			});
		}

		const user = Meteor.user();
		if (user && user.username && room.usernames.indexOf(user.username) !== -1) {
			return room;
		}

		if (room.t !== 'c' || RocketChat.authz.hasPermission(Meteor.userId(), 'view-c-room') !== true) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomByNameOrId'
			});
		}

		return room;
	}
});
