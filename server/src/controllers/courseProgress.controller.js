import mongoose from "mongoose"
import CourseProgress from "../models/courseProgress.model.js";
import Course from "../models/course.model.js";
import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { use } from "react";
import {User} from "../models/user.model.js";
const updateCourseProgress = asyncHandler(async (req, res) => {
    try {
        const { courseId, subsectionId } = req.body;
        const userId = req.user._id;
        if(!userId) {
            throw new ApiError(401, "User not authenticated.");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        if (!courseId || !subsectionId) {
            throw new ApiError(400, "Course ID and Subsection ID are required.");
        }
        const subsection = await SubSection.findById(subsectionId);
        if (!subsection) {
            throw new ApiError(404, "Subsection not found.");
        }

        let courseProgress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!courseProgress) {
            throw new ApiError(404, "Course progress not found.");
        }

        // Update course progress logic here

        if(courseProgress.completedVideos.includes(subsectionId)) {
            throw new ApiError(400, "Subsection already completed.");
        }
        courseProgress.completedVideos.push(subsectionId);
        const newCourseProgress = await courseProgress.save();
        if (!newCourseProgress) {
            throw new ApiError(500, "Failed to update course progress.");
        }

        res.status(200).json(new ApiResponse(200, "Course progress updated successfully.", newCourseProgress));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);    
        
    }
})

export {
    updateCourseProgress
}