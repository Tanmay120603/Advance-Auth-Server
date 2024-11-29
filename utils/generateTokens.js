const jwt = require('jsonwebtoken')
require("dotenv").config()
const { RefreshTokenModel }=require("../model/RefreshToken.js")

exports.generateTokens=async function ({_id}){
    try {
        const accessTokenExpTime=1000*60*10  //Expiration time set to 10 minutes
        const accessToken=jwt.sign({userId:_id},process.env.ACCESS_TOKEN_SECRET_KEY,{expiresIn:accessTokenExpTime})

        const refreshTokenExpTime=1000*60*60*24*5  //Expiration time set to 5 days
        const refreshToken=jwt.sign({userId:_id},process.env.REFRESH_TOKEN_SECRET_KEY,{expiresIn:refreshTokenExpTime})

        await new RefreshTokenModel({refreshToken,userId:_id}).save()

        return {accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime}

    }
    catch(err){
        console.log(err.message)
    }
}
