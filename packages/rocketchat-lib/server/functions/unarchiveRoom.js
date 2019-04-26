RocketChat.unarchiveRoom = function(rid) {
	RocketChat.models.Rooms.unarchiveById(rid);
	RocketChat.models.Subscriptions.unarchiveByRoomId(rid);
	RocketChat.models.Messages.createUnarchivedWithRoomIdAndUser(rid, Meteor.user());
};
