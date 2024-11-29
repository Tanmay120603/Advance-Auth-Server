const {Router}=require("express")
const { signUp,otpVerification,resendOtp,logIn, getUserData, sendResetPasswordLink, resetPassowrd, changePassword, logOut } = require("../controller/user")
const { verifyToken } = require("../middleware/verifyToken")

const router=new Router()

router.post("/signup",signUp)
router.post("/verify-otp",otpVerification)
router.post("/resend-otp",resendOtp)
router.post("/login",logIn)
router.post("/password-reset-link",sendResetPasswordLink)
router.post("/password-reset",resetPassowrd)
router.post("/change-password",verifyToken,changePassword)
router.post("/logout",logOut)
router.get("/",verifyToken,getUserData)

exports.UserRouter=router