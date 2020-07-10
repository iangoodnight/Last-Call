const router = require('express').Router();
const jobController = require('../../controllers/jobController');
const ah = require('express-async-handler');

//
// CREATE
//
router.post('/:id', ah(jobController.create));
router.post('/m/:id', ah(jobController.createMany));
//
// READ
//
router.get('/', ah(jobController.findAll));
//
// UPDATE
//
router.put('/m/', ah(jobController.updateMany));
router.put('/:id', ah(jobController.updateOne));
//
// DELETE
//
// router.get('/:id', customerController.findOne);

// router.delete('/:id', customerController.delete);

module.exports = router;