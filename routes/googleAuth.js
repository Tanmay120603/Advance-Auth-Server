const {Router}=require("express")
const passport=require("passport")
const { setCookies } = require("../utils/setCookies")
require("../config/googleStrategy.js")
require("dotenv").config()

const router=new Router()

router.get('',
    passport.authenticate('google', { session:false,scope: ['profile',"email"]}))
  
router.get('/callback', 
    passport.authenticate('google', { session:false,failureRedirect: process.env.CLIENT_URL+'/login' }),
    function(req, res) {
      //Access tokens and other data from req.user 
      const {user,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime}=req.user
      //Setting cookies
      setCookies(res,accessToken,accessTokenExpTime,refreshToken,refreshTokenExpTime)
      //Success redirecting to home page
      res.redirect(process.env.CLIENT_URL+'/')
    })

exports.GoogleAuthRouter=router