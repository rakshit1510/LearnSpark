import { apiConnector } from "../apiConnector"
import { adminEndPoints } from '../apis'
// import { toast } from "react-hot-toast"

const { GET_ALL_STUDENTS_DATA_API, GET_ALL_INSTRUCTORS_DATA_API } = adminEndPoints

// ================ Get All Students Data ================
export async function getAllStudentsData(token) {
  let result = []

  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_STUDENTS_DATA_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET_ALL_STUDENTS_DATA_API RESPONSE............", response)

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message)
    }

    result = response.data.data
  } catch (error) {
    console.log("GET_ALL_STUDENTS_DATA_API ERROR............", error)
    // toast.error(error?.response?.data?.message || "Could not get all students data")
  }

  return result
}

// ================ Get All Instructor Details ================
export async function getAllInstructorDetails(token) {
  let result = []

  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTORS_DATA_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET_ALL_INSTRUCTORS_DATA_API RESPONSE............", response)

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message)
    }

    result = response.data.data
  } catch (error) {
    console.log("GET_ALL_INSTRUCTORS_DATA_API ERROR............", error)
    // toast.error(error?.response?.data?.message || "Could not get instructor data")
  }

  return result
}
