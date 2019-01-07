Meteor.methods({
	registerAnonymousUser(nickname) {
		const AllowAnonymousWrite = RocketChat.settings.get('Accounts_AllowAnonymousWrite');
		if (!AllowAnonymousWrite) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'setUserActiveStatus'
			});
		}

		check(nickname, String);
		console.log(`Registering a new anonymous user with nickname '${ nickname }.'`);

		const options = {};
		const user = {
			username: nickname,
			name: nickname,
			globalRoles: [
				'anonymous'
			]
		};

		const userId = Accounts.insertUserDoc(options, user);

		const { id, token } = Accounts._loginUser(this, userId);

		return { id, token };


		// const user = RocketChat.models.Users.findOneById(userId);

		// if (user) {
		// 	RocketChat.models.Users.setUserActive(userId, active);

		// 	if (user.username) {
		// 		RocketChat.models.Subscriptions.setArchivedByUsername(user.username, !active);
		// 	}

		// 	if (active === false) {
		// 		RocketChat.models.Users.unsetLoginTokens(userId);
		// 	} else {
		// 		RocketChat.models.Users.unsetReason(userId);
		// 	}

		// 	const destinations = Array.isArray(user.emails) && user.emails.map(email => `${ user.name || user.username }<${ email.address }>`);

		// 	if (destinations) {
		// 		const email = {
		// 			to: destinations,
		// 			from: RocketChat.settings.get('From_Email'),
		// 			subject: Accounts.emailTemplates.userActivated.subject({active}),
		// 			html: Accounts.emailTemplates.userActivated.html({active, name: user.name, username: user.username})
		// 		};

		// 		Meteor.defer(() => Email.send(email));
		// 	}

		// 	return true;
		// }

		// return false;
	}
});
