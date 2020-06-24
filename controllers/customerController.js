var db = require('../models');
// var async = require('async') // look into removing this later

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
				},
				{
					'email': {
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
	//
	// FIND AND VIEW
	//
	findOneAndView: async (req, res, next) => {
		try {
			console.log(req.params.id);
			let customer = await db.Customer.findById(req.params.id)
				.populate({
					path:'orders',
					populate: {
						path: 'status'
					}
				})
				.populate('status')
				.lean();


			console.log(customer);
			res.render('customerProfile', {
				title: 'Express',
				bodyClass: 'customer-profile',
				customer: customer,
				active: { 
					active_customer: true,
					user: req.user,
				}
			});			
		} catch (error) {
			console.log(error);
		};

	},
	// Find and return for display
	findAllAndView: async (req, res, next) => {
		console.log("Request Query: ", req.query);
		console.log("Session Request: ", req.session);
		// let match = {};
		// let sort = {};
		let pageOptions = {
			match: {},
			sort: {},
			limit: 25,
			skip: 0
		};

		switch (req.query.inHouse) {
			case 'true':
				pageOptions.match = { in_house: true };
				break;
			case 'false':
				pageOptions.match = { in_house: false };
				break;
			default:
				req.session.customerQuery.match ? pageOptions.match = req.session.customerQuery.match :
					pageOptions.match = { in_house: false };
				break;
		};

		if (req.query.sortBy) {
			if (req.query.orderBy) {
				if (req.query.orderBy === 'desc') {
					pageOptions.sort[req.query.sortBy] = -1;
					pageOptions.order = false;				
				} else {
					pageOptions.sort[req.query.sortBy] = 1;	
					pageOptions.order = true;					
				}
			} else {
				pageOptions.sort[req.query.sortBy] = 1;
				pageOptions.order = true;
			}
		} else {
			pageOptions.sort = req.session.customerQuery.sort;
			pageOptions.order = req.session.customerQuery.order;
		};

		if (req.query.limit) {
			pageOptions.limit = parseInt(req.query.limit);
		} else if (req.session.customerQuery.limit) {
			pageOptions.limit = parseInt(req.session.customerQuery.limit);
		};

		if (req.query.skip) {
			pageOptions.skip = parseInt(req.query.skip);
		} else if (req.session.customerQuery.skip) {
			pageOptions.skip = parseInt(req.session.customerQuery.skip);
		}

		pageOptions.index = pageOptions.skip + 1;

		req.session.customerQuery = pageOptions;
		// console.log("Match... ", match);
		console.log("PageOptions... ", pageOptions);
		console.log("CustomerQuery... ", req.session.customerQuery);

		try {

			const data = await db.Customer
				.find({})
				.where(pageOptions.match)
				.skip(parseInt(req.query.skip))
				.limit(pageOptions.limit)
				.sort(pageOptions.sort)
				.lean();

			const count = await db.Customer.countDocuments( pageOptions.match );
			let pages = Math.ceil(count/pageOptions.limit);
			let currentPage = Math.ceil(pageOptions.skip/pageOptions.limit) + 1;
			console.log("Current: ", currentPage);
			let pageArray = [];
			for (let i = 0; i < pages; i++) {
				let page = i + 1;
				let skip = (page - 1)*pageOptions.limit;
				if (page - currentPage  >= -1) {
					if (page - currentPage === -1) {
						page = '...';
						pageArray.push({
							page: page,
							skip: skip
						});
					} else if (page - currentPage <= 6) {
						if (page - currentPage === 6) {
							page = '...';
						};
						pageArray.push({
							page: page,
							skip: skip
						});
					};
				};
			};
			pageOptions.pagination = pageArray;

			console.log("Document count: ", pages, " ", pageArray);

			res.render('customer', {
				title: 'Express',
				bodyClass: 'customer',
				pageOptions: pageOptions,
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