RocketChat.RoomQueues = {
	addUserToQueueOrRoom(userId, roomId) {
		const room = this.getRoom(roomId);
		const user = this.getUser(userId);


		if (this.hasUserAlreadyJoinedRoom(user, room)) {
			return;
		}

		if (this.isUserAdmin(user) || !this.isRoomFull(room)) {
			return RocketChat.addUserToRoom(room._id, user);
		}
		// console.log('Adding user to queue for room');
		return RocketChat.addUserToQueue(room, user);
	},

	getRoom(rid) {
		const room = RocketChat.models.Rooms.findOneById(rid);
		if (!room) {
			throw new Error(`Could not find room ${ rid }!`);
		}
		return room;
	},

	getUser(uid) {
		const user = RocketChat.models.Users.findOneById(uid);
		if (!user) {
			throw new Error(`Could not find user ${ uid }!`);
		}
		return user;
	},

	hasUserAlreadyJoinedRoom(user, room) {
		const sub = RocketChat.models.Subscriptions.find({ 'u._id': user._id, rid: room._id }).fetch();
		return sub.length > 0;
	},

	isRoomFull(room) {
		if (!room.maxUserAmount) {
			return false;
		}
		const regularUsersInRoom = this.getRegularUsersInRoom(room);
		// console.log(`Regular users in room ${ room._id }:`, regularUsersInRoom);
		return regularUsersInRoom.length >= room.maxUserAmount;
	},

	isUserAdmin(user) {
		const adminRoles = ['admin', 'ngo-expert', 'ngo-moderator'];
		const roles = (user && user.roles) || [];
		return adminRoles.some(adminRole => roles.includes(adminRole));
	},

	getRegularUsersInRoom(room) {
		const adminRoles = ['admin', 'ngo-expert', 'ngo-moderator'];
		const userQuery = {
			username: { $in: room.usernames || [] },
			roles: { $nin: adminRoles }
		};

		const regularUsersInRoom = RocketChat.models.Users.find(userQuery).fetch().map(user => user.username);
		return regularUsersInRoom;
	},

	processQueue(rid) {
		const room = this.getRoom(rid);
		const queue = room.queue || [];

		if (queue.length < 1) {
			// console.log(`Did not queue as the queue for room ${ rid } was empty.`);
			return;
		}

		if (!this.isRoomFull(room)) {
			// console.log(`Did not update queue as the room ${ rid } was still full.`);
			return;
		}

		const username = queue[0];

		RocketChat.models.Rooms.moveUserFromQueueToRoomByRoomIdAndUsername(rid, username);
		RocketChat.models.Subscriptions.setToActiveByUsernameAndRoomId(username, rid);
		RocketChat.models.Messages.createUserJoinWithRoomIdAndUsername(rid, username);
	}

};
