Meteor.methods({
	removeUserFromQueue(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'removeUserFromQueue' });
		}

		const room = RocketChat.models.Rooms.findOneById(rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'removeUserFromQueue' });
		}

		if (!room.queue.includes(Meteor.userId())) {
			console.log('user not in queue');
			return;
		} else {
			console.log('remove user from queue');
			return RocketChat.models.Rooms.removeUserFromQueue(rid, Meteor.userId());
		}
	}
});
