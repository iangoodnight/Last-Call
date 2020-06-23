const router = require('express').Router();
const customerRoutes = require('./customers');
const bcRoutes = require('./bc');
const jobRoutes = require('./jobs');
const userRoutes = require('./users');

router.use('/customer', customerRoutes);
router.use('/bc', bcRoutes);
router.use('/job', jobRoutes);
router.use('/user', userRoutes);

module.exports = router;