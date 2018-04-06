/* globals SyncedCron */
function removeAnonymousUsers() {
	const anonymousUsers = RocketChat.models.Users.findAnonymousUsersCreatedOverADayAgo().fetch();

	anonymousUsers.forEach(user => {
		RocketChat.models.Subscriptions.removeByUserId(user._id);
		RocketChat.models.Users.removeById(user._id);
	});
}

Meteor.startup(function() {
	Meteor.defer(function() {
		removeAnonymousUsers();

		SyncedCron.add({
			name: 'Remove anonymous users',
			schedule: (parser) => parser.cron('0 5 * * *'),
			job: removeAnonymousUsers
		});

		return SyncedCron.start();
	});
});
