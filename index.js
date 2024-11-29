const express=require("express")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const { dbConnect } = require("./config/dbConnect")
const { UserRouter } = require("./routes/user")
const { GoogleAuthRouter } = require("./routes/googleAuth.js")
const { GithubAuthRouter } = require("./routes/githubAuth.js")
require("dotenv").config()

const server=express()
server.use(cors({origin:process.env.CLIENT_URL,credentials:true}))  //Cors middleware to avoid cors error
server.use(express.json()) //Body parser to parse json data
server.use(cookieParser()) //Cookie parser to parse cookie
dbConnect(process.env.DB_URL)  //Connect with database

//routers for different resources
server.use("/api/user",UserRouter)
server.use("/auth/google",GoogleAuthRouter)
server.use("/auth/github",GithubAuthRouter)

//Starting up the server 
server.listen(process.env.PORT,()=>{
    console.log("Server started successfully")
})


