const express = require('express');
const tourController = require('../controllers/tourControllers');

// Here we have created sub apps, sub routers
const router = express.Router();

// router.param('id', tourController.checkID);

const {getAllTours, createTour, getTour, updateTour, deleteTour} = tourController;

// We only need the route / because when we get a request for this URL,
// the req goes into middleware stack and when the URL matches the tourRouter middleware function will run
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
