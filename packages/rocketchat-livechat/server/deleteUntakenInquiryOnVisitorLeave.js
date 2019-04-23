/* globals UserPresenceEvents */
Meteor.startup(() => {
	UserPresenceEvents.on('setStatus', (session, status, metadata) => {
		if (status === 'offline' && metadata && metadata.visitor) {
			// console.log(`Livechat visitor with token ${ metadata.visitor } went offline! -> Closing room and inquiry...`);
			// remove visitor's inquiry so that it doesn't take a spot in the "queue"
			const token = metadata.visitor;
			const rooms = RocketChat.models.Rooms.findOpenByVisitorToken(token).fetch();
			const room = rooms && rooms[0];

			if (!room || room.servedBy) {
				// if room was not found or the inquiry is already being served, do nothing
				// console.log('Room is already being served -> Doing nothing...');
				return;
			}

			Meteor.call('livechat:closeByVisitor', { roomId: room._id, token }, (error) => {
				if (error) {
					// console.log(`Failed to close livechat room ${ room._id } on visitor leave. ${ JSON.stringify(error) }`);
					return false;
				}
				// console.log(`Successfully closed open livechat for visitor with token ${ token }!`);
				return true;
			});
		}
	});
});
