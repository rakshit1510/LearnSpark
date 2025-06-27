import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints

// ================ update User Profile Image ================
export function updateUserProfileImage(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating profile picture...")

    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )

      console.log("UPDATE_DISPLAY_PICTURE_API RESPONSE:", response)

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message)
      }

      toast.success("Display Picture Updated Successfully")

      const user = response.data.data
      dispatch(setUser(user))
      localStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      console.log("UPDATE_DISPLAY_PICTURE_API ERROR:", error)
      toast.error("Could Not Update Profile Picture")
    }

    toast.dismiss(toastId)
  }
}

// ================ update Profile ================
export function updateProfile(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating profile...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })

      console.log("UPDATE_PROFILE_API RESPONSE:", response)

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message)
      }

      const updatedUser = response.data.data
      const userImage = updatedUser?.image
        ? updatedUser.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${updatedUser.firstName} ${updatedUser.lastName}`

      dispatch(setUser({ ...updatedUser, image: userImage }))
      localStorage.setItem("user", JSON.stringify({ ...updatedUser, image: userImage }))

      toast.success("Profile Updated Successfully")
    } catch (error) {
      console.log("UPDATE_PROFILE_API ERROR:", error)
      toast.error("Could Not Update Profile")
    }

    toast.dismiss(toastId)
  }
}

// ================ change Password ================
export async function changePassword(token, formData) {
  const toastId = toast.loading("Changing password...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })

    console.log("CHANGE_PASSWORD_API RESPONSE:", response)

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message)
    }

    toast.success("Password Changed Successfully")
  } catch (error) {
    console.log("CHANGE_PASSWORD_API ERROR:", error)
    toast.error(error?.response?.data?.message || "Could Not Change Password")
  }

  toast.dismiss(toastId)
}

// ================ delete Profile ================
export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting profile...")

    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })

      console.log("DELETE_PROFILE_API RESPONSE:", response)

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message)
      }

      toast.success("Profile Deleted Successfully")
      dispatch(logout(navigate))
    } catch (error) {
      console.log("DELETE_PROFILE_API ERROR:", error)
      toast.error("Could Not Delete Profile")
    }

    toast.dismiss(toastId)
  }
}
