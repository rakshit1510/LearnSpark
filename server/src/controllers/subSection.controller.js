import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";                            
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const createSubSection = asyncHandler(async (req, res) => {
    try {
        const { title, description, sectionId } = req.body;
        const userId = req.user._id;
        const video = req.file ? await uploadOnCloudinary(req.file.path, "subsections") : null;
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to create subsections");
        }
        if (!video) {
            throw new ApiError(400, "Video file is required");
        }
        if (!sectionId) {
            throw new ApiError(400, "Section ID is required");
        }
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }
        if (!title || !description || !sectionId) {
            throw new ApiError(400, "All fields are required");
        }

       const SubSectionDetails = await SubSection.create({
            title,
            timeDuration: video.duration,
            description,
            videoUrl: video.secure_url
        });
        if (!SubSectionDetails) {
            throw new ApiError(500, "Failed to create subsection"); 
        }
      const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection")
        .populate("course", "courseName courseImage");
        if (!updatedSection) {
            throw new ApiError(500, "Failed to update section with new subsection");
        }
        res.status(201).json(new ApiResponse(201, updatedSection, "Subsection created successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
        
    }
})


const updateSubSection = asyncHandler(async (req, res) => {
    try {
       const {sectionId, subSectionId, title, description} = req.body;
        const userId = req.user._id;    
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to update subsections");
        }
        if(!sectionId || !subSectionId) {
            throw new ApiError(400, "Section ID and Subsection ID are required");
        }
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }       
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            throw new ApiError(404, "Subsection not found");
        }
        if(title) {
            subSection.title = title;
        }   
        if(description) {
            subSection.description = description;
        }
        if(req.file && req.file.path !== "" && req.file.path !== null && req.file.path !== undefined) {
            const video = await uploadOnCloudinary(req.file.path, "subsections");
            subSection.videoUrl = video.secure_url;
            subSection.timeDuration = video.duration;
        }
        const updatedSubSection = await subSection.save();
        if (!updatedSubSection) {
            throw new ApiError(500, "Failed to update subsection");
        }
        // Update the subsection in the section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId, "subSection._id": subSectionId },
            { $set: { "subSection.$": updatedSubSection } },
            { new: true }
        ).populate("subSection")
        .populate("course", "courseName courseImage");
        if (!updatedSection) {
            throw new ApiError(500, "Failed to update section with new subsection");
        }
        res.status(200).json(new ApiResponse(200, updatedSection, "Subsection updated successfully"));

    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
        
    }
});

const deleteSubSection = asyncHandler(async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;
        const userId = req.user._id;
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.role !== "admin" && user.role !== "instructor") {
            throw new ApiError(403, "User does not have permission to delete subsections");
        }
        if (!subSectionId || !sectionId) {
            throw new ApiError(400, "Subsection ID and Section ID are required");
        }
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            throw new ApiError(404, "Subsection not found");
        }
        // Remove subsection from section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $pull: { subSection: subSectionId } },
            { new: true }
        ).populate("subSection")
        .populate("course", "courseName courseImage");
        if (!updatedSection) {
            throw new ApiError(500, "Failed to update section with removed subsection");
        }
        // Delete subsection
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);
        
        res.status(200).json(new ApiResponse(200, updatedSection, "Subsection deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
    }
});

export  {
    createSubSection,
    updateSubSection,
    deleteSubSection,
}