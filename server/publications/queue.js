const model = RocketChat.models.Subscriptions;

const COLLECTION_NAME = 'room-queue';

const mapper = (fields) => {
	return {
		rid: fields.rid,
		queueing: fields.queueing,
		u: fields.u,
		t: fields.t
	};
};

const fieldsValid = (fields) => fields.queueing !== undefined;


Meteor.publish(COLLECTION_NAME, function(rid) {
	if (!this.userId || !rid) {
		return this.ready();
	}
	const self = this;
	const handle = model.find({rid}).observeChanges({
		added(id, fields) {
			if (fieldsValid(fields)) {
				self.added(COLLECTION_NAME, id, mapper(fields));
			}
		},
		changed(id, fields) {
			if (fieldsValid(fields)) {
				self.changed(COLLECTION_NAME, id, fields);
			}
		},
		removed(id) {
			self.removed(COLLECTION_NAME, id);
		}
	});

	self.ready();

	self.onStop(function() {
		handle.stop();
	});
});
