const bcrypt=require('bcrypt')
require("dotenv").config()
const { UserModel }=require("../model/User")
const { OtpVerificationModel } = require("../model/OtpVerification")
const { RefreshTokenModel } = require('../model/RefreshToken')
const { sendMailVerification } = require("../utils/sendMailVerification")
const { generateTokens } = require("../utils/generateTokens")
const { setCookies } = require("../utils/setCookies")
const jwt = require('jsonwebtoken')
const { sendMailResetLink } = require('../utils/sendMailResetLink')

//User signup 

exports.signUp=async function(req,res){
    try{
        const {username,password,email}=req.body
        
        //Checking all value exist if not sending 400 
        if(!username || !password || !email){
            return res.status(400).json({status:"fail",message:"All fields are required"})
        }

        //Checking email is unique if not sending 400
        const emailExist= await UserModel.findOne({email})
        if(emailExist){
            return res.status(409).json({status:"fail",message:"Email is already in use"})
        }

        //Creating hash password and storing user in database 
        const hashedPassword= await bcrypt.hash(password,Number(process.env.SALT_ROUNDS))
        const user=await new UserModel({password:hashedPassword,username,email}).save()

        //Sending otp to user and storing the otp for verification
       await sendMailVerification(user)

       //Sending success message to client
       res.status(201).json({status:"success",message:"User created successfully"})
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({status:"fail",message:"Internal server error"})
    }
}

//Otp verification 

exports.otpVerification=async function(req,res){
    try{
        const {otp,email}=req.body
        //Checking email exist if not sending 400  
        if(!email){
            return res.status(400).json({status:"fail",emailReset:true,message:"Something went wrong please re-enter your email"})
        }

        //Checking user exist if not sending 400
        const user=await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({status:"fail",emailReset:true,message:"Something went wrong please re-enter your email"})
        }

        //Checking user is already verified if yes sending 409
        if(user.is_verified){
            return res.status(409).json({status:"fail",userVerified:true,message:"User is already verified"})
        }

        //Checking if otp is expired if yes sending another otp and storing that otp in database
        const userOtp=await OtpVerificationModel.findOne({userId:user._id})
        if (!userOtp){
            await sendMailVerification(user)
            return res.status(410).json({status:"fail",message:"Otp is expired, new otp is sent to your mail"})
        }

        //Checking if otp is valid if not sending 400
        if(userOtp.otp!==otp){
            return res.status(400).json({status:"fail",message:"Invalid otp"})          
        }

        //Updating from unverified user to verified user
        await UserModel.findByIdAndUpdate(user._id,{is_verified:true},{new:true})
        res.status(200).json({status:"success",message:"User is verified",user})
    }
    catch(err){
        res.status(500).json({status:"fail",message:"Internal server error"})
    }   
}

//Resend otp 

exports.resendOtp=async function(req,res){
    try{
        const {email}=req.body
        //Checking email exist if not sending 400
        if(!email){
            return res.status(400).json({status:"fail",emailReset:true,message:"Something went wrong please re-enter your email"})
        }

        //Checking user exist if not sending 400
        const user=await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({status:"fail",emailReset:true,message:"Something went wrong please re-enter your email"})
        }

        //Deletion of existing otp
        await OtpVerificationModel.deleteMany({userId:user._id})

        //Sending otp and storing that otp in database
        await sendMailVerification(user)
        res.status(200).json({status:"success",message:"Otp is resend to your email"})
    }
    catch(err){
        res.status(500).json({status:"fail",message:"Internal server error"})
    }
}

//Login User

exports.logIn=async function(req,res){
    try{
        const {email,password}=req.body
        //Checking all fields exist if not sending 400
        if(!email && !password)return res.status(400).json({status:"fail",message:"All fields are required"})
        const user= await UserModel.findOne({email})
        //Checking email is valid if not sending 400
        if(!user)return res.status(400).json({status:"fail",message:"Invalid password or email"})
        const isCorrectPassword=await bcrypt.compare(password,user.password)
        //Checking password is valid if not sending 400
        if(!isCorrectPassword)return res.status(400).json({status:"fail",message:"Invalid password or email"})
        //Checking user is verified if not sending 400
        if(!user.is_verified)return res.status(400).json({status:"fail",message:"Email verification is pending",isOtpRequired:true})

        //Deleting previous session refresh tokens
        await RefreshTokenModel.deleteMany({userId:user._id})   

        //Created access and refresh tokens
        const {accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime}=await generateTokens(user)

        //Setting tokens in form of cookies
        setCookies(res,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime)

        //Sending success message
        const {username,email:userEmail}=user
        res.status(200).json({status:"success",message:"Login successful",user:{username,email:userEmail,is_auth:true}})
    }
    catch(err){
        res.status(500).json({status:"fail",message:"Internal Server error"})
    }
}

//Get user data 

exports.getUserData=async function(req,res){
    try {
        const {userId}=req.user
        const {username,email}=await UserModel.findById(userId)
        res.status(200).json({username,email,is_auth:true})
    } 
    catch (err) {
        res.status(500).json({status:"fail",message:"Internal server error"})
    }
}

//Change password

exports.changePassword=async function(req,res){
    try {
        const {old_password,new_password}=req.body
        const {userId}=req.user
        
        //Checking all values exist if not sending 400
        if(!old_password || !new_password)return res.status(400).json({status:"fail",message:"All fields are required"})

        //Checking old password is correct if not sending 400
        const user=await UserModel.findById(userId)
        const isCorrectPassword=await bcrypt.compare(old_password,user.password)
        if(!isCorrectPassword)return res.status(400).json({status:"fail",message:"Old password is not correct"})
        
        //Hashing new password and storing it in database
        const hashed_new_password=await bcrypt.hash(new_password,Number(process.env.SALT_ROUNDS))
        await UserModel.findByIdAndUpdate(userId,{$set:{password:hashed_new_password}})
        res.status(200).json({status:"success",message:"Password changed successfully"})  
    } 
    catch (err) {
        console.log(err)
        res.status(500).json({status:"fail",message:"Internal Server error"})
    }
}

//Send Reset password link

exports.sendResetPasswordLink=async function(req,res){
    try {
        const {email}=req.body

        //Checking email exist if not sending 400
        if(!email)return res.status(400).json({status:"fail",message:"Email is a required field"})

        //Checking any user exist corresponding to email if not sending 400
        const user=await UserModel.findOne({email})
        if(!user)return res.status(400).json({status:"fail",message:"Invalid email"})
        
        //Generating token for reset password link (so our procedure will be done securely)
        const resetPasswordToken=jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET_KEY,{expiresIn:"15m"})

        //Sending reset password link to user email
        await sendMailResetLink(user,resetPasswordToken)

        res.status(200).json({status:"success",message:"Reset password link is send to your mail"})
    } 
    catch (err) {
        console.log(err)
        res.status(500).json({status:"fail",message:"Internal Server error"})       
    }
}

//Reset password

exports.resetPassowrd=async function(req,res){
    try {
        const {new_password,resetToken}=req.body

        //Checking new_password exist if not sending 400
        if(!new_password || !resetToken)return res.status(400).json({status:"fail",message:"New password and token are required values"})
        
        //Checking token is valid then resetting password otherwise if invalid then asking user to generate new link
        jwt.verify(resetToken,process.env.ACCESS_TOKEN_SECRET_KEY,async(err,payload)=>{
            try{
                if(!payload)return res.status(410).json({status:"fail",message:"Link is expired please generate new reset password link"})
                const {userId}=payload
                const hashed_new_password=await bcrypt.hash(new_password,Number(process.env.SALT_ROUNDS))
                await UserModel.findByIdAndUpdate(userId,{$set:{password:hashed_new_password}})
                res.status(200).json({status:"success",message:"Password is reset successfully"})
            }
            catch(err){
                console.log(err)
                res.status(500).json({status:"fail",message:"Internal server error"})
            }
        })    
    } 
    catch (err) {
        console.log(err)
        res.status(500).json({status:"fail",message:"Internal Server error"})    
    }
}

//Logout user

exports.logOut=async function(req,res){
    try {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.status(200).json({status:"success",message:"Logged out successfully"})
    } 
    catch (err) {
        console.log(err)
        res.status(500).json({status:"fail",message:"Internal server error"})
    }
}