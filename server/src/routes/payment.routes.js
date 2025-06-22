
import express from 'express';
import { Router } from "express";
import {
  capturePayment,
  verifyPayment,
  enrollStudents,
  sendPaymentSuccessEmail,
} from "../controllers/payments.controller.js";
import { verifyJWT,isAdmin,isInstructor,isStudent } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/capturePayment").post(verifyJWT,isStudent,capturePayment);
router.route("/verifyPayment").post( verifyJWT,isStudent,verifyPayment);

export default router;