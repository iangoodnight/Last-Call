const router = require('express').Router();
const bcRoutes = require('./bc');
const customerRoutes = require('./customers');
const jobRoutes = require('./jobs');
const statusRoutes = require('./statuses');
const userRoutes = require('./users');

router.use('/bc', bcRoutes);
router.use('/customer', customerRoutes);
router.use('/job', jobRoutes);
router.use('/status', statusRoutes);
router.use('/user', userRoutes);

module.exports = router;