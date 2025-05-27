import { hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    bio:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

userSchema.pre('save',async function (next){
    if(!this.isModified("password")) next()
    console.log(this.isModified("password"));
    this.password =await hash(this.password,10)
})

export const User = mongoose.model("User",userSchema)
