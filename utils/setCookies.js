require("dotenv").config()

exports.setCookies=function(res,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime){
    try{
        const secure=process.env.SERVER_MODE==="prod" ? true : false

        res.cookie("accessToken",accessToken,{maxAge:accessTokenExpTime,httpOnly:true,secure})
        res.cookie("refreshToken",refreshToken,{maxAge:refreshTokenExpTime,httpOnly:true,secure})
    }
    catch(err){
        console.log(err.message)
    }
}