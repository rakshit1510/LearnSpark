import { toast } from "react-hot-toast"
import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  GET_USER_DETAILS_API,
  GET_USER_ENROLLED_COURSES_API,
  GET_INSTRUCTOR_DATA_API,
} = profileEndpoints

// ================ Get User Details ================
export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))

    try {
      const response = await apiConnector(
        "GET",
        GET_USER_DETAILS_API,
        null,
        { Authorization: `Bearer ${token}` }
      )

      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message)
      }

      const user = response.data.data

      const userImage = user.image
        ? user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`

      dispatch(setUser({ ...user, image: userImage }))
    } catch (error) {
      console.log("GET_USER_DETAILS API ERROR............", error)
      dispatch(logout(navigate))
      toast.error(error?.response?.data?.message || "Could Not Get User Details")
    }

    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

// ================ Get User Enrolled Courses ================
export async function getUserEnrolledCourses(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_COURSES_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    console.log("GET_USER_ENROLLED_COURSES_API RESPONSE:", response);

    // Check for success based on your ApiResponse format
    if (response.data.statusCode !== 200 || !response.data.success) {
      throw new Error(response.data.message || "Failed to fetch enrolled courses");
    }

    // Always return the array (data) directly
    return response.data.data || [];
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Could not fetch enrolled courses");
    return []; // Return empty array on failure to avoid .map crash
  }
}

// ================ Get Instructor Data ================
export async function getInstructorData(token) {
  let result = []

  try {
    const response = await apiConnector(
      "GET",
      GET_INSTRUCTOR_DATA_API,
      null,
      { Authorization: `Bearer ${token}` }
    )

    console.log("GET_INSTRUCTOR_DATA_API RESPONSE............", response)

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message)
    }

    result = response.data.data
  } catch (error) {
    console.log("GET_INSTRUCTOR_DATA_API ERROR............", error)
    toast.error(error?.response?.data?.message || "Could Not Get Instructor Data")
  }

  return result
}
