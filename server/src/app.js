import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 

import dotenv from "dotenv";
dotenv.config(
    { path: './.env' }
); 
const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes declaration
import userRouter from './routes/user.routes.js'
import profileRouter from './routes/profile.routes.js'
import paymentRouter  from './routes/payment.routes.js'
import courseRouter from './routes/course.routes.js'
app.use('/api/v1/users',userRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/payment',paymentRouter)
app.use('/api/v1/course',courseRouter)

export { app }
