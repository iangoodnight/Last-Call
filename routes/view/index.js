const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const jobController = require('../../controllers/jobController');
const statusController = require('../../controllers/statusController');
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
/* GET orders page */
router.get('/orders', ah(jobController.findAndView));

router.get('/orders/:filter', ah(statusController.findByQueue));


module.exports = router;