var db = require('../models');

module.exports = {
	// Find all Statuses
	findAllStatuses: async (req, res) => {
		console.log('Hitting statusController.findAllStatuses...');
		let statuses = await db.Status.find({}).sort('sortOrder');
		res.json(statuses);
	},
	// Build order Queues
	findByQueue: async (req, res, next) => {
		console.log('Hitting statusController.findByQueue');
		let filter = req.params.filter;
		let filters = new Map();
		let orders = new Array();
		let pageOptions = {
			limit: 100,
			skip: 0
		};
		if (!req.session.orderQuery) {
			let orderQuery = {
				limit: 100,
				skip: 0
			};
			req.session.orderQuery = orderQuery;
		};

		filters
			.set('order-queue', {
				sortOrder: { 
					$lte: 5
				}
			})
			.set('production-queue', { 
				$or: [{ 
					sortOrder: 6 
				}, { 
					sortOrder: 10 
				}, { 
					sortOrder: 11 
				}]
			})
			.set('outsourced', {
				$or: [{
					sortOrder: 7
				}, {
					sortOrder: 8
				}]
			})
			.set('on-hold', {
				sortOrder: 8
			})
			.set('completed', {
				sortOrder: 12
			})
			.set('cancelled', {
				sortOrder: 13
			});
		let search = filters.get(filter);
		let queue = await db.Status
			.find(search)
			.sort('sortOrder')
			.populate({
				path: 'queue',
				populate: {
					path: 'customer',
					model: 'Customer'
				},
			})
			.lean();

		queue.forEach(status => {
			status.queue.forEach(order => order.status = status.status)
			orders.push(...status.queue);
		});
		orders.sort(function(a, b) {
			if (a.customer === null && b.customer !== null) {
				return -1;
			};
			if (a.customer !== null && b.customer === null) {
				return 1;
			};
			if (a.customer === null && b.customer === null) {
				return 0;
			};
			if (a.customer.contact_last < b.customer.contact_last) {
				return -1;
			};
			if (a.customer.contact_last > b.customer.contact_last) {
				return 1;
			};
			return 0;			
		});

		let options = {
			title: 'Job Queues',
			bodyClass: 'order',
			order: orders,
			filter: filter,
			active: {
				active_order: true,
				user: req.user				
			}
		};
		options.active[filter] = true;
		console.log(options);
		res.render('order', options);
	}
}