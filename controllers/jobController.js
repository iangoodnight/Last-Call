var db = require("../models");
// var async = require('async') // look into removing this later

const { body, validationResult } = require('express-validator/check'); // Deprecated, come back and fix
const { sanitizeBody } = require('express-validator/filter'); // Deprecated, come back and fix

module.exports = {
	// Find all Jobs
	findAll: async (req, res, next) => {
		console.log("Hitting jobController.findAll...");
		let allJobs = await db.Job.find(req.body.query).populate("status");
		res.json(allJobs);
	},
	// Find one Job
	// Create a Job
	create: async (req, res, next) => {
		let newJob = await db.Job.create(req.body.jobs);
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
	// Find for Job View
	findAndView: async (req, res, next) => {
		console.log("Hitting jobController.findAndView...")
		console.log("Request Query: ", req.query);
		console.log("Session Request: ", req.session);
		let match = {};
		let sort = {};

		try {

			const data = await db.Job
				.find({})
				.where(match)
				// .skip(parseInt(req.query.skip))
				// .limit(parseInt(req.query.limit))
				// .sort(sort)
				.populate("status")
				.populate("customer")
				.lean();

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
		}
	}
}