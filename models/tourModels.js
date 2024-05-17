const mongoose=require('mongoose');
const slugify=require('slugify');
const User=require('./userModel')
//creating Schema 
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'a tour must have a name'],
        unique:true,
        maxlength:[30,'A tour name should not exceed 30 characters!!'],
        minlength:[10,'A tour name should not less than 10 characters']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a groupsize']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{
           values: ['difficult','easy','medium'],
           message:'Difficulty is either:easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1'],
        max:[5,'Rating must be below 5'],
        set:val=> Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'a tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                //this only points to current doc on new document creation
                return val<this.price;
    
            },
            message:'Discount price({VALUE}) should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //GeoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:[Number]
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    /* reviews:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'Review'
        }
    ] */
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

//single-index
//tourSchema.index({price:1})

//compound-index
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})

//geospatial index
tourSchema.index({ startLocation: '2dsphere' });

//Document middleware: runs before .save() and .create()
// tourSchema.pre('save',function(next){
//     this.slug=slugify(this.name,{lower:true});
//     next();
// });
// tourSchema.pre('save',function(next){
//     console.log('Will save document');
//     next();
// });
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// });

tourSchema.pre('save',async function(next){
    const guidePromises=this.guides.map(async id=>await User.findById(id));
    this.guides=await Promise.all(guidePromises);
    next();
})



//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});


//Query Middleware::
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next();
})
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
})
tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now()-this.start} milliseconds!!`);
    //console.log(docs);
    next();
})

//Aggregation Middleware

/* tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    console.log(this.pipeline());
    next();
}) */
//creating a model
const Tour=mongoose.model('Tour',tourSchema);

module.exports=Tour;