const mongoose=require("mongoose")

const otpVerificationSchema=mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId,ref:"users",required:true},
    otp:{type:Number,required:true},
    createdAt:{type:Date,default:Date.now(),expires:"3m"}
})

exports.OtpVerificationModel=mongoose.model("otp",otpVerificationSchema)

