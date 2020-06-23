//  Customer Model

//  Require Mongoose
var mongoose = require('mongoose');

// Create a schema class using mongoose's schema method
var Schema = mongoose.Schema;

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var schemaOptions = {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updatedAt'
	},
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
}

// Create the headlineSchema with our schema class
var customerSchema = new Schema({
  	// company, a string, must be entered
  	company: {
    	type: String,
    	required: true
  	},
  	// contact
  	contact_first: {
    	type: String
  	},
  	// contact
  	contact_last: {
    	type: String
  	},
  	// email, a string for now, check on mongoose methods
  	email: {
    	type: String,
    	trim: true,
    	lowercase: true,
    	unique: true,
    	// required: 'Email address is required',
    	// validate: [validateEmail, 'Please fill a valid email address'],
  	},
  	// phone, a string for now, check on mongoose methods
  	phone: {
    	type: String,
    	// validate: {
    	// 	validator: function(v) {
    	// 		return /\d{3}-\d{3}-\d{4}/.test(v);
    	// 	},
    	// 	message: '{VALUE} is not a valid phone number!'
    	// },
  	},
  	in_house: {
  		type: Boolean,
  		default: false
  	},
    orders: [{
      type: Schema.Types.ObjectId,
      ref: 'Job'
    }],
    bc: {
      id: {
        type: Number
      },
      provider: {
        type: String
      }
    },
  	// Author is the person creating the record
  	createdBy: {
  		type: String
  	}
}, schemaOptions);

customerSchema.virtual('name').get(function() {
  let fullname = '';
  if (this.contact_first && this.contact_last) {
    fullname = this.contact_last + ', ' + this.contact_first;    
  } else if (this.contact_first && !this.contact_last) {
    fullname = this.contact_first;
  } else if (!this.contact_first && this.contact_last) {
    fullname = this.contact_last;    
  };
  return fullname;
})

// Create the Customer model using the customerSchema
var Customer = mongoose.model('Customer', customerSchema);

// Export the Customer model
module.exports = Customer;