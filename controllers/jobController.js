var db = require("../models");
var async = require('async') // look into removing this later

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
	}
}