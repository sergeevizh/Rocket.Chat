import LivechatVisitors from '../models/LivechatVisitors';

Meteor.methods({
	'livechat:getQueuePosition'(token) {
		check(token, String);

		const visitor = LivechatVisitors.getVisitorByToken(token);

		if (!visitor) {
			throw new Meteor.Error('error-not-authorized', 'Invalid visitor token', { method: 'livechat:getQueuePosition' });
		}

		const inquiry = RocketChat.models.LivechatInquiry.findOne({ 'v._id': visitor._id, status: 'open' });

		if (!inquiry) {
			return 0;
		}

		return RocketChat.models.LivechatInquiry.find({ department: visitor.department, ts: { $lt: inquiry.ts }, status: 'open' }).count() + 1;
	}
});
