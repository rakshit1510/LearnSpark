import { Router } from "express";
import { 
    sendOTP,
    signup,
    login,
    logout,
    changePassword 
} from "../controllers/user.controller.js";
import {
    resetPasswordToken,
    resetPassword
} from '../controllers/resetPassword.controller.js'
import { getAllStudents,
         getAllInstructors} from '../controllers/profile.controller.js'
import { verifyJWT,isAdmin,isInstructor,isStudent } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route('/signup').post(upload.single('image'), signup); // Using multer to handle file upload for image
router.route('/sendotp').post(upload.none(), sendOTP);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/changepassword').post(verifyJWT, changePassword);
router.route('/reset-password-token').post(resetPasswordToken)
router.route('/reset-password').post(resetPassword)
router.route('all-students').get(verifyJWT,isAdmin,getAllStudents)
router.route('/all-instructors').get(verifyJWT,isAdmin,getAllInstructors)
export default router;
