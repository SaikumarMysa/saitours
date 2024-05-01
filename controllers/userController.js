const catchAsync = require('../utils/catchAsync');
const User=require('./../models/userModel');
exports.getAllUsers = async(req, res) => {
  const users=await User.find()
    res.status(200).json({
      status: 'success',
      data: {
        users:users
      }
    });
  };
  exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  //UPDATE CURRENT USER DATA
  exports.updateMe=async (req,res,next)=>{
    //1.create error if user posts password data
    if(req.body.password||req.body.passwordConfirm){
      return next(new AppError('This route is not for password updates. Please use updateMyPassword',400))
    }
    //2. Filter out unwanted field names that are not allowed to updated
    const filterObj=(obj,...allowedFields)=>{
      const newObj={};
      Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el];
      })
      return newObj;
    }
    //3. Update user document
    const filteredBody=filterObj(req.body,'name','email');
    const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
      new:true,
      runValidators:true
    })
    res.status(200).json({
      status:'success',
      data:{
        user:updatedUser
      }
    })
  }
//DELETE CURRENT USER
  exports.deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
      status:'success',
      data:null
    })
  })