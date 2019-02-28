import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
	registerAnonymousUser(nickname) {
		const AllowAnonymousWrite = RocketChat.settings.get('Accounts_AllowAnonymousWrite');
		if (!AllowAnonymousWrite) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'setUserActiveStatus',
			});
		}

		check(nickname, String);
		console.log(`Registering a new anonymous user with nickname '${ nickname }.'`);

		const options = {};
		const user = {
			username: nickname,
			name: nickname,
			globalRoles: [
				'anonymous',
			],
		};

		const userId = Accounts.insertUserDoc(options, user);

		const { id, token } = Accounts._loginUser(this, userId);

		return { id, token };
	},
});
