const express=require('express');
const router=express.Router();
const tourController=require('./tourController');

router.route('/top-5-cheapTours').get(tourController.aliasTopTours,tourController.getAllTours)
router.route('/tourStats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
.route('/')
.get(tourController.getAllTours)
.post(tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updatedTour)
.delete(tourController.deleteTour)

module.exports=router;