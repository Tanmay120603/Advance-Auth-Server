const GitHubStrategy=require("passport-github2").Strategy
const passport=require("passport")
const {RefreshTokenModel}=require("../model/RefreshToken.js")
const {UserModel}=require("../model/User.js")
const {generateTokens}=require("../utils/generateTokens.js")
const bcrypt=require("bcrypt")
require("dotenv").config()

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  async function(accessTokenGithub, refreshTokenGithub, profile, done) {
    try{
        let {id,login:username,email}=profile._json
        id=id+""
        
        //If email is set to private then accessing it using github access token
        if(!email){
        const response= await fetch('https://api.github.com/user/emails',{method:"GET",headers:{Authorization: `Bearer ${accessTokenGithub}`}})
        const data=await response.json()
        email=data.find(emailObj=>emailObj.primary)["email"]
        }

        let user=await UserModel.findOne({email})
        
        //Additional steps for sign up process using github auth
        if(!user){
            const password=id.substring(0,6) + username.substring(0,2)
            const hashedPassword=await bcrypt.hash(password,Number(process.env.SALT_ROUNDS))
            user=await new UserModel({email,username,password:hashedPassword,is_verified:true}).save()
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