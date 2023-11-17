const Task = require("../models/task")
const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")


router.post("/tasks",auth,async (req,res)=>{
    try{
        const task = new Task({
            ...req.body,
            owner:req.user._id

        })
        await task.save()
        res.status(200).send(task) 
    }catch(e){
        res.status(400).send(e)

    }
    

})

router.get("/tasks",auth,async (req,res)=>{
    const match={},sort={}
    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1]==="desc" ? -1 : 1
    }
    
    try{
        // const task = await Task.find({})
        // const tasks = await Task.find({owner:req.user._id,})

        await req.user.populate({
            path:"tasks",
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.status(200).send(tasks)

    }catch(e){
        res.status(500).send(e)

    }
})

router.get("/tasks/:id",auth,async (req,res)=>{
    try{
        const _id = req.params.id
        // const task = await Task.findById(id)
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(500).send()
        }
        res.status(200).send(task)

    }catch(e){
        res.status(500).send(e)
    }
   
})

router.patch("/tasks/:id", auth,async (req,res)=>{
    const requestedBodyKeys = Object.keys(req.body)
    const availableFieldsToUpdate = ["description","completed"]

    const whethertoupdate = requestedBodyKeys.every(key=>availableFieldsToUpdate.includes(key))

    if(!whethertoupdate){
        return res.status(404).send("Invalid updates!")
    }
    try{
        // const task = await Task.findById(req.params.id)
        const task  = await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!task){
            return res.status(404).send()
        }
        requestedBodyKeys.forEach(key=> task[key]=req.body[key])
        await task.save()
        res.status(200).send(task)

    }catch(e){
        res.status(500).send(e)

    }

    


})

router.delete("/tasks/:id", auth, async (req,res)=>{
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({
            _id:req.params.id,
            owner:req.user._id
        })
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(e)
        
    }
})


module.exports = router