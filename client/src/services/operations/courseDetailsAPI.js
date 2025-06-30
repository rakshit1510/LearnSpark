import { toast } from "react-hot-toast";
import { updateCompletedLectures } from "../../slices/viewCourseSlice";
import { apiConnector } from "../apiConnector";
import { courseEndpoints } from "../apis";

const {
  COURSE_DETAILS_API,
  COURSE_CATEGORIES_API,
  GET_ALL_COURSE_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
  CREATE_NEW_CATEGORY,
  DELETE_CATEGORY
} = courseEndpoints;

// ================ Utility: Standard Toast Handling ================
const showToast = async (callback, loadingMsg = "Loading...") => {
  const toastId = toast.loading(loadingMsg);
  try {
    const result = await callback();
    toast.dismiss(toastId);
    return result;
  } catch (err) {
    toast.dismiss(toastId);
    throw err;
  }
};

// ================ Category APIs ================
export const createNewCategory = async (name, description, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", CREATE_NEW_CATEGORY, { name, description }, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not create category");
    toast.success("New Category Created");
    return res.data;
  });
};

export const deleteCategory = async (categoryId, token) => {
  return showToast(async () => {
    const res = await apiConnector("DELETE", DELETE_CATEGORY, { categoryId }, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not delete category");
    toast.success("Category Deleted");
    return res.data;
  });
};

// ================ Courses APIs ================
export const getAllCourses = async () => {
  return showToast(async () => {
    const res = await apiConnector("GET", GET_ALL_COURSE_API);
    if (!res?.data?.success) throw new Error("Could not fetch courses");
    return res.data.data;
  });
};

export const fetchCourseDetails = async (courseId) => {
  try {
    const res = await apiConnector("POST", COURSE_DETAILS_API, { courseId });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data;
  } catch (error) {
    console.log("COURSE_DETAILS_API ERROR:", error);
    return error.response?.data || null;
  }
};

// ======= Fetch Course Categories =======
export const fetchCourseCategories = async () => {
  try {
    const res = await apiConnector("GET", COURSE_CATEGORIES_API);
    console.log("fetching....",res)

    if (!res?.data?.data?.categories) {
      throw new Error("Could not fetch categories");
    }
    return res.data.data.categories; // ✅ Correctly access categories
  } catch (error) {
    console.log("COURSE_CATEGORY_API ERROR:", error);
    toast.error(error.message || "Failed to load categories");
    return []; // return empty array on error
  }
};

export const addCourseDetails = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", CREATE_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });
    console.log("ADD COURSE RES >>>", res)
    if (res?.data?.statusCode!==201) throw new Error("Could not add course details");
    toast.success("Course Added Successfully");
    return res.data.data;
  });
};

export const editCourseDetails = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.statusCode!==201) throw new Error("Could not update course");
    toast.success("Course Updated");
    return res.data.data;
  });
};

// ================ Section & Subsection APIs ================
export const createSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    console.log("section",res)
    if (res?.data?.statusCode!==201) {
      throw new Error("Could not create section");
    }

    toast.success("Section Created");

    return res.data.data.updatedCourseDetails; // ✅ Fix here
  });
};


export const updateSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (res?.data?.statusCode!==201) throw new Error("Could not update section");
    toast.success("Section Updated");
    return res.data.data;
  });
};

export const deleteSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not delete section");
    toast.success("Section Deleted");
    return res.data.data;
  });
};

export const createSubSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not create subsection");
    toast.success("Lecture Added");
    return res.data.data;
  });
};

export const updateSubSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not update lecture");
    toast.success("Lecture Updated");
    return res.data.data;
  });
};

export const deleteSubSection = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not delete lecture");
    toast.success("Lecture Deleted");
    return res.data.data;
  });
};

// ================ Instructor APIs ================

export const fetchInstructorCourses = async (token) => {
  try {
    const res = await apiConnector("GET", GET_ALL_INSTRUCTOR_COURSES_API, null, {
      Authorization: `Bearer ${token}`,
    });
    console.log("instrucor courses",res)
    // ✅ Check for success
    if (!res?.data?.statusCode === 200 || !res?.data?.data?.instructorCourses) {
      throw new Error("Could not fetch instructor courses");
    }

    // ✅ Return only the courses array
    return res.data.data.instructorCourses;
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR:", error);
    toast.error(error.message || "Failed to fetch courses");
    return [];
  }
};

// ✅ Assumes DELETE_COURSE_API = "/api/v1/course/deleteCourse"
export const deleteCourse = async (courseId, token) => {
  try {
    const res = await apiConnector(
      "DELETE",
      `${DELETE_COURSE_API}/${courseId}`, // ✅ Send ID in URL
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("delete response ",res)
    if (res?.data?.statusCode !== 200) {
      throw new Error("Could not delete course");
    }

    toast.success("Course Deleted");
  } catch (error) {
    console.log("DELETE COURSE ERROR:", error);
    toast.error(error.message || "Failed to delete course");
  }
};

// ================ Others ================
export const getFullDetailsOfCourse = async (courseId, token) => {
  try {
    const res = await apiConnector("POST", GET_FULL_COURSE_DETAILS_AUTHENTICATED, { courseId }, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  } catch (error) {
    console.log("COURSE_FULL_DETAILS_API ERROR:", error);
    return error.response?.data || null;
  }
};

export const markLectureAsComplete = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.message) throw new Error(res.data.error);
    toast.success("Lecture Completed");
    return true;
  });
};

export const createRating = async (data, token) => {
  return showToast(async () => {
    const res = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!res?.data?.success) throw new Error("Could not create rating");
    toast.success("Rating Created");
    return true;
  });
};
