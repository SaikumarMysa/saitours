const{promisify}=require('util');
const jwt=require('jsonwebtoken');
const crypto = require('crypto');
const AppError=require('./../utils/appError')
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const sendEmail=require('./../utils/email')

const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})

}

const createSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id);
    
    const cookieOptions={
        expires:new Date(
            Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000
        ),
        httpOnly:true
    }
    if(process.env.NODE_ENV==='production') cookieOptions.secure=true;
    res.cookie('jwt',token,cookieOptions);
     res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    }) 
}

//SIGNUP
exports.signup=catchAsync(async(req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role: req.body.role
    });
    createSendToken(newUser,201,res);
});

//LOGIN
exports.login=async(req,res,next)=>{
const{email,password}=req.body;
//1.check if email,password exists
if (!email||!password) {
    next(new AppError('please provide email and password',400))
    
}
//2.check if user exists && password is correct
const user=await User.findOne({email}).select('+password')
//console.log(user)
if(!user||!(await user.correctPassword(password,user.password))){
 return next(new AppError('Incorrect email or password',401))
}
//3.If everything is ok then send a token
createSendToken(user,200,res);
}

//PROTECT ROUTES
//1) Getting token and check of it's there
    exports.protect=catchAsync(async(req,res,next)=>{
    let token;
    if (req.headers.authorization&&req.headers.authorization.startsWith('Bearer')) {
        token=req.headers.authorization.split(' ')[1];
    }
    //console.log(token)
    if(!token){
        return next(new AppError('You are not logged in!! Please log in  to get access.',401));
    }
    //2.verification token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    //console.log(decoded);
    //3.Check if user still exists
    const currentUser=await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token doesnot exist',401))
    }
    //4.Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password!,please log in again.',401))
    }
    //Grant Access to protected route
    req.user=currentUser;
    next();
})

//RESTRICT TO
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action',403));
        }
        next();
    }
}

//FORGOT PASSWORD
exports.forgotPassword=catchAsync(async(req,res,next)=>{
    //1.Get user based on posted email
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with email address',404));
    }
    //2. Generate the random resetToken
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    //3.send it to user's email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message=`Forgot your password? Submit a Patch request with your new password and passwordConfirm to:${resetURL}.\n If you didnot forgot your password, Please ignore this email.`;
    try{
         sendEmail({
            email:user.email,
            subject:'your password reset token (valid for 10 min)',
            message
        });
        res.status(200).json({
            status:'success',
            message:'Token sent to email!'
        })
    }catch(err){
        console.log('g')
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
    return next(new AppError('There was an error sending the email. Try again later!'),500)
    }

})

//RESET PASSWORD
exports.resetPassword=async(req,res,next)=>{
    //1. Get User based on the token
    const hashedToken=crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

const user=User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});
//2.If token has not expired, and there is user, set the new  password
if (!user) {
    return next(new AppError('Token is invalid or has Expired',400))    
}
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
//await user.save();
//3.update changedpasswordAt property for the user
//4.log the user in ,send jwt
createSendToken(user,200,res);
}

//UPDATE CURRENT USER PASSWORD
exports.updatePassword=async (req,res,next)=>{
    //1.Get user from collection
    const user=await User.findById(req.user.id).select('+password');
    //2.Check if posted current user is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('your current password is wrong',401))
    }
    //3. If so, update password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    await user.save();
    //4. Log user in, send JWT
    createSendToken(user,200,res);
}


