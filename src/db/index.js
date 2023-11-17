require("./mongoose")
const userRouter = require("../router/user")
const taskRouter = require("../router/task")
const express = require ('express')
const app  =express();
const port = process.env.PORT

// app.use((req,res,next)=>{

//     console.log(req.method,req.path)
//     next()
// })

// const multer = require("multer")

// const upload = multer({
//     dest:'images'
// })
// app.post("/upload",upload.single("upload"),(req,res)=>{
//     res.send()
// })


app.use(express.json())

app.use(userRouter)

app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server is up on port "+port)
})