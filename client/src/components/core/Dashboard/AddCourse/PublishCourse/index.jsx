import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI.js"
import { resetCourseState, setStep } from "../../../../../slices/courseSlice.js"
import { COURSE_STATUS } from "../../../../../utils/constants.js"
import IconBtn from "../../../../common/IconBtn.jsx"

export default function PublishCourse() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {
      public: false,
    },
  })

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true)
    }
  }, [course, setValue])

  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCoursePublish = async () => {
    const isChecked = getValues("public")
    const currentStatus = course?.status

    // ✅ Avoid unnecessary update if nothing changed
    if (
      (currentStatus === COURSE_STATUS.PUBLISHED && isChecked) ||
      (currentStatus === COURSE_STATUS.DRAFT && !isChecked)
    ) {
      goToCourses()
      return
    }

    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("status", isChecked ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT)

    try {
      setLoading(true)

      // Optional: log what you're sending
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`)
      // }

      const result = await editCourseDetails(formData, token)

      if (result) {
        toast.success("Course updated successfully")
        goToCourses()
      } else {
        toast.error("Failed to update course")
      }
    } catch (error) {
      console.error("Course publish error:", error)
      toast.error("Something went wrong while publishing course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Publish Settings</p>

      <form onSubmit={handleSubmit(handleCoursePublish)}>
        {/* Checkbox */}
        <div className="my-6 mb-8">
          <label htmlFor="public" className="inline-flex items-center text-lg">
            <input
              type="checkbox"
              id="public"
              {...register("public")}
              className="h-4 w-4 rounded bg-richblack-500 border-gray-300 text-richblack-400 focus:ring-2 focus:ring-richblack-5"
            />
            <span className="ml-2 text-richblack-400">Make this course public</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="ml-auto flex max-w-max items-center gap-x-4">
          <button
            type="button"
            onClick={goBack}
            disabled={loading}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900"
          >
            Back
          </button>
          <IconBtn disabled={loading} text={loading ? "Saving..." : "Save Changes"} />
        </div>
      </form>
    </div>
  )
}
