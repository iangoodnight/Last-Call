var db = require("../models");
// var async = require('async') // look into removing this later

const { body, validationResult } = require('express-validator/check'); // Deprecated, come back and fix
const { sanitizeBody } = require('express-validator/filter'); // Deprecated, come back and fix

module.exports = {
	//
	// CREATE
	//
	// Create a Job
	create: async (req, res, next) => {
		console.log("Hitting jobController.create...");
		let newJob = await db.Job.create(req.body);
		let updateCustomer = await db.Customer.findOneAndUpdate(
		{
			_id: req.params.id
		},
		{
			$push: { orders: newJob._id }
		}, {
			new: true,
			upsert: true
		});
		res.json({
			job: newJob,
			customer: updateCustomer
		});

	},
	// Create many Jobs
	createMany: async (req, res, next) => {
		console.log("Hitting jobController.createMany...");
		let newJobs = await db.Job.collection.insertMany(req.body.jobs);
		let jobIds = newJobs.ops.map(job => {
			return job._id
		});
		let updateCustomer = await db.Customer.findOneAndUpdate(
		{
			_id: req.params.id
		},
		{
			$addToSet: { 
				orders: { 
					$each: jobIds
				}
			}
		}, {
			new: true,
			upsert: true
		});
		res.json({
			jobs: newJobs,
			customer: updateCustomer
		});
	},
	//
	// READ
	//
	// Find all Jobs
	findAll: async (req, res, next) => {
		console.log("Hitting jobController.findAll...");
		let allJobs = await db.Job.find(req.body.query).populate("status");
		res.json(allJobs);
	},
	// Find for Job View
	findAndView: async (req, res, next) => {
		console.log("Hitting jobController.findAndView...")
		const statusMap = await db.Status.find({});
		//////// WORK OUT THIS MAPPER
		var mapper = {
			statuses: statusMap,
			getIds: function(arr) {
				if (arr) {
					arr.forEach(name => {
						console.log(`Name: ${name}`);
						this.statuses.filter((status => {
							name === status.status
						}));
					});
				};
				console.log(`Internal statuses: ${this.statuses}`);
			}
		}
		let test = mapper.getIds([
					'new', 
					'corresponding',
					'requested artwork',
					'rendering artwork',
					'pending approval'
				]);
		console.log(`Test: ${test}`);
		/////////////////////////////////////////
		let pageOptions = {
			match: {},
			sort: {},
			limit: 50,
			skip: 0
		};
		if (!req.session.orderQuery) {
			let orderQuery = {
				match: {},
				sort: {},
				limit: 50,
				skip: 0
			};
			req.session.orderQuery = orderQuery;
		};

		switch (req.query.filter) {
			case 'order':
				let orderQueueStatuses = [
					'new', 
					'corresponding',
					'requested artwork',
					'rendering artwork',
					'pending approval'
				];
				let orderQueueIds = orderQueueStatuses.map(status => {
					// console.log(`Status: ${status}`);
					for (const entry in statusMap) {
						// console.log(`Entry: ${statusMap[entry]}`);
						if( statusMap[entry].status === status) {
							return statusMap[entry]._id;
						};
					};
				});
				console.log(orderQueueIds);
				pageOptions.match['status'] = {
					$in: [
						"5ecec9c1fe9fa1604e607952",
						"5ececa20fe9fa1604e607986",
						"5ececaa2fe9fa1604e6079c1",
						"5ececabffe9fa1604e6079cf",
						"5ed6a80afe9fa1604e679ee6"
					]
				};
				console.log('Order queue');
				break;
			case 'production':
				console.log('Production queue');
				break;
			case 'outsourced':
				console.log('Outsourced');
				break;
			case 'hold':
				console.log('On hold');
				break;
			case 'completed':
				console.log('Completed');
				break;
			case 'cancelled':
			 	console.log('Cancelled');
			 	break;
			default:
				break;
		};

		try {

			const data = await db.Job
				.find({/*pageOptions.match*/})
					// .populate('queue')
				// .where({status: {$in: ["5ececad4fe9fa1604e6079d7"]}})
				// .skip(parseInt(req.query.skip))
				// .limit(parseInt(req.query.limit))
				// .sort(sort)
				.populate('status', 'sortOrder')
				// .populate('queue')
				.populate("customer")
				.lean()
				// .exec(function(err, docs) {
				// 	let queue = docs.filter(doc => doc.status.sortOrder < 4);
				// 	return queue;
				// });

			console.log("Data: ", data);

			res.render('order', {
				title: 'Suicide by JavaScript',
				bodyClass: 'order',
				order: data,
				active: {
					active_order: true,
					user: req.user,
				}
			});
		} catch (error) {
			console.log(error);
			// res.status(500).send();
		};
	},
	//
	// UPDATE
	//
	updateOne: async (req, res, next) => {
		console.log('Hitting jobController.updateOne...');
		let id = req.params.id;
		try {
			let updatedJob = await db.Job
				.findByIdAndUpdate(
					id,
					{
						$set: req.body
					},
					{
						new: true,
						upsert: true,
						runValidators: true,
						setDefaultsOnInsert: true
					}
				);
			res.json(updatedJob);			
		} catch (error) {
			console.log(error);
		};
	},
	updateMany: async (req, res, next) => {
		console.log('Hitting jobController.updateMany...');
		console.log(req.body);
		let ids = req.body.ids;
		let newStatus = req.body.status;
		console.log(`Ids: ${ids}, newStatus: ${newStatus}`);
		try {
			let updatedJobs = await db.Job
				.updateMany(
					{ 
						_id: {
							$in: ids
						}
					},
					{
						$set: { status: newStatus }
					},
					{
						multi: true
					}
				);
			console.log(updatedJobs);
			res.json(updatedJobs);
		} catch (error) {
			console.log(error);	
		};
	},
	//
	// DELETE
	//
}