const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // req.flash('success', { msg: 'Success!  You are logged in.'});
  // console.log(req.);
  res.redirect(req.session.returnTo || '/', 
  // { 
  // 	// expressFlash: req.flash('success'),
  // 	// sessionFlash: res.locals.sessionFlash
  // }
  );
});
router.get('/logout', (req, res) => {
	console.log("Logged Out..");
	req.logout();
	res.redirect('/');
});

module.exports = router;