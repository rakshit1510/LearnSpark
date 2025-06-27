import Category from '../models/category.model.js'
import {User} from '../models/user.model.js'  
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// ================ Create Category (Admin Only) ================
 const createCategory = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user; // Set by auth middleware
        if(!userId){
            throw new ApiError('Unauthorized', 401);
        }
        // ========== Input Validation ==========
        if (!name || !description) {
            throw new ApiError(400, "Both 'name' and 'description' are required");
        }

        // ========== User Check ==========
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        // ========== Role Check ==========
        if (user.accountType !== "Admin") {
            throw new ApiError(403, "Forbidden: Only admins can create categories");
        }

        // ========== Check for Duplicate Category ==========
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            throw new ApiError(409, `Category with name "${name}" already exists`);
        }

        // ========== Create Category ==========
        const category = await Category.create({ name, description });

        // ========== Success Response ==========
        return res.status(201).json(
            new ApiResponse(201, "Category created successfully", { category })
        );

    } catch (error) {
        console.error("❌ Error in createCategory:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Internal Server Error in createCategory");
    }
});


// ================ Delete Category (Admin Only) ================
 const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { categoryId } = req.body;
        const userId = req.user?.id;

        // ========== Input Validation ==========
        if (!categoryId) {
            throw new ApiError(400, "categoryId is required");
        }

        // ========== User Lookup ==========
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        // ========== Admin Role Check ==========
        if (user.accountType !== "Admin") {
            throw new ApiError(403, "Forbidden: Only admins can delete categories");
        }

        // ========== Check Category Existence ==========
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        // ========== Perform Deletion ==========
        await Category.findByIdAndDelete(categoryId);

        // ========== Success Response ==========
        return res.status(200).json(
            new ApiResponse(200, "Category deleted successfully")
        );
    } catch (error) {
        console.error("❌ Error in deleteCategory:", error);

        if (error instanceof ApiError) {
            throw error; // Already handled custom error
        }

        throw new ApiError(500, "Internal Server Error in deleteCategory");
    }
});


// ================ Get All Categories ================
 const showAllCategories = asyncHandler(async (req, res) => {
    try {
        // Fetch all categories from DB (only name and description fields)
        const allCategories = await Category.find({}, { name: 1, description: 1 });

        // Edge case: No categories found
        if (!allCategories || allCategories.length === 0) {
            throw new ApiError(404, "No categories found");
        }

        // Success response
        return res.status(200).json(
            new ApiResponse(200, "All categories fetched successfully", {
                categories: allCategories,
                total: allCategories.length
            })
        );

    } catch (error) {
        console.error("❌ Error in showAllCategories:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Internal Server Error in showAllCategories");
    }
});

// ================ Get Category Page Details ================
 const getCategoryPageDetails = asyncHandler(async (req, res) => {
    try {
        const { categoryId } = req.body;

        // ========== Validation ==========
        if (!categoryId) {
            throw new ApiError(400, "categoryId is required");
        }
        // ========== Get Selected Category and Its Courses ==========
        const selectedCategory = await Category.findById(categoryId)
        .populate({
            path: "courses",
            match: { status: "Published" },
            populate: "ratingAndReviews",
        });
        console.log("category",selectedCategory)

        if (!selectedCategory) {
            throw new ApiError(404, "Category not found");
        }

        if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
            throw new ApiError(404, "No published courses found for this category");
        }

        // ========== Get a Different Random Category ==========
        const otherCategories = await Category.find({ _id: { $ne: categoryId } });

        let differentCategory = null;
        if (otherCategories.length > 0) {
            const randomIndex = getRandomInt(otherCategories.length);
            const randomCategoryId = otherCategories[randomIndex]._id;

            differentCategory = await Category.findById(randomCategoryId)
                .populate({
                    path: "courses",
                    match: { status: "Published" },
                });
        }

        // ========== Get Top Selling Courses Across All Categories ==========
        const allCategories = await Category.find().populate({
            path: "courses",
            match: { status: "Published" },
            populate: { path: "instructor" },
        });

        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        // ========== Success Response ==========
        return res.status(200).json(
            new ApiResponse(200, "Category page details fetched successfully", {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            })
        );
    } catch (error) {
        console.error("❌ Error in getCategoryPageDetails:", error);
        throw new ApiError(500, "Internal Server Error in getCategoryPageDetails");
    }
});



export {
    createCategory,
    deleteCategory,
    showAllCategories,
    getCategoryPageDetails
}