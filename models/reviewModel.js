const mongoose=require('mongoose');
const slugify=require('slugify');
const Tour=require('./tourModels')
const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review cannot be empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must belong to a user']
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
);

//index
reviewSchema.index({tour:1,user:1},{unique:true});


//querymiddleware
reviewSchema.pre(/^find/,function(next){
   /*  this.populate({
        path:'tour',
        select:'name'
    }).populate({
        path:'user',
        select:'name'
        
    }) */

    this.populate({
        path:'user',
        select:'name'
        
    })
    next();
})

//calculating Average Ratings
reviewSchema.statics.calAverageRatings=async function(tourId){
    console.log(tourId);
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    console.log(stats);
    //saving statistics to current tour
     await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
    //in order to use it,we are calling the function after a new review has been created 
    reviewSchema.post('save',function(){
        //this points to current review
        this.constructor.calAverageRatings(this.tour);
    }) 

    //findByIdAndUpdate
    //findByIdAndDelete

    reviewSchema.pre(/^findOneAnd/,async function (next){
        this.r=await this.findOne();
        console.log(this.r);
        next();
    })
     
    reviewSchema.post(/^findOneAnd/, async function(){
        await this.r.constructor.calAverageRatings(this.r.tour);
    })
}


const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;