const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    username:{type:String,required:true,trim:true},
    password:{type:String,required:true,trim:true},
    email:{type:String,required:true,unique:true,trim:true},
    is_verified:{type:Boolean,default:false},  //This will be used for otp verification
})

exports.UserModel=mongoose.model("users",userSchema)