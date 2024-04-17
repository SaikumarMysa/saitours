const Tour=require('../models/tourModels');
const APIFeatures=require('../utils/apiFeatures');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
exports.aliasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
}

//R-Read//Retriving the docuement
exports.getAllTours=catchAsync(async(req,res,next)=>{
    
    //Execute Query
    const features=new APIFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours=await features.query;
    //const tours= await query;
    res.status(200).json({
        status:'success',
         data:{
            Results:tours.length,
             tours:tours
         }
    })

}
)
//Retriving document by passing id
exports. getTour=catchAsync(async(req,res,next)=>{
   
    const tour=await Tour.findById(req.params.id);

     //adding 404
     if(!tour){
        return next(new AppError('No tour found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
   
}
)
 
//U-update::updating document
exports. updatedTour=catchAsync(async(req,res,next)=>{
    
       const tour= await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
       });

       if(!tour){
        return next(new AppError('No tour found with that ID',404))
    }
       
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })
    
})


//C:Create
exports. createTour=catchAsync(async(req,res,next)=>{
    const newTour=await Tour.create(req.body);

    if(!tour){
        return next(new AppError('No tour found with that ID',404))
    }

    res.status(201).json({
        status:'success',
        data:{
        tour:newTour
         }
    })
    }
)
//D:Delete
exports. deleteTour=catchAsync(async(req,res,next)=>{
    
        const tour=await Tour.findByIdAndDelete(req.params.id);

        if(!tour){
            return next(new AppError('No tour found with that ID',404))
        }

        res.status(200).json({
        status:'success',
        data:null
    })
}
)

exports.getTourStats=catchAsync(async(req,res,next)=>{
    
        const stats=await Tour.aggregate([
           {
            $match:{ratingsAverage:{$gte:4.5}}
           },
           {
            $group:{
                _id:'$difficulty',
                numTours:{$sum:1},
                numRatings:{$sum:'$ratingsQuantity'},
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxprice:{$max:'$price'}
            }
           }
        ]) 
        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        })  
    

})
exports.getMonthlyPlan=catchAsync(async(req,res)=>{
    
        const year=req.params.year*1;
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            }
            /*{
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields:{month:'$_id'}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{numTourStarts:-1}
            },
            {
                $limit:6
            }*/
        ]);
        res.status(200).json({
            status:'success',
            data:{
                plan
            }
        })
    
})