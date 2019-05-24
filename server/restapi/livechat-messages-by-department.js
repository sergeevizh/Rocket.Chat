RocketChat.API.v1.addRoute('livechat/messages/getByDepartment/:id', { authRequired: true }, {
	get() {
		if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-manager')) {
			return RocketChat.API.v1.unauthorized();
		}

		// Sanitize the request
		const params = this.requestParams();
		check(params, {
			rid: Match.Maybe(String)
		});

		const { rid } = params;

		const id = this.urlParams.id;
		const queryParams = {
			department: id
		};

		// If rid exists, add it to the query
		if (rid && typeof rid === 'string') {
			queryParams.rid = rid;
		}

		// Find messages by department and possibly room ID
		const messages = RocketChat.models.LivechatInquiry.find(queryParams);

		return RocketChat.API.v1.success({
			messages: messages.map((message) => {
				return {
					name: message.name,
					message: message.message,
					rid: message.rid
				};
			})
		});
	}
});
