const AppError=require('./../utils/appError')
const handleCastErrorDB = err => {
    const message=`Invalid ${err.path}:${err.value}.`;
    return new AppError(message,400)
}
const handleDuplicateFieldsDB=err =>{
    const fieldName = Object.keys(err.keyValue)[0];
    const fieldValue = err.keyValue[fieldName];
    console.log(fieldValue)
    const message=`Duplicate Field value:${fieldValue}.please use another value`;
     return new AppError(message,400)
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    console.log(message)
    return new AppError(message, 400);
};
const handleJsonWebTokenError=err=>{
    const message='Invalid token, Please login again!'
    return new AppError(message,401);
}  
const handleJWTExpiredError=err=>{
    const message='Token has expired!'
    return new AppError(message,401)
}

const sendErrorDev=(err,res)=>{
    res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stackTrace: err.stack 
})
}
const sendErrorProd=(err,res)=>{
    // console.log('hey in sendErrorprod1')
    // console.log('isOperational:', err.isOperational);
    if (err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
    } 
    else {
        console.log('Errorr');
        res.status(err.statusCode).json({
            status: 'error',
            message: 'something went wrong',
            
        }) 
    }          

}
module.exports=(err,req,res,next)=>{
    // console.log('Error handled:', err);
    // console.log('Error is an instance of AppError:', err instanceof AppError);
    err.statusCode=err.statusCode||500;
    err.status=err.status||'error';
    //console.log(`hiiii ${process.env.NODE_ENV==='production'}`);
    if (process.env.NODE_ENV==='development') {
        sendErrorDev(err,res);
        }
    else if (process.env.NODE_ENV==='production') {
        let error={...err};
        if (err.name==='CastError') error=handleCastErrorDB(error) 
        if(err.code===11000) error=handleDuplicateFieldsDB(error)
        if(err.name==='ValidationError') error=handleValidationErrorDB(error) 
        if(err.name==='JsonWebTokenError') error=handleJsonWebTokenError(error)
        if(err.name==='TokenExpiredError') error=handleJWTExpiredError()
        sendErrorProd(error,res);   
        } 
        else{
            res.status(500).json({
                status: 'error',
                message: 'something went wrong',
                
            })        
        } 
    }


