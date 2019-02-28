import { Meteor } from 'meteor/meteor';


Meteor.publish('allUsers', function() {
	if (!this.userId) {
		return this.ready();
	}

	return RocketChat.models.Users.findUsers({
		fields: {
			username: 1,
			name: 1,
			status: 1,
			utcOffset: 1,
			roles: 1,
		},
	});
});

