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
		// Check if user already in room
		if (room.usernames && room.usernames.includes(user.username)) {
			return;
		}

		// Check if chat room has space for the user
		if (room.maxUserAmount) {
			const filter = (record) => {
				if (!record._user) {
					console.log('Subscription without user', record._id);
					return false;
				}
				if (!room.usernames || !room.usernames.includes(record._user.username)) {
					return false;
				}
				if (record.ro === true) { // User is queuing
					return false;
				}
				if (record._user.roles) { // Skip admins and mods
					return (!record._user.roles.includes('admin') &&
						!record._user.roles.includes('ngo-expert') &&
						!record._user.roles.includes('ngo-moderator'));
				}
				return true;
			};
			const records = RocketChat.models.Subscriptions.findByRoomId(rid).fetch();
			const filtered = records.filter(filter);
			const amount = filtered.length;

			if (room.maxUserAmount > amount && (!room.queue || room.queue.length === 0)) {
				return RocketChat.addUserToRoom(rid, user);
			} else if (room.queue && room.queue.includes(Meteor.userId())) {
				// User already in queue
				return;
			} else {
				RocketChat.models.Subscriptions.createWithRoomAndUser(room, user, { open: true, ro: true, queuing: true });
				return RocketChat.models.Rooms.addUserToQueue(rid, Meteor.userId());
			}
		} else {
			return RocketChat.addUserToRoom(rid, user);
		}
	}
});
