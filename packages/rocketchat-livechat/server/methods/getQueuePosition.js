import LivechatVisitors from '../models/LivechatVisitors';

Meteor.methods({
	'livechat:getQueuePosition'(token) {
		check(token, String);

		const visitor = LivechatVisitors.getVisitorByToken(token);

		if (!visitor) {
			throw new Meteor.Error('error-not-authorized', 'Invalid visitor token', { method: 'livechat:getQueuePosition' });
		}

		const inquiry = RocketChat.models.LivechatInquiry.findOne({ 'v._id': visitor._id });

		if (!inquiry || inquiry.status === 'closed') {
			throw new Meteor.Error('error-not-active-livechat', 'You are not currently in an active livechat session!', { method: 'livechat:getQueuePosition' });
		}

		if (inquiry.status === 'taken') {
			// already taken -> queue position = 0
			return 0;
		}

		const inquiriesBefore = RocketChat.models.LivechatInquiry.findOpenInquiriesForDepartmentBefore(inquiry.department, inquiry.ts).fetch();
		return inquiriesBefore.length + 1;
	}
});
