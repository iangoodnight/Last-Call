const mongoose = require('mongoose');
// Create a schema class using mongoose's schema method
const Schema = mongoose.Schema;

const schemaOptions = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updatedAt'
    },
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    strict: false
}

// Create Schema
const userSchema = new Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        email_is_verified: {
            type: Boolean,
            default: false
        },
        picture: {
            type: String
        },
        google_id: {
            type: String,
            unique: true
        },
        is_admin: {
            type: Boolean,
            default: false
        },
        roles: [{
            type: String
        }]
    },
    schemaOptions
);

const User = mongoose.model('User', userSchema);

module.exports = User;