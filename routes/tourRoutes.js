const express=require('express');
const router=express.Router();
const tourController=require('../controllers/tourController');
const authController=require('./../controllers/authController')
//const reviewController=require('./../controllers/reviewController')
const reviewRouter=require('./reviewRoutes')

router
.route('/top-5-cheapTours')
.get(tourController.aliasTopTours,tourController.getAllTours)

router
.route('/tourStats')
.get(tourController.getTourStats);

router
.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan); 

router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getTourWithin);

router
.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);


router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.updatedTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)

router.use('/:tourId/reviews',reviewRouter);

module.exports=router;
