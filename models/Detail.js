var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schemaOptions = {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updatedAt'
	}
}

var detailSchema = new Schema({
	upc: { 
		type: String, 
		max: 100 
	},
	po: { 
		type: String 
	},
	qty: {
		type: Number,
	},
	dimensions: {
		dim1: {
			type: String,
		},
		dim2: {
			type: String,
		}
	},
	priority: {
		type: Boolean,
		default: false
	},
	artwork: {
		type: String
	},
	laminate: {
		type: String
	},
	notes: {
		type: String
	},
	outsourced_company: {
		type: String,
		default: null
	}

}, schemaOptions);

// Create the Detail model using the detailSchema
var Detail = mongoose.model('Detail', detailSchema);
// Export model
module.exports = Detail;