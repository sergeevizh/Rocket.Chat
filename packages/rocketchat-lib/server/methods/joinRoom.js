Meteor.methods({
	joinRoom(rid, code) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'joinRoom' });
		}

		const room = RocketChat.models.Rooms.findOneById(rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'joinRoom' });
		}

		// TODO we should have a 'beforeJoinRoom' call back so external services can do their own validations
		const user = Meteor.user();
		if (room.tokenpass && user && user.services && user.services.tokenpass) {
			const balances = RocketChat.updateUserTokenpassBalances(user);

			if (!RocketChat.Tokenpass.validateAccess(room.tokenpass, balances)) {
				throw new Meteor.Error('error-not-allowed', 'Token required', { method: 'joinRoom' });
			}
		} else {
			if ((room.t !== 'c') || (RocketChat.authz.hasPermission(Meteor.userId(), 'view-c-room') !== true)) {
				throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'joinRoom' });
			}

			if ((room.joinCodeRequired === true) && (code !== room.joinCode) && !RocketChat.authz.hasPermission(Meteor.userId(), 'join-without-join-code')) {
				throw new Meteor.Error('error-code-invalid', 'Invalid Room Password', { method: 'joinRoom' });
			}
		}

		// RocketChat.models.Rooms.removeUserFromQueue(rid, Meteor.userId());
		// console.log('room', room);
		// console.log('records', RocketChat.models.Subscriptions.findByRoomId(rid).fetch());
		if (room.maxUserAmount) {
			Meteor.call('getUserAmountOfRoom', rid, false, (err, amount) => {
				// console.log('amount', amount);
				if (room.maxUserAmount > amount && (!room.queue || room.queue.length === 0)) {
					console.log('add user to room');
					return RocketChat.addUserToRoom(rid, user);
				} else {
					console.log('room full or has a queue');
					return RocketChat.models.Rooms.addUserToQueue(rid, Meteor.userId());
					// return;
				}
				/* if (room.queue) {
					RocketChat.models.Rooms.removeUserFromQueue(rid, Meteor.userId());
					if (room.queue.includes(Meteor.userId())) {
						console.log('user already in queue');
						return;
					} else {
						console.log('add user to queue');
						return RocketChat.models.Rooms.addUserToQueue(rid, Meteor.userId());
					}
				} */
			});
		} else {
			return RocketChat.addUserToRoom(rid, user);
		}
	}
});
