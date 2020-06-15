const router = require('express').Router();
const customerRoutes = require('./customers');
const jobRoutes = require('./jobs');
const userRoutes = require('./users');

router.use('/customer', customerRoutes);
router.use('/job', jobRoutes);
router.use('/user', userRoutes);

module.exports = router;