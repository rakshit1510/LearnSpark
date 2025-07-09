import instance from '../config/razorpay.js'; // Fixed spelling
import crypto from 'crypto';
import mailSender from '../utils/mailSender.js';
import courseEnrollmentEmail from '../email/templates/courseEnrollmentEmail.js';
import paymentSuccessEmail from "../email/templates/paymentSuccessEmail.js";
import { User } from '../models/user.model.js';
import Course from '../models/course.model.js';
import CourseProgress from '../models/courseProgress.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';


// ------------------- Create Razorpay Order -------------------
const capturePayment = asyncHandler(async (req, res) => {
  try {
    const { coursesId } = req.body;
    const userId = req.user._id;

    if (!userId) throw new ApiError(400, "User ID is missing");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!coursesId || !Array.isArray(coursesId) || coursesId.length === 0) {
      throw new ApiError(400, "Please provide Course Id(s)");
    }
    let totalAmount = 0;
    
    for (const course_id of coursesId) {
      const course = await Course.findById(course_id);
      if (!course) throw new ApiError(404, "Course not found");
      
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        throw new ApiError(400, `Already enrolled in ${course.courseName}`);
      }
      
      totalAmount += course.price;
    }
    
    const currency = "INR";
    const options = {
      amount: totalAmount * 100, // in paise
      currency,
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    
    console.log("Courses ID:", coursesId);
    if(options.amount <= 0) {
      await enrollStudents(coursesId, userId);
      return res.status(200).json(new ApiResponse(200, null, "No payment required, students enrolled successfully"));
    }
    const paymentResponse = await instance.orders.create(options);
    
    res.status(200).json(new ApiResponse(200, paymentResponse, "Order created"));
  } catch (error) {
    throw new ApiError(500, error.message || "Internal server error in capturePayment");
  }
});


// ------------------- Verify Razorpay Payment -------------------
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, coursesId } = req.body;
    const userId = req.user?.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !coursesId || !userId) {
      throw new ApiError(400, "Missing required payment or user data.");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!Array.isArray(coursesId) || coursesId.length === 0) {
      throw new ApiError(400, "Invalid or empty courses list.");
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature.toString()) {
      throw new ApiError(400, "Payment verification failed: Invalid signature.");
    }

    await enrollStudents(coursesId, userId);

    return res.status(200).json(
      new ApiResponse(200, null, "Payment verified and student enrolled successfully.")
    );
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    throw new ApiError(500, error.message || "Internal Server Error in verifyPayment");
  }
});


// ------------------- Enroll Student After Payment -------------------
const enrollStudents = async (courses, userId) => {
  try {
    if (!courses || !userId) {
      throw new ApiError(400, "Course and User ID are required.");
    }

    for (const courseId of courses) {
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        throw new ApiError(404, `Course not found: ${courseId}`);
      }

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      if (!enrolledStudent) {
        throw new ApiError(404, "Student not found.");
      }

      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
      );
    }

    return true;
  } catch (error) {
    console.error("Error in enrollStudents:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to enroll students"
    );
  }
};


// ------------------- Send Payment Success Email -------------------
const sendPaymentSuccessEmail = asyncHandler(async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user?.id;

    if (!orderId || !paymentId || !amount || !userId) {
      throw new ApiError(400, "Missing orderId, paymentId, amount, or userId");
    }

    const enrolledStudent = await User.findById(userId);
    if (!enrolledStudent) throw new ApiError(404, "User not found");

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        enrolledStudent.firstName,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Payment success email sent successfully"));
  } catch (error) {
    console.error("Error in sendPaymentSuccessEmail:", error);
    throw new ApiError(500, "Failed to send payment success email");
  }
});


// ------------------- Export All -------------------
export {
  capturePayment,
  verifyPayment,
  enrollStudents,
  sendPaymentSuccessEmail,
};
