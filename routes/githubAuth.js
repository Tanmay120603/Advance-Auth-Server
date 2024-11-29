const { Router }=require("express")
const passport=require("passport")
const { setCookies } = require("../utils/setCookies")
require("../config/githubStrategy.js")
require("dotenv").config()

const router=new Router()

router.get('',
    passport.authenticate('github', { scope: [ 'user:email' ],session:false }))
  
router.get('/callback', 
    passport.authenticate('github', { failureRedirect: process.env.CLIENT_URL+'/login',session:false }),
    function(req, res) {
     //Access tokens and other data from req.user 
     const {user,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime}=req.user
     //Setting cookies
     setCookies(res,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime)
     //Success redirecting to home page
     res.redirect(process.env.CLIENT_URL+'/')
    })

exports.GithubAuthRouter=router