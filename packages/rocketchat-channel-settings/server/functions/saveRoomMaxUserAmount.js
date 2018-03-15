
RocketChat.saveRoomMaxUserAmount = function(rid, maxAmount) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			'function': 'RocketChat.saveRoomMaxUserAmount'
		});
	}
	const room = RocketChat.models.Rooms.findOneById(rid);
	if (room == null) {
		throw new Meteor.Error('error-invalid-room', 'error-invalid-room', {
			'function': 'RocketChat.saveRoomMaxUserAmount',
			_id: rid
		});
	}
	if (room.t === 'd') {
		throw new Meteor.Error('error-direct-room', 'Can\'t change max user amount of direct rooms', {
			'function': 'RocketChat.saveRoomMaxUserAmount'
		});
	}
	const result = RocketChat.models.Rooms.setMaxUserAmountById(rid, maxAmount);
	return result;
};
