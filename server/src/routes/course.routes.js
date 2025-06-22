import express from 'express'
import { Router } from "express";

const router= Router()


import {
    verifyJWT,
    isAdmin,
    isInstructor,
    isStudent
} from '../middlewares/auth.middleware.js'

import { upload } from '../middlewares/multer.middleware.js';

import  {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} from '../controllers/course.controller.js'

import {
    updateCourseProgress
} from '../controllers/courseProgress.controller.js'

import {
     createSubSection,
    updateSubSection,
    deleteSubSection,
} from '../controllers/subSection.controller.js'

import {
    createSection,
    updateSection,
    deleteSection,
} from '../controllers/section.controller.js'

import {
    createRating,
    getAverageRating,
    getAllRatingReviews
} from '../controllers/ratingAndReview.controller.js'


import {
    createCategory,
    deleteCategory,
    showAllCategories,
    getCategoryPageDetails
} from '../controllers/category.controller.js'

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

router.route('/createCourse')
    .post(verifyJWT, isInstructor, upload.single('thumbnail'), createCourse);

router.route('/editCourse')
    .post(verifyJWT, isInstructor, upload.single('thumbnail'), editCourse);

router.route('/getCourseDetails')
    .post(getCourseDetails);

router.route('/getAllCourses')
    .get(getAllCourses);

router.route('/getFullCourseDetails')
    .post(verifyJWT, getFullCourseDetails);

router.route('/getInstructorCourses')
    .get(verifyJWT, isInstructor, getInstructorCourses);

router.route('/deleteCourse')
    .delete(verifyJWT, isInstructor, deleteCourse);

router.route('/updateCourseProgress')
    .post(verifyJWT, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Section routes
// ********************************************************************************************************

router.route('/addSection')
    .post(verifyJWT, isInstructor, createSection);

router.route('/updateSection')
    .post(verifyJWT, isInstructor, updateSection);

router.route('/deleteSection')
    .post(verifyJWT, isInstructor, deleteSection);

// ********************************************************************************************************
//                                      SubSection routes
// ********************************************************************************************************

router.route('/addSubSection')
    .post(verifyJWT, isInstructor, upload.single('video'), createSubSection);

router.route('/updateSubSection')
    .post(verifyJWT, isInstructor, upload.single('video'), updateSubSection);

router.route('/deleteSubSection')
    .post(verifyJWT, isInstructor, deleteSubSection);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

router.route('/createCategory')
    .post(verifyJWT, isAdmin, createCategory);

router.route('/deleteCategory')
    .delete(verifyJWT, isAdmin, deleteCategory);

router.route('/showAllCategories')
    .get(showAllCategories);

router.route('/getCategoryPageDetails')
    .post(getCategoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************

router.route('/createRating')
    .post(verifyJWT, isStudent, createRating);

router.route('/getAverageRating')
    .get(getAverageRating);

router.route('/getReviews')
    .get(getAllRatingReviews);

export default router;
