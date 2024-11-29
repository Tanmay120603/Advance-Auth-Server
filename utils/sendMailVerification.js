const { transporter } = require("../config/mailTransporter")
const {OtpVerificationModel}=require("../model/OtpVerification")
const { getMailVerificationContent } = require("./getMailVerificationContent")

exports.sendMailVerification=async function(user){
    try{
    const redirectUrl=process.env.CLIENT_URL+"/verify-otp"
    const otp=Math.floor(1000 + (Math.random() * 8999 ))
    await transporter.sendMail({from:process.env.MAIL_FROM,to:user.email,subject:"Otp Verification",html:getMailVerificationContent(user,otp,redirectUrl)})
    await new OtpVerificationModel({userId:user._id,otp}).save()
    }
    catch(err){
        console.log(err.message)
    }
}
