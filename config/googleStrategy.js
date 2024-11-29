const  GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport= require("passport") 
const {UserModel}=require('../model/User')
const {RefreshTokenModel}=require("../model/RefreshToken.js")
const bcrypt=require("bcrypt")
const {generateTokens}=require("../utils/generateTokens.js")
require("dotenv").config()

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
        const {id,displayName}=profile
        const email = profile.emails && profile.emails[0]?.value;
        let user=await UserModel.findOne({email})
        
        //Additional steps for sign up process using google auth
        if(!user){
            const password=id.substring(0,6) + displayName.substring(0,2)
            const hashedPassword=await bcrypt.hash(password,Number(process.env.SALT_ROUNDS))
            user=await new UserModel({email,username:displayName,password:hashedPassword,is_verified:true}).save()
        }
        
        //Deleting previous session refresh tokens
        await RefreshTokenModel.deleteMany({userId:user._id})

        const {accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime}=await generateTokens(user)
        
        return done(null,{user,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime})
    }
    catch(error){
        return done(error,null)
    }
  }
))