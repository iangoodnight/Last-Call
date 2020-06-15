var db = require("../models");
const { body, validationResult } = require('express-validator/check'); // Deprecated, come back and fix
const { sanitizeBody } = require('express-validator/filter'); // Deprecated, come back and fix

module.exports = {
	// Find all Details
	// Find one Detail
	// Create a Detail
	create: async (req, res) => {
		console.log("Hitting detailController.create...");
		let newDetail = await db.Detail.create(req.body.details);
		res.json(newDetail);	
	},
	createMany: async (req, res) => {
		console.log("Hitting detailController.createMany...");
		let newDetails = await db.Detail.insertMany(req.body.details);
		res.json(newDetails);
	}
}