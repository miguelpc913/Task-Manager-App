const User = require("../models/users")
const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail } = require('../email/sendgrid');
const { sendGoodByeEmail } = require('../email/sendgrid');

//Saves user
router.post("/users" , async (req, res) =>{
    const user = new User(req.body);
    try{
        await user.save();
        sendWelcomeEmail(user.email , user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user , token});
    }catch(e){
        res.status(400).send(e);
    }
    //Previous Promises Setup
    // user.save().then( ()=>{
    //     res.status(201).send(user);
    // }).catch((e) =>{
    //     res.status(400).send(e);
    // })
})
//Enter password and email for login, returns user and new token created using generateAuthToken
router.post("/users/login" , async(req , res) =>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password);
        const token = await user.generateAuthToken();
        res.send({user , token});
    }catch(e){
        res.send(e)
    }
})
//Removes current login token from user
router.post("/users/logout" , auth , async(req , res) =>{
   try{
       req.user.tokens = req.user.tokens.filter(token =>{ 
            return token.token !== req.token
        })
        await req.user.save();

        res.send("Logged out").status(200);
   }catch(e){
        res.status(500).send()
   } 
});
//Removes all authentication token from user
router.post("/users/logout/all" , auth , async(req , res) =>{
    try{
         req.user.tokens = [];
         await req.user.save();
         res.send("Logged out of all sessions").status(200);
    }catch(e){
         res.status(500).send()
    } 
 });

router.get("/users/me" , auth , async (req, res) =>{
    res.status(201).send(req.user);
})


router.patch('/users/me' , auth , async (req ,res) =>{
    const keys = Object.keys(req.body);
    const validOperations = ['name' , 'age' , 'email' , 'password'];

    const isValidOperation = keys.every( key => validOperations.includes(key));

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid operations"});
    }

    try{

        //Commented out to run middleware
        //const user = await User.findByIdAndUpdate(req.params.id , req.body , {runValidators: true , new:true});

        keys.forEach(key => req.user[key] = req.body[key])
        await req.user.save();
        // if(!user){
        //     return res.status(404).send();
        // }
       res.status(200).send(req.user);

    }catch(e){
        console.log(e);
    }
})

router.delete("/users/me" , auth , async (req , res) =>{
    try{
        await req.user.deleteOne()
        sendGoodByeEmail(req.user.email , req.user.name)
        res.send(req.user);
    }catch(e){
        console.log(e)
        res.status(500).send(e);
    }
})

const avatar = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req , file , cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please provide valid image"));
        }
        return cb(undefined , true)
    }
})

router.post("/users/me/avatar" , auth ,  avatar.single('avatar') , async(req , res) =>{
    req.user.image = await sharp(req.file.buffer).resize({width:250 , height: 250}).png().toBuffer();
    await req.user.save()
    res.send(req.user)
} , (error , req , res , next) =>{
    res.status(400).send({error : error.message});
})

router.delete("/users/me/avatar" , auth , async(req , res) =>{
    req.user.image = null
    await req.user.save()
    res.send(req.user)
} , (error , req , res , next) =>{
    res.status(400).send({error : error.message});
})

router.get("/users/:id/avatar" , async(req, res) =>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.image){
           throw new Error();
        }   

        res.set('Content-Type' , 'image/png')
        res.send(user.image)

    }catch(e){
        res.status(400).send(e)
    }
})

//Removed for production:
// router.delete("/users/:id" , async (req , res) =>{
//     try{
//         const user = await User.findByIdAndDelete(req.params.id);
//         if(!user) return res.status(404).send({error: "User not found"});
//         res.send(user);
//     }catch(e){
//         res.status(500).send();
//     }
// })
// router.get("/users" , async (req, res) =>{
//     try{
//         const users = await User.find({});
//         res.status(201).send(users);
//     }catch(e){
//         res.status(500).send(e)
//     }
// })
// router.get("/users/:id" ,  async (req, res) =>{
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id);
//         if(!user) return res.status(404).send("User not found");
//         res.status(201).send(user);
//     }catch(e){
//         console.log(e);
//         res.status(500).send(e);
//     }
//     // User.findById(_id).then( (users) =>{
//     //     if(!users) return res.status(404).send("User not found");
        
//     //     res.send(users);
//     // }).catch( (e) =>{
//     //     res.status(500).send(e);
//     // }) 
// })

module.exports = router;