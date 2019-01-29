class LivechatInquiry extends RocketChat.models._Base {
	constructor() {
		super('livechat_inquiry');

		this.tryEnsureIndex({ 'rid': 1 }); // room id corresponding to this inquiry
		this.tryEnsureIndex({ 'name': 1 }); // name of the inquiry (client name for now)
		this.tryEnsureIndex({ 'message': 1 }); // message sent by the client
		this.tryEnsureIndex({ 'ts': 1 }); // timestamp
		this.tryEnsureIndex({ 'code': 1 }); // (for routing)
		this.tryEnsureIndex({ 'agents': 1}); // Id's of the agents who can see the inquiry (handle departments)
		this.tryEnsureIndex({ 'status': 1}); // 'open', 'taken'
	}

	findOneById(inquiryId) {
		return this.findOne({ _id: inquiryId });
	}

	/*
	 * mark the inquiry as taken
	 */
	takeInquiry(inquiryId) {
		this.update({
			'_id': inquiryId
		}, {
			$set: { status: 'taken' }
		});
	}

	/*
	 * mark the inquiry as closed
	 */
	closeByRoomId(roomId, closeInfo) {
		return this.update({
			rid: roomId
		}, {
			$set: {
				status: 'closed',
				closer: closeInfo.closer,
				closedBy: closeInfo.closedBy,
				closedAt: closeInfo.closedAt,
				chatDuration: closeInfo.chatDuration
			}
		});
	}

	/*
	 * mark inquiry as open
	 */
	openInquiry(inquiryId) {
		this.update({
			'_id': inquiryId
		}, {
			$set: { status: 'open' }
		});
	}

	/*
	 * return the status of the inquiry (open or taken)
	 */
	getStatus(inquiryId) {
		return this.findOne({'_id': inquiryId}).status;
	}

	updateVisitorStatus(token, status) {
		const query = {
			'v.token': token,
			status: 'open'
		};

		const update = {
			$set: {
				'v.status': status
			}
		};

		return this.update(query, update);
	}

	findNextForDepartment(departmentId) {
		const inquiries = this.find({ department: departmentId }, { sort: { ts: 1 } }).fetch();
		return inquiries && inquiries[0];
	}

	addAgentToInquiriesByDepartmentId(departmentId, agentId) {
		console.log(`Adding agent ${ agentId } to the agent set of existing inquiries for department ${ departmentId }!`);
		const query = {
			department: departmentId
		};

		const update = {
			$addToSet: {
				agents: agentId
			}
		};

		return this.update(query, update, { multi: true });
	}

	removeAgentFromInquiriesByDepartmentId(departmentId, agentId) {
		console.log(`Removing agent ${ agentId } from the agents set of inquiries for department ${ departmentId }!`);
		const query = {
			department: departmentId
		};

		const update = {
			$pull: {
				agents: agentId
			}
		};

		return this.update(query, update, { multi: true });
	}
}

RocketChat.models.LivechatInquiry = new LivechatInquiry();
