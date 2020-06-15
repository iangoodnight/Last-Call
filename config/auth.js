const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = (pasport) => {
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
	},
	async (token, refreshToken, params, profile, done) => {
		console.log("Params: ", params);
		// const userId = mongoose.Types.ObjectId(profile.id);
		// const userId = profile.id;
		const userObject = {
			name: profile.displayName,
			email: profile._json.email,
			email_is_verified: profile._json.email_verified,
			picture: profile._json.picture,
			google_id: profile.id			
		};

		// console.log("ID: ", userId);
		console.log("User: ", userObject);
		let user = await User.findOneAndUpdate(
			{google_id: profile.id},
			userObject,
			{
				upsert: true,
				new: true
			},
			(err, doc) => {
				if (err) {
					console.log(err);
				} else {
					return doc;
				}
			}
		);

		return done(null, {
			profile: profile,
			token: token,
			user: user
		});
	}));
};