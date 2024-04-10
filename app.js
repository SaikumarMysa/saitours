const express=require('express');
const morgan=require('morgan');
const app=express();
const tourRouter=require('./tourRoutes');
//middlewares
if(process.env.NODE_ENV==='development')
{
    app.use(morgan('dev'));
}
app.use(express.json());
app.use((req,res,next)=>{
    console.log('Hello from middleware')
    next();
})
app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    next();
})
//Routes
app.use('/api/v1/tours/',tourRouter);
module.exports=app;