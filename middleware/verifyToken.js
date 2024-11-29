const jwt=require("jsonwebtoken")
const { RefreshTokenModel } = require("../model/RefreshToken")
const { generateTokens } = require("../utils/generateTokens")
const { setCookies } = require("../utils/setCookies")
require("dotenv").config()

exports.verifyToken=function(req,res,next){
    try{
    if(!req.cookies.refreshToken)return res.status(401).json({is_unauth:true,message:"Token doesn't exist"})

    const {accessToken,refreshToken}=req.cookies

    jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET_KEY,async(err,payload)=>{
        //Access Token is valid giving access to protected routes
        if(payload){
            req.user=payload
            return next()
        }

        //Access Token is invalid so first checking refresh token if invalid sending 401 
    
        const refreshTokenObj= await RefreshTokenModel.findOne({refreshToken:refreshToken})
        if(!refreshTokenObj)return res.status(401).json({is_unauth:true,message:"Invalid token please login again"})
        if(refreshTokenObj.blackList){
            await RefreshTokenModel.updateMany({userId:refreshTokenObj.userId},{blackList:true})
            return res.status(401).json({is_unauth:true,message:"Invalid token please login again"})
        }
        
        //Generating new pair of tokens
        const {accessToken:newAccessToken,accessTokenExpTime,refreshToken:newRefreshToken,refreshTokenExpTime}=await generateTokens({_id:refreshTokenObj.userId})

        //Making refresh token blacklist as used for generating new token
        await RefreshTokenModel.findOneAndUpdate({refreshToken},{blackList:true})
        
        //Setting tokens in form of cookies
        setCookies(res,newAccessToken,accessTokenExpTime,newRefreshToken,refreshTokenExpTime)

        req.user={userId:refreshTokenObj.userId}
        next()
    })
    }
    catch(err){
        console.log(err)
        res.status(500).json({status:"fail",message:"Internal server error"})
    }
}
