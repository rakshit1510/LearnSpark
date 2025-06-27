import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const userSchema = new mongoose.Schema({
     firstName: {
            type: String,
            required: true,
            trim: true
        },
   lastName: {
            type: String,
            required: true,
            trim: true
        },
     email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        accountType: {
            type: String,
            enum: ['Admin', 'Instructor', 'Student'],
            reuired: true
        },
         active: {
            type: Boolean,
            default: true,
        },
        approved: {
            type: Boolean,
            default: true,
        },
          additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true
        }, 
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
          image: {
            type: String,
            // required: true,
            default: null,
        },
          token: {
            type: String
        },
        resetPasswordTokenExpires: {
            type: Date
        },
                refreshToken:{
            type:String,
        },
         courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CourseProgress'

            }
        ]
}, {
    timestamps: true,
});

// "methods" is a hook in mongoose which
//  allows you to made your own middlewares

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    this.password= await bcrypt.hash(this.password,10)
    next();
})


userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)  //here "this" is the context of user using this function
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            firstName:this.firstName,
            lastName:this.lastName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User= mongoose.model("User",userSchema);
