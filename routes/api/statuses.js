const router = require('express').Router();
const statusController = require('../../controllers/statusController');
const ah = require('express-async-handler');

//
// CREATE
//
//
// READ
//
router.get('/', ah(statusController.findAllStatuses));
//
// UPDATE
//
//
// DELETE
//
// router.get('/:id', customerController.findOne);

// router.delete('/:id', customerController.delete);

module.exports = router;