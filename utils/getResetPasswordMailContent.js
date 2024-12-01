exports.getResetPasswordMailContent=function(user,redirectUrl){
    return `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #4CAF50; color: #ffffff; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>
      <div style="padding: 20px; line-height: 1.6; color: #333;">
        <p>Hello ${user.username},</p>
        <p>You recently requested to reset your password for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href=${redirectUrl} style="background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email. This link will expire in 15 mins.</p>
        <p>Thank you, <br> The Blog site Team</p>
      </div>
      <div style="background-color: #f1f1f1; text-align: center; padding: 10px 20px; font-size: 12px; color: #777;">
        <p>If you’re having trouble clicking the reset password button, copy and paste the URL below into your web browser:</p>
        <p style="word-break: break-word;">${redirectUrl}</p>
      </div>
    </div>
  </body>`
}