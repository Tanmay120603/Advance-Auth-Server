const mongoose=require("mongoose")

exports.dbConnect=async function (DB_URL){
    try{
       await mongoose.connect(DB_URL)
       console.log("connected successfully",mongoose.connection.readyState)
    }
    catch(err){
        console.log(err.message)
    }
}

