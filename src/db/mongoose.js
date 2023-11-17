const mongoose = require("mongoose")

const connectionurl = process.env.LOCAL_DB
mongoose.connect(connectionurl).then((result)=>{
    console.log("Connected")

}).catch(error=>{
    console.log("Error: ",error)
})




