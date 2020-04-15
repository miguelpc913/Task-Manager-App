const express = require("express");
const Task = require("../models/task")
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/tasks" , auth ,  async (req, res) =>{
    // const task = new Task(req.body);
    const task = new Task(
        { 
            ...req.body,
            owner : req.user._id
        }
    )
    try{
        await task.save()
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }
    // task.save().then( ()=>{
    //     res.status(201).send(task);
    // }).catch((e) =>{
    //     res.status(400).send(e);
    // })
})
//completed=true
//limit=4&skip=2
//sortBy=createdAt:desc
router.get("/tasks" , auth ,  async (req, res) =>{
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed === "true";
    }
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    try{
        await req.user.populate({
            path : "tasks",
            match , 
            options : {
                sort,
                limit : req.query.limit ? parseInt(req.query.limit) : 10,
                skip : req.query.skip && req.query.limit ? parseInt(req.query.skip) * parseInt(req.query.limit) : 0
            },
            
        }).execPopulate();
        
        // const tasks = await Task.find({owner : req.user._id});
        res.status(201).send(req.user.tasks)
    }catch(e){
        res.status(500).send(e);
    }
    // Task.find({}).then( (tasks) =>{
    //     res.status(201).send(tasks)
    // }).catch((e) =>{
    //     res.status(500).send(e);
    // })
});

router.get("/tasks/:id" , auth ,  async (req, res) =>{
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id:_id , owner : req.user._id});
        if(!task) return res.status(404).send("Task not found");
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
    // Task.findById(_id).then((task) =>{
    //     if(!task) return res.status(404).send("Task not found");
    //     res.send(task);
    // }).catch((e) =>{
    //     res.status(400).send(e);
    // })
})

router.patch("/tasks/:id" , auth , async (req , res) =>{
    const keys = Object.keys(req.body);
    const validKeys = ['description' ,'completed'];
    const isValidOperation = keys.every( key => validKeys.includes(key));
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid operations"});
    }

    try{
        //const task = await Task.findByIdAndUpdate(req.params.id , req.body , {runValidators: true , new: true});
        const task = await Task.findOne({_id: req.params.id , owner : req.user._id});
        keys.forEach(key =>{
            task[key] = req.body[key]
        });
        if(!task){ 
            return res.status(404).send("Task not found");
         }
        await task.save();
        res.status(201).send(task);

    }catch(e){
        res.status(500).send();
    }
})

router.delete("/tasks/:id" , auth ,  async (req , res) =>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id , owner : req.user._id});
        if(!task ) return res.status(404).send({error: "Task Not Found"});
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = router;