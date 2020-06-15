var db = require('../models');
var async = require('async') // look into removing this later

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

module.exports = {
	//
	// CREATE
	//
	// Create a new customer
	create: async (req, res, next) => {
		console.log("Hitting customerController.create...");
		let newCustomer = await db.Customer.create(req.body.customer);
		res.json(newCustomer);
	},
	//
	// READ
	//
	// Find One
	findById: async (req, res, next) => {
		let customer = await db.Customer.findById(req.params.id);
		res.json(customer);	
	},
	// Find All
	findAll: async (req, res, next) => {
		let allCustomers = await db.Customer.find({});
		res.json(allCustomers);
	},
	// Filtered Find
	find: async (req, res, next) => {
		console.log("Request object: ", req.body.query);
		let theseCustomers = await db.Customer.find(req.body.query);
		res.json(theseCustomers);
	},
	// Find All via Search
	findSome: async (req, res, next) => {
		console.log("Hitting customerController.findSome...");		
		let queries = req.params.query.split(" ");
		let regexes = queries.map(query => {
			return new RegExp(query, 'i');
		});
		let regex = new RegExp(req.params.query, 'i');
		let queryResults = await db.Customer.find({
			$or: [
				{
					'contact_first': {
						$in: regexes
					}
				},
				{
					'contact_last': {
						$in: regexes
					}
				},
				{
					'company': {
						$in: regexes
					}
				}
			]
		})
		let formattedResults = queryResults.map(result => {
			let formatted = result.name + ' (' + result.company + ')';
			return {
				label: formatted,
				value: formatted,
				id: result._id,
				in_house: result.in_house
			};
		});
		res.json(formattedResults);
	},
	// Find and return for display
	findAllView: async (req, res, next) => {
		const match = {};
		const sort = {};
		const pageOptions = {};

		if (req.query.inHouse) {
			match.in_house = req.query.inHouse === 'true';
		} else if (req.session.customerQuery.inHouse) {
			console.log("fallback..");
			match.in_house = req.session.customerQuery.inHouse === 'true';
		};

		if (req.query.sortBy && req.query.orderBy) {
			sort[req.query.sortBy] = req.query.orderBy === 'desc' ? -1 : 1;
		};

		// console.log("Query Object: ", req.query);
		// const pageOptions = req.query;
		req.session.customerQuery = req.query;

		try {

			// console.log("req: ", req);

			const data = await db.Customer
				.find({})
				.where(match)
				.skip(parseInt(req.query.skip))
				.limit(parseInt(req.query.limit))
				.sort(sort)
				.lean();
				// .populate('orders', { open: true })
				// match,
				// options: {
				// 	limit: parseInt(req.query.limit),
				// 	skip: parseInt(req.query.skip),
				// 	sort
				// }
			// });
			// res.cookie(test, "Rude Canadian");
			// res.json(data);
			res.render('customer', {
				title: 'Express',
				bodyClass: 'customer',
				// data: {
				// 	customer: data,
				// },
				customer: data,
				active: { 
					active_customer: true,
					user: req.user,
					options: pageOptions 
				}
			});
		} catch (error) {
			res.status(500).send();
		}


		// let allCustomers = await db.Customer.find({}).lean();
		// console.log(allCustomers);
		// res.render('customer', {
		// 	title: 'Express',
		// 	bodyClass: 'customer',
		// 	// data: {
		// 	// 	customer: allCustomers,
		// 	// },
		// 	customer: allCustomers,
		// 	active: { active_customer: true }
		// });
	},
	//
	// UPDATE
	//
	// 	Update a customer by id
	update: async (req, res, next) => {
		console.log("Hitting customerController.update...", req.body.customer);
		let updatedCustomer = await db.Customer.findByIdAndUpdate(
			// Customer id parsed from request
			req.params.id,
			// Update object
			{
				$set: req.body.customer
			},
			// Options object
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true
			}
		);
		res.json(updatedCustomer);
	},
	//
	// DELETE
	//
	//  Delete a customer with a given id
	delete: async (req, res, next) => {
		let deletedCustomer = await db.Customer.remove({ _id: req.params.id })
		res.json(deletedCustomer);
	}
};