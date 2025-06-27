import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import otpGenerator from 'otp-generator'
import mailSender from "../utils/mailSender.js";
import OTP from "../models/OTP.model.js";
import Profile from "../models/profile.model.js";
import otpTemplate from "../email/templates/emailVerificationTemplate.js";
import passwordUpdated from "../email/templates/passwordUpdate.js";
const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken=user.generateAccessToken()
        // console.log("Generating access and refresh token for user:", user.email);
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken

        await user.save({ validateBeforeSave: false })

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
     
    }
}

const sendOTP= asyncHandler(async (req, res) => {
    try {
        const {email}= req.body;
        console.log("Email received for OTP:", req.body );
        // if (!email) {
        //     console.log("Email is required");
        //     throw new ApiError(400, "Email is required");
        // }
        console.log("Sending OTP to user");
        console.log(email);
        const checkUserPresent= await User.findOne({ email: email.toLowerCase() });
        if (checkUserPresent) {
            throw new ApiError(400, "User already exists with this email");
        }   
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        });

           const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        console.log(name);
        await mailSender(email, 'Verification Email from LearnSpark', otpTemplate(otp,name));
        const otpData = await OTP.create({
            email: email.toLowerCase(),
            otp: otp
        });
        if(!otpData) {
            throw new ApiError(500, "Something went wrong while saving OTP");
        }
        return res.status(200).json(
            new ApiResponse(200, "OTP sent successfully", {
                email: email.toLowerCase(),
                otpId: otpData._id
            })
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while sending OTP to rakshit");
    }
})


const signup = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType  || !otp) {
            throw new ApiError(400, "All fields are required");
        }
        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }
        const checkUserAlreadyExists = await User.findOne({ email: email.toLowerCase() });
        if (checkUserAlreadyExists) {
            throw new ApiError(400, "User already exists with this email");
        }
        
        // Find the most recent OTP for this email
        const recentOtp = await OTP.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
        
        if (!recentOtp) {
            throw new ApiError(400, "OTP not found or expired");
            console.log("Signup request received",firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp);
        }
        if (recentOtp.otp !== otp) {
            throw new ApiError(400, "Invalid OTP");
        }
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });
        if (!profileDetails) {
            throw new ApiError(500, "Something went wrong while creating profile details");
        }
        let approved = true;
        // Create the user
        let image = null;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path, "users");
            if (!image) {
                throw new ApiError(500, "Something went wrong while uploading image");
            }
        }
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            contactNumber,
            accountType,
            additionalDetails: profileDetails._id,
            approved: approved,
            image: image ? image.url : undefined,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully!!")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while signing up");
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // Fetch user details excluding sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        if (!loggedInUser) {
            throw new ApiError(500, "Something went wrong while fetching user details");
        }

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
            new ApiResponse(
                200,
                {
                user: loggedInUser,
                accessToken,
                refreshToken
                },
                "User logged in Successfully"
            )
            );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while logging in");
    }
});

const logout = asyncHandler(async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
            throw new ApiError(400, "User not found");
        }
        const user = await User.findById(userId._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
        
        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(new ApiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while logging out");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            throw new ApiError(400, "All fields are required");
        }
        if (newPassword !== confirmNewPassword) {
            throw new ApiError(400, "New passwords do not match");
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isOldPasswordCorrect) {
            throw new ApiError(401, "Old password is incorrect");
        }
        // user.password = newPassword;
        // await user.save({ validateBeforeSave: false });

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { password: newPassword },
            { new: true, runValidators: true, select: "-password -refreshToken" }
        );

        if (!updatedUser) {
            throw new ApiError(500, "Something went wrong while changing password");
        }

        try {
            const emailResponse = await mailSender(
                updatedUser.email,
                'Password for your account has been updated',
                passwordUpdated(
                    updatedUser.email,
                    `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
                )
            );
            // console.log("Email sent successfully:", emailResponse);
        }
        catch (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }
        
        return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while changing password");
    }
});

export {
    signup,
    sendOTP,    
    login,
    logout,
    changePassword,
    generateAccessAndRefreshToken,
}