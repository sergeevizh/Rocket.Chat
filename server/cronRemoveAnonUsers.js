/* globals SyncedCron */

function removeAnonymousUsers() {
	const anonymousUsers = RocketChat.models.Users.findExpiredAnonymousUsers().fetch();
	for (const user of anonymousUsers) {
		Meteor.runAsUser(user._id, () => {
			Meteor.call('rooms/get', (error, result) => {
				for (const room of result) {
					RocketChat.removeUserFromRoom(room._id, user);
				}
				RocketChat.deleteUser(user._id);
			});

		});
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
