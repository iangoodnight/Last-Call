const router = require('express').Router();
const bigCommerceController = require('../../controllers/bigCommerceController');
const ah = require('express-async-handler');
//
// CREATE
//
//
// READ
//
router.get('/', ah(bigCommerceController.getCustomerByEmail));
//
// UPDATE
//
//
// DELETE
//

module.exports = router;