import Course from '../models/course.model.js';
import RatingAndReview from '../models/ratingAndReview.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
const createRating = asyncHandler(async (req, res) => {
    try {
        const { rating, review, courseId } = req.body;
        const userId = req.user.id;

        // Validate input
        if(!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (!rating || !review || !courseId) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if user is enrolled in the course
        const course = await Course.findOne(
            { _id: courseId, studentsEnrolled: userId }
        );
        if (!course) {
            throw new ApiError(403, "Student is not enrolled in the course");
        }

        // Check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            course: courseId,
            user: userId
        });
        if (alreadyReviewed) {
            throw new ApiError(409, "Course is already reviewed by the user");
        }

        // Create rating and review
        const ratingReview = await RatingAndReview.create({
            user: userId,
            course: courseId,
            rating,
            review
        });

        // Link this rating to course
        await Course.findByIdAndUpdate(
            courseId,
            { $push: { ratingAndReviews: ratingReview._id } },
            { new: true }
        );

        // Return response
        return res.status(201).json(
            new ApiResponse(201, ratingReview, "Rating and Review created successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
    }
});


const getAverageRating = asyncHandler(async (req, res) => {
    try {
        const courseId = req.body.courseId;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        // Calculate average rating
        const result = await RatingAndReview.aggregate([
            {
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
            },
            },
            {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            }
            }
        ]);

        if (result.length > 0) {
            return res.status(200).json(
            new ApiResponse(200, { averageRating: result[0].averageRating }, "Average rating fetched successfully")
            );
        }

        // If no rating/review exists
        return res.status(200).json(
            new ApiResponse(200, { averageRating: 0 }, "Average Rating is 0, no ratings given till now")
        );
    }catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);    
    }
});


const getAllRatingReviews = asyncHandler(async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: 'desc' })
            .populate({
            path: 'user',
            select: 'firstName lastName email image'
            })
            .populate({
            path: 'course',
            select: 'courseName'
            })
            .exec();
        if (!allReviews || allReviews.length === 0) {
            return res.status(404).json(
                new ApiResponse(404, null, "No reviews found")
            );
        }
        return res.status(200).json(
            new ApiResponse(200, allReviews, "All reviews fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message);
        
    }
})


export {
    createRating,
    getAverageRating,
    getAllRatingReviews
}