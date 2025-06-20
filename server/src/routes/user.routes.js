import { Router } from "express";
import { sendOTP,signup,login,logout,changePassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route('/signup').post(upload.single('image'), signup); // Using multer to handle file upload for image
router.route('/sendotp').post(upload.none(), sendOTP);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/changepassword').post(verifyJWT, changePassword);

export default router;
