import Course from "../models/course.model.js";
import Section from "../models/section.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { populate } from "dotenv";
import SubSection from "../models/subSection.model.js";


const createSection = asyncHandler(async (req, res) => {
    try {
        const { courseId, sectionName } = req.body;
        const userId = req.user._id;

        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        const user = await User.findById(userId);
        if(user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to create sections.");
        }
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        if (!courseId || !sectionName) {
            throw new ApiError(400, "Course ID and section name are required.");
        }

        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found.");
        }

        const new_section = await Section.create({
            sectionName
        });

        // Link this section to the course
       const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { sections: new_section._id } },
            { new: true }
        );
        if (!updatedCourse) {
            throw new ApiError(500, "Failed to update course with new section.");
        }

        const updatedCourseDetails = await Course.findById(courseId)
            .populate("courseContent", { path: 'SubSection' })
            .populate("instructor", "name email");
        if (!updatedCourseDetails) {
            throw new ApiError(404, "Updated course details not found.");
        }
        res.status(201).json(new ApiResponse(201, { updatedCourseDetails, new_section }, "Section created successfully"));

    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
    
    }
})


const updateSection = asyncHandler(async (req, res) => {
    try {
        const { sectionId, sectionName ,courseId} = req.body;
        const userId = req.user._id;
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }
        const user = await User.findById(userId);
        if (user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to update sections.");
        }
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        if (!sectionId || !sectionName || !courseId) {
            throw new ApiError(400, "Section ID, section name, and course ID are required.");
        }
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found.");
        }
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found.");
        }   
        section.sectionName = sectionName;
        const updatedSection = await section.save();    
        if (!updatedSection) {
            throw new ApiError(500, "Failed to update section.");
        }
        const updatedCourseDetails = await Course.findById(courseId)
            .populate("sections", { path: 'Section' ,populate: { path: 'subSections' } })
            if (!updatedCourseDetails) {
            throw new ApiError(404, "Updated course details not found.");
        }
            return res.status(200).json(new ApiResponse(200, { updatedCourseDetails, updatedSection }, "Section updated successfully"));
    
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
    }
})


const deleteSection = asyncHandler(async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;
        const userId = req.user._id;
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }
        const user = await User.findById(userId);
        if (user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to delete sections.");
        }
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        if (!sectionId || !courseId) {
            throw new ApiError(400, "Section ID and course ID are required.");
        }
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found.");
        }
        const section = await Section.findById(sectionId);
          if (!section) {
            throw new ApiError(404, "Section not found.");
        }
        const deleteSection = await Section.findByIdAndDelete(sectionId);

               const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            });


        return res.status(200).json(new ApiResponse(200, updatedCourseDetails, "Section deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
    }
})


export {
    createSection,
    updateSection,
    deleteSection,
}