import mongoose from "mongoose";

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
            required: true
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

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)  //here "this" is the context of user using this function
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
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
