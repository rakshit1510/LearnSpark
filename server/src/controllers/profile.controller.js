import Profile from '../models/profile.model.js';
import {User} from '../models/user.model.js';
import CourseProgress from '../models/courseProgress.model.js';
import Course from '../models/course.model.js';
import { uploadOnCloudinary,deleteFromCloudinary } from '../utils/Cloudinary.js';
import { convertSecondsToDuration } from '../utils/secToDuration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
//update profile
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fixed destructuring
    const {
      gender = '',
      dateOfBirth = '',
      about = '',
      contactNumber = '',
      firstName,
      lastName
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (!firstName || !lastName) {
      throw new ApiError(400, "First name and last name are required");
    }

    const user = await User.findById(userId).populate("additionalDetails"); // ✅ populate profile
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();

    const profileData = { gender, dateOfBirth, about, contactNumber };

    if (user.additionalDetails) {
      const existingProfile = user.additionalDetails;
      Object.assign(existingProfile, profileData);
      await existingProfile.save();
    } else {
      const newProfile = await Profile.create({ ...profileData, user: userId });
      user.additionalDetails = newProfile._id;
      await user.save();
    }

    const updatedUserDetails = await User.findById(userId).populate('additionalDetails');

    res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUserDetails));

  } catch (error) {
    console.error(error); // helpful for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});


const deleteAccount = asyncHandler(async (req, res) => {
 try {
    const userId = req.user._id; // ✅ 
    const userDetails= await User.findById(userId)
    if (!userDetails) {
      throw new ApiError(404, "User not found");
    }

    await deleteFromCloudinary(userDetails.image); // delete user image from cloudinary

    const userEnrolledCoursesId = userDetails.courses

    for (const courseId of userEnrolledCoursesId) {
        await Course.findByIdAndUpdate(courseId, {
            $pull: { studentsEnrolled: userId } // remove user from course's studentsEnrolled array
        }); 

        await Profile.findByIdAndDelete(userDetails.additionalDetails); // delete user profile
        await User.findByIdAndDelete(userId); // delete user account    
        return res.status(200).json(new ApiResponse(200, "Account deleted successfully"));
    }
    // delete course progress of user

 } catch (error) {
    console.error(error); // helpful for debugging
    throw new ApiError(500, "Internal Server Error in deleteAccount");
    
 }

  })
    

const getUserDetails = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fixed destructuring

    if(!userId) {
      throw new ApiError(400, "User ID is required");
    }
    const userDetails = await User.findById(userId)
      .populate('additionalDetails')
      .exec();  
    if (!userDetails) {
      throw new ApiError(404, "User not found");
    }   

    return res.status(200).json(new ApiResponse(200, "User details fetched successfully", userDetails));
  } catch (error) {
    console.error(error); // helpful for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});

const updateUserProfileImage = asyncHandler(async (req, res) => {
  try {
    const profileImage = req.file;
    const userId = req.user._id;

    console.log("updating", profileImage);
    if (!profileImage) {
      throw new ApiError(400, "Profile image is required");
    }

    const imageUrl = await uploadOnCloudinary(profileImage.path, "profile_images");

    if (!imageUrl || !imageUrl.secure_url) {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.image) {
      await deleteFromCloudinary(user.image);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl.secure_url }, // ✅ store only the URL
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "Failed to update user profile image");
    }

    return res.status(200).json(
      new ApiResponse(200, updatedUser, "Profile image updated successfully")
    );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal Server Error in updateUserProfileImage");
  }
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id; // ✅ fixed destructuring
        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        let userDetails = await User.findById(userId).populate(
            { path: "courses", 
                populate: { path: "courseContent",
                    populate: { path: "subSection", } // Populate lessons within courseContent
                 } 
            }
        ).exec();

        if (!userDetails) {
            throw new ApiError(404, "User not found");
        }

        userDetails = userDetails.toObject(); // Convert Mongoose document to plain object

        for (let i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0;
            let SubsectionLength = 0;
            for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce(
                    (acc, curr) => acc + parseInt(curr.timeDuration), 0
                );
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length;
            }
            userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds);

            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            });

            courseProgressCount = courseProgressCount ? courseProgressCount.completedVideos.length : 0;
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100; // If no lessons, progress is 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2);
                userDetails.courses[i].progressPercentage =
                    Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier;
            }
        }

        return res.status(200).json(new ApiResponse(200,  userDetails.courses,"Enrolled courses fetched successfully"));
    } catch (error) {
        console.error(error); // helpful for debugging
        throw new ApiError(500, "Internal Server Error in getEnrolledCourses");
    }
});


const instructorDashboard = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id; // ✅ fixed destructuring
        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }
        const courseDetails = await Course.find({ instructor: userId })

        const courseData = courseDetails.map((course) => {
              const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats;
        })

        if (!courseData || courseData.length === 0) {
            throw new ApiError(404, "No courses found for this instructor");
        }
        return res.status(200).json(new ApiResponse(200, "Instructor dashboard data fetched successfully", courseData));

    } catch (error) {
        console.error(error); // helpful for debugging
        throw new ApiError(500, "Internal Server Error in instructorDashboard");
        
    }
});


const getAllStudents = asyncHandler(async (req, res) => {
    try {
         const allStudentsDetails = await User.find({
            accountType: 'Student'
        })
            .populate('additionalDetails')
            .populate('courses')
            .sort({ createdAt: -1 });


        const studentsCount = await User.countDocuments({
            accountType: 'Student'
        });

        if (!allStudentsDetails || allStudentsDetails.length === 0) {
            throw new ApiError(404, "No students found");
        }
        return res.status(200).json(new ApiResponse(200, "All students fetched successfully", {
            students: allStudentsDetails,
            totalStudents: studentsCount
        }));
    } catch (error) {
        console.error(error); // helpful for debugging
        throw new ApiError(500, "Internal Server Error in getAllStudents");
        
    }
})


const getAllInstructors = asyncHandler(async (req, res) => {
    try {
        const allInstructorsDetails = await User.find({
            accountType: 'Instructor'
        })
            .populate('additionalDetails')
            .populate('courses')
            .sort({ createdAt: -1 });

        const instructorsCount = await User.countDocuments({
            accountType: 'Instructor'
        });

        if (!allInstructorsDetails || allInstructorsDetails.length === 0) {
            throw new ApiError(404, "No instructors found");
        }
        return res.status(200).json(new ApiResponse(200, "All instructors fetched successfully", {
            instructors: allInstructorsDetails,
            totalInstructors: instructorsCount
        }));
    } catch (error) {
        console.error(error); // helpful for debugging
        throw new ApiError(500, "Internal Server Error in getAllInstructors");
        
    }
})
export {
    updateProfile,
    deleteAccount,
    getEnrolledCourses,
    getUserDetails,
    updateUserProfileImage,
    instructorDashboard,
    getAllStudents,
    getAllInstructors
};
// The above code defines a controller function to update a user's profile in a Node.js application using Mongoose for MongoDB interactions.