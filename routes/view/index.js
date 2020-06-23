const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const jobController = require('../../controllers/jobController');
const ah = require('express-async-handler');
const passport = require('passport');



/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('home', { 
  		title: 'Express', 
  		bodyClass: 'home', 
  		active: { 
  			active_home: true,
  			user: req.user
  		},
  	});
  	console.log("Session access: ", req.user);
});
/* GET customers page */
// router.get('/customers', async function(req, res, next) {
// 	let customer = await ah(customerController.findAll);
//   	res.render('customer', { 
//   		title: 'Express', 
//   		bodyClass: 'customer',
//   		customer: customer, 
//   		active: { active_customer: true }});
// });
router.get('/customers', ah(customerController.findAllView));
/* GET orders page */
router.get('/orders', function(req, res, next) {
  	res.render('order', { 
  		title: 'Express', 
  		bodyClass: 'order', 
  		active: { 
  			active_jobs: true,
  			user: req.user,
  		}
  	});
});
// Test findAndView route
router.get('/order', ah(jobController.findAndView));


module.exports = router;