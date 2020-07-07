var db = require('../models');

module.exports = {
	// Find all Statuses
	findAllStatuses: async (req, res) => {
		console.log('Hitting statusController.findAllStatuses...');
		let statuses = await db.Status.find({});
		res.json(statuses);
	}
}