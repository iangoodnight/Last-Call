const router = require('express').Router();
const customerController = require('../../controllers/customerController');
const ah = require('express-async-handler');
//
// CREATE
//
router.post('/', ah(customerController.create));
//
// READ
//
router.get('/', ah(customerController.findAll));
router.get('/f/', ah(customerController.find));
router.get('/:id', ah(customerController.findById));
router.get('/q/:query', ah(customerController.findSome));
//
// UPDATE
//
router.put('/:id', ah(customerController.update));
//
// DELETE
//
router.delete('/:id', ah(customerController.delete));

module.exports = router;