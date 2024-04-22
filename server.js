const mongoose=require('mongoose');
const dotenv=require('dotenv');
const app=require('./app.js');
dotenv.config({path:'./config.env'});
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
console.log('hii '+process.env.NODE_ENV)
mongoose
.connect(DB,{
   
})
.then(()=>
    console.log('DB connection successful...')
)
const port=process.env.PORT||3000;
const server=app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
});
//UNHANDLEDREJECTION
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log('UNHANDLED REJECTION,SHUTTING DOWN');
    server.close(()=>{
        process.exit(1);
    })
    })
//UNCAUGHTEXCEPTIN
 process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    console.log('UncaughtException! shutting down..');
    server.close(()=>{
        process.exit(1)
    })
}) 



