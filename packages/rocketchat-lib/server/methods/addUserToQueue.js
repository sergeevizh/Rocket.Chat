Meteor.methods({
	addUserToQueue(rid, code) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'addUserToQueue' });
		}

		const room = RocketChat.models.Rooms.findOneById(rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'addUserToQueue' });
		}

		const user = Meteor.user();
		if (room.tokenpass && user && user.services && user.services.tokenpass) {
			const balances = RocketChat.updateUserTokenpassBalances(user);

			if (!RocketChat.Tokenpass.validateAccess(room.tokenpass, balances)) {
				throw new Meteor.Error('error-not-allowed', 'Token required', { method: 'addUserToQueue' });
			}
		} else {
			if ((room.t !== 'c') || (RocketChat.authz.hasPermission(Meteor.userId(), 'view-c-room') !== true)) {
				throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'addUserToQueue' });
			}

			if ((room.joinCodeRequired === true) && (code !== room.joinCode) && !RocketChat.authz.hasPermission(Meteor.userId(), 'join-without-join-code')) {
				throw new Meteor.Error('error-code-invalid', 'Invalid Room Password', { method: 'addUserToQueue' });
			}
		}

		RocketChat.models.Rooms.removeUserFromQueue(rid, Meteor.userId());
		if (room.queue.includes(Meteor.userId())) {
			console.log('user already in queue');
			return;
		} else {
			console.log('add user to queue');
			RocketChat.models.Subscriptions.createWithRoomAndUser(room, user, { open: true, ro: true });
			return RocketChat.models.Rooms.addUserToQueue(rid, Meteor.userId());
		}
	}
});
