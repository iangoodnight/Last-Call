//  Status Model

//  Require Mongoose
var mongoose = require('mongoose');

// Create a schema class using mongoose's schema method
var Schema = mongoose.Schema;

var schemaOptions = {
	collection: 'job_statuses'
}

// Create the statusSchema with our schema class
var statusSchema = new Schema({
  	// status, all pre-entered
  	status: {
    	type: String,
    	required: true
  	}
}, schemaOptions);

// Create the Status model using the statusSchema
var Status = mongoose.model('Status', statusSchema);

// Export the Status model
module.exports = Status;