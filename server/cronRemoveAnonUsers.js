/* globals SyncedCron */

function removeAnonymousUsers() {
	const anonymousUsers = RocketChat.models.Users.findExpiredAnonymousUsers().fetch();

	for (const user of anonymousUsers) {
		let rooms = [];
		Meteor.runAsUser(user._id, () => {
			rooms = Meteor.call('rooms/get');
		});

		for (const room of rooms) {
			RocketChat.removeUserFromRoom(room._id, user);
			RocketChat.deleteUser(user._id);
		}
	}
}

Meteor.startup(function() {
	Meteor.defer(function() {
		removeAnonymousUsers();

		SyncedCron.add({
			name: 'Remove anonymous users',
			schedule: (parser) => parser.cron('*/5 * * * *'),
			job: removeAnonymousUsers
		});

		return SyncedCron.start();
	});
});
