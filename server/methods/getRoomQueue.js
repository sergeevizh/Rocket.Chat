Meteor.methods({
	addToRoomQueue(roomId, userId) {
		check(roomId, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'addToRoomQueue'
			});
		}

		const room = RocketChat.models.Rooms.findOneById(roomId);

		if (room == null) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'addToRoomQueue'
			});
		}

		Meteor.models.Rooms.addToQueue(roomId, userId);
		return true;
	}
});
