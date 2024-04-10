const mongoose=require('mongoose');
const dotenv=require('dotenv');
const app=require('./app.js');
dotenv.config({path:'./config.env'});
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
.connect(DB,{
    //The empty object {} can be used to pass options to the MongoDB driver, such as connection settings or authentication details.
})
.then(()=>
    console.log('DB connection successful...')
)
const port=process.env.PORT||3000;
app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})