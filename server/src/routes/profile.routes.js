import { Router } from "express";
import { updateProfile,
         deleteAccount,
         getEnrolledCourses,
         getUserDetails,
         updateUserProfileImage,
         instructorDashboard,
         getAllStudents,
         getAllInstructors} from "../controllers/profile.controller.js";
import { verifyJWT,
            isStudent,
            isInstructor,
            isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route('/updateProfile').put(verifyJWT, updateProfile);
router.route('/deleteProfile').delete(verifyJWT, deleteAccount);
router.route('/getEnrolledCourses').get(verifyJWT, getEnrolledCourses);
router.route('/getUserDetails').get(verifyJWT, getUserDetails);
router.route('/updateUserProfileImage').put(verifyJWT, upload.single('profileImage'), updateUserProfileImage);
router.route('/instructorDashboard').get(verifyJWT, isInstructor, instructorDashboard);
router.route('/getAllStudents').get(verifyJWT, isAdmin, getAllStudents);
router.route('/getAllInstructors').get(verifyJWT, isAdmin, getAllInstructors);
export default router;
/* Profile routes for user management and dashboard operations */