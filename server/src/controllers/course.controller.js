import Course from "../models/course.model.js";
import { User } from "../models/user.model.js";
import Category from "../models/category.model.js";
import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js";
import CourseProgress from "../models/courseProgress.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const createCourse = asyncHandler(async (req, res, next) => {
  try {
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      instructions: _instructions,
      status,
      tag: _tag,
    } = req.body;
    const tag = JSON.parse(_tag);
    const instructions = JSON.parse(_instructions);

    const instructorId = req.user._id;
    if (!instructorId) {
      return next(new ApiError(401, "Unauthorized: Instructor ID is required"));
    }
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.accountType !== "instructor") {
      return next(new ApiError(403, "Forbidden: Not an instructor"));
    }
    const thumbnail = req.file?.path
      ? await uploadOnCloudinary(req.file.path, "courseThumbnails")
      : null;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !instructions ||
      !status
    ) {
      return next(new ApiError(400, "All fields are required"));
    }

    if (!status || status === undefined) {
      status = "draft";
    }

    const categoeryDetails = await Category.findById(category);
    if (!categoeryDetails) {
      return next(new ApiError(404, "Category not found"));
    }

    const course = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category: categoeryDetails._id,
      instructions,
      status,
      tag,
      thumbnail: thumbnail ? thumbnail.secure_url : null,
      instructor: instructorId,
      createdAt:  Date.now(), 
    });

    if (!course) {
      return next(new ApiError(500, "Failed to create course"));
    }

    await User.findByIdAndUpdate(
      instructorId,
      { $push: { courses: course._id } },
      { new: true }
    );
    await Category.findByIdAndUpdate(
      categoeryDetails._id,
      { $push: { courses: course._id } },
      { new: true }
    );
    return res.status(201).json(
      new ApiResponse(201,{
        course,
        thumbnail: thumbnail ? thumbnail.secure_url : null,
      }, "Course created successfully")
    );


  } catch (error) {
    return next(new ApiError(500, "Failed to create course", error.message));
  }
});

const getAllCourses = asyncHandler(async (req, res, next) => {
  try {
         const allCourses = await Course.find({},
            {
                courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
                ratingAndReviews: true, studentsEnrolled: true
            })
            .populate({
                path: 'instructor',
                select: 'firstName lastName email image'
            })
            .exec();
    if (!allCourses || allCourses.length === 0) {
      return next(new ApiError(404, "No courses found"));
    }

    return res.status(200).json(
      new ApiResponse(200, allCourses,"All courses retrieved successfully")
    );
  } catch (error) {
    return next(new ApiError(500, "Failed to get all courses", error.message));
  }
});

const getCourseDetails = asyncHandler(async (req, res, next) => {
  try {
    const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")

            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()

    if (!courseDetails) {
      return next(new ApiError(404, "Course not found"));
    }

      // console.log('courseDetails -> ', courseDetails)
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    return res.status(200).json(
      new ApiResponse(200, {
        courseDetails,
        totalDuration,
      },"Course details retrieved successfully")
    );

  } catch (error) {
    return next(
      new ApiError(500, "Failed to get course details", error.message)
    );
  }
});

const getFullCourseDetails = asyncHandler(async (req, res, next) => {
try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const courseDetails = await Course.findOne({ _id: courseId })
        .populate({
            path: "instructor",
            populate: { path: "additionalDetails" },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: { path: "subSection" },
        })
        .exec();

    if (!courseDetails) {
        throw new ApiError(404, `Could not find course with id: ${courseId}`);
    }
const user = await User.findById(userId);
if (!user) {
    throw new ApiError(404, `Could not find user with id: ${userId}`);
}
    const courseProgress = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
    });

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration);
            totalDurationInSeconds += timeDurationInSeconds;
        });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json(
        new ApiResponse(200, {
            courseDetails,
            totalDuration,
            completedVideos: courseProgress?.completedVideos || [],
        }, "Full course details retrieved successfully")
    );
} catch (error) {
    return next(new ApiError(500, "Failed to get full course details", error.message));
}
});

const editCourse = asyncHandler(async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const updates= req.body;
    const course = await Course.findById(courseId);     
    if (!course) {
      return next(new ApiError(404, `Course not found with id: ${courseId}`));
    }
    if (!updates) {
      return next(new ApiError(400, "No updates provided"));
    }
    if (course.instructor.toString() !== userId) {
        return next(new ApiError(403, "You are not authorized to edit this course"));
    }
    // Check if the user is the instructor of the course
    if (req.file && req.file.path) {
      const thumbnail = await uploadOnCloudinary(
        req.file.path,
        "courseThumbnails"
      );
      updates.thumbnail = thumbnail.secure_url;
    }

    for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        course.updatedAt = Date.now();

        await course.save();

        const updatedCourse = await Course.findOne({ _id: courseId })
            .populate({ path: "instructor", populate: { path: "additionalDetails" } })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({ path: "courseContent", populate: { path: "subSection" } })
            .exec();
    if (!updatedCourse) {
      return next(new ApiError(404, "Updated course not found"));
    }
    return res.status(200).json(
      new ApiResponse(200, {
        updatedCourse,
      },"Course edited successfully")
    );

  } catch (error) {
    return next(new ApiError(500, "Failed to edit course", error.message));
  }
});

const getInstructorCourses = asyncHandler(async (req, res, next) => {
  try {
        const instructorId = req.user._id;
    if (!instructorId) {
      return next(new ApiError(401, "Unauthorized: Instructor ID is required"));
    }
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.accountType !== "instructor") {
      return next(new ApiError(403, "Forbidden: Not an instructor"));
    }
    const instructorCourses = await Course.find({ instructor: instructorId })
      .populate("category")
      .populate("ratingAndReviews")
      .sort({ createdAt: -1 })
    if (!instructorCourses || instructorCourses.length === 0) {
      return next(new ApiError(404, "No courses found for this instructor"));
    }
    return res.status(200).json(
      new ApiResponse(200, "Instructor courses retrieved successfully", {
        instructorCourses,
      })
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to get instructor courses",
      error.message
    );
  }
});

const deleteCourse = asyncHandler(async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ApiError(404, `Course not found with id: ${courseId}`));
    }

    if (course.instructor.toString() !== userId) {
      return next(new ApiError(403, "You are not authorized to delete this course"));
    }

      // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }
    // Delete course thumbnail from Cloudinary if it exists
    if (course.thumbnail) {
      await deleteFromCloudinary(course.thumbnail);
    }

     const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        await deleteFromCloudinary(subSection.videoUrl) // delete course videos From Cloudinary
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json(
      new ApiResponse(200, "Course deleted successfully", null)
    );
  } catch (error) {
    throw new ApiError(500, "Failed to delete course", error.message);
  }
});

export {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
};
