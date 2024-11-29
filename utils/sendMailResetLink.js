const { transporter } = require("../config/mailTransporter");
const { getResetPasswordMailContent } = require("./getResetPasswordMailContent");

exports.sendMailResetLink=async function(user,resetPasswordToken){
    try{
        const redirectUrl=process.env.CLIENT_URL+"/password-reset"+`/${resetPasswordToken}`
        await transporter.sendMail({from:process.env.MAIL_FROM,to:user.email,subject:"Reset Password",html:getResetPasswordMailContent(user,redirectUrl)})
    }
    catch(err){
            console.log(err.message)
    }
}