const mongoose=require("mongoose")

const refreshTokenSchema=mongoose.Schema({
    refreshToken:{type:String,required:true},
    userId:{type:mongoose.Types.ObjectId,required:true,ref:"users"},
    blackList:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now(),expires:"5d"}  
})

exports.RefreshTokenModel=mongoose.model("RefreshToken",refreshTokenSchema)