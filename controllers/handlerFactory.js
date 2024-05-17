const AppError=require('./../utils/appError');
const APIFeatures=require('../utils/apiFeatures');
const catchAsync=require('./../utils/catchAsync');
exports.deleteOne=Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError('No document found with that ID',404))
    }
    res.status(200).json({
    status:'success',
    data:null
})
}
)
exports.createOne=Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.create(req.body);
    if(!doc){
        return next(new AppError('No document found with that ID',404))
    }
    res.status(201).json({
        status:'success',
        data:{
         doc
         }
    })
    }
)
exports.updateOne=Model=>catchAsync(async(req,res,next)=>{
    const doc= await Model.findByIdAndUpdate(req.params.id,req.body,{
     new:true,
     runValidators:true
    });
    if(!doc){
     return next(new AppError('No document found with that ID',404))
 }
     res.status(200).json({
         status:'success',
         data:{
            doc
         }
     })
})
exports.getOne=(Model,popOptions)=>catchAsync(async(req,res,next)=>{
    let query=Model.findById(req.params.id);
    if(popOptions) query=query.populate(popOptions)
    //const doc=await Model.findById(req.params.id).populate('reviews');
    const doc=await query;
     //adding 404
     if(!doc){
        return next(new AppError('No document found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:{
            doc
        }
    }) 
}
) 
exports.getAll=Model=>catchAsync(async(req,res,next)=>{
    //To allow nested GET reviews on tour
    let filter={};
    if(req.params.tourId) filter={tour:req.params.tourId};
    //Execute Query
    const features=new APIFeatures(Model.find(filter),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const doc=await features.query;
    res.status(200).json({
        status:'success',
         data:{
            Results:doc.length,
             data:doc
         }
    })
}
)
