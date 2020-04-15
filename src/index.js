const express = require('express');
require("./db/mongoose")
const TaskRouter = require("./routers/Tasks")
const UserRouter = require("./routers/Users")
const app = express();
const port = process.env.PORT;

app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)

// const multer = require('multer');
// const upload = multer({
//     dest: 'images',
//     limits:{
//         fileSize: 100000
//     },
//     fileFilter(req , file , cb){
//         console.log
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb( new Error("Please upload a document file"));
//         }
//         return cb(undefined , true)
//     }
// })

// app.post("/upload" , upload.single('upload') , (req , res) =>{
//     res.send();
// }, (error , req , res , next) =>{
//     res.status(400).send({error: error.message})
// })

app.listen(port , () =>{
    console.log("Server listening on " + port);
})
