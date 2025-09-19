const mongoose=require("mongoose")

exports.connectDB=async()=>{
   try {
     await mongoose.connect(process.env.DB_URL)
     console.log("database connected")
   } catch (error) {
    console.log("connection error")
   }

}