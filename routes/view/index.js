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
router.get('/customers', ah(customerController.findAllAndView));
/* GET customer profile */
router.get('/customers/:id', ah(customerController.findOneAndView));
/* UPDATE customer profile */
/* Probably need to move this route to the API directory */
// router.put('customers/:id', ah(customerController.update));
/* GET orders page */
// router.get('/orders', function(req, res, next) {
//   	res.render('order', { 
//   		title: 'Express', 
//   		bodyClass: 'order', 
//   		active: { 
//   			active_jobs: true,
//   			user: req.user,
//   		}
//   	});
// });
// Test findAndView route
router.get('/orders', ah(jobController.findAndView));


module.exports = router;