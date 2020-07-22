var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var schemaOptions = {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updatedAt'
	},
	toJson: {
		virtuals: true
	}
}

var jobSchema = new Schema({
	artwork: {
		type: String
	},
	artworkHref: {
		type: String
	},
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'Customer'
	},
	dimensions: {
		dim1: {
			type: String,
		},
		dim2: {
			type: String,
		}
	},
	laminate: {
		type: String
	},
	machine: {
		type: String
	},
	notes: {
		type: String
	},
	open: { 
		type: Boolean, 
		default: true 
	},
	order_number: { 
		type: String, 
		max: 100 
	},
	outsourced: {
		type: Boolean,
		default: false
	},
	outsourced_company: {
		type: String,
		default: null
	},
	po: { 
		type: String 
	},
	priority: {
		type: Boolean,
		default: false
	},
	qty: {
		type: Number,
	},
	status: {
		type: Schema.Types.ObjectId,
		ref: 'Status',
		default: '5ed6a80afe9fa1604e679ee6'
	},
	upc: { 
		type: String, 
		max: 100 
	}
}, schemaOptions);

// jobSchema.virtual('statusDetails;

// Create the Job model using the jobSchema
var Job = mongoose.model('Job', jobSchema);
// Export model
module.exports = Job;
