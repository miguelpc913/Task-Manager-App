const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Task = require('./task');


const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required:true,
        trim:true
    },
    email : {
        type: String,
        required:true,
        unique: true,
        trim: true,
        toLowerCase: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Not valid email!");
        }
    },
    age: {
        type: Number,
        required:true,
        default: 0,
        min:0,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if(value.toLowerCase().includes("password")) throw new Error("Password cannot contain the word "/password/" ")
        }
    },
    tokens:[{
        token: {
            type:String,
            required:true
        }
    }],
    image:{
        type: Buffer
    }
},
{
    timestamps:true
})

UserSchema.virtual('tasks' , {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.pre('save' , async function(next){
    const user =  this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8);
    }
    next();
})

UserSchema.pre("remove" ,async function(next){
    await Task.deleteMany({owner : this._id});
    next();
})

UserSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id.toString()} , process.env.JWT_TOKEN);
    this.tokens.push({token});
    this.save();
    return token;
}

UserSchema.methods.toJSON = function(){
    const user = this.toObject();
    delete user.tokens;
    delete user.password;
    delete user.image;
    return user;
}

UserSchema.statics.findByCredentials = async (email , password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new error("Email not found");
    } 
    const match = await bcrypt.compare(password , user.password);
    if(!match){
        throw new error("Unable to login");
    }
    return user;
}



const User = mongoose.model('User' , UserSchema)

module.exports = User;