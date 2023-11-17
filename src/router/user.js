
const User = require("../models/user")
const express = require ('express')
const auth = require('../middleware/auth')
const multer = require("multer")
const sharp = require ("sharp")
const upload = multer({
    // dest:"avatars",
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!(file.originalname.endsWith(".jpg") || file.originalname.endsWith(".jpeg") || file.originalname.endsWith(".png")) ){
            return cb(new Error('Upload image files only '))
        }
        cb(undefined, true)

    }
})
const router = express.Router()

router.post("/users",async (req,res)=>{
    const user = new User(req.body)
    
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)

    }

})

router.post("/users/login",async (req,res)=>{
    try{
        
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    }catch(e){
        
        res.status(400).send()

    }

})

router.post("/users/logout",auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token!=req.token
        })
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send(e)
    }

})



router.get("/users/me", auth ,async (req,res)=>{
    
    try{
        // const user = await User.find({})
        res.status(200).send(req.user)
    }catch(e){
        res.status(500).send(e)

    }

})

router.get("/users/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user) 

    } catch (e) {
        res.status(500).send(e)
    }
    
    
})

router.patch("/users/me",auth,async (req,res)=>{

    const requestedBodyKeys = Object.keys(req.body)
    const availableFieldsToUpdate = ["name","email","age","password"]

    const whethertoupdate = requestedBodyKeys.every(key=>availableFieldsToUpdate.includes(key))

    if(!whethertoupdate){
        return res.status(404).send("Invalid updates!")
    }

    try {
        const user = await User.findById(req.user._id)
        
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!user){
            return res.status(404).send()
        }
        requestedBodyKeys.forEach(key=> user[key]=req.body[key])
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
        
    }
})


router.delete("/users/me", auth, async (req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(e)
        
    }
})


router.post("/users/me/avatar",auth,upload.single("avatar"),async(req,res)=>{
    req.user.avatar = await new sharp(req.file.buffer).resize(250,250).png().toBuffer() 
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})

})

router.delete("/users/me/avatar",auth,async(req,res)=>{
    req.user.avatar =undefined
    await req.user.save()
    res.send()
},
(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get("/users/:id/avatar",async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){                     
            throw new Error()
        }

        res.set("Content-Type","image/png")
        res.send(user.avatar)

    }catch(e){
       
        res.status(404).send(e)
    }
})

module.exports = router