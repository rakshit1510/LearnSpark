import React, { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import Img from "./../../common/Img"
import { toast } from "react-hot-toast"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user enrolled courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await getUserEnrolledCourses(token)
        setEnrolledCourses(res)
      } catch (error) {
        toast.error("Could not fetch enrolled courses.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Skeleton UI
  const sklItem = () => (
    <div className="flex border border-richblack-700 px-5 py-3 w-full">
      <div className="flex flex-1 gap-x-4">
        <div className="h-14 w-14 rounded-lg skeleton"></div>
        <div className="flex flex-col w-[40%]">
          <p className="h-2 w-[50%] rounded-xl skeleton"></p>
          <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
        </div>
      </div>
      <div className="flex flex-[0.4] flex-col">
        <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
        <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
      </div>
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <div>
        {sklItem()}
        {sklItem()}
        {sklItem()}
        {sklItem()}
        {sklItem()}
      </div>
    )
  }

  // Empty state
  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <p className="grid h-[50vh] w-full place-content-center text-center text-richblack-5 text-3xl">
        You have not enrolled in any course yet.
      </p>
    )
  }

  return (
    <>
      <div className="text-4xl text-richblack-5 font-boogaloo text-center sm:text-left">
        Enrolled Courses
      </div>

      <div className="my-8 text-richblack-5">
        {/* Table headers */}
        <div className="flex rounded-t-2xl bg-richblack-800">
          <p className="w-[45%] px-5 py-3">Course Name</p>
          <p className="w-1/4 px-2 py-3">Duration</p>
          <p className="flex-1 px-2 py-3">Progress</p>
        </div>

        {/* Course Rows */}
        {enrolledCourses.map((course, i, arr) => {
          const section = course?.courseContent?.[0]
          const subSection = section?.subSection?.[0]
          const isLast = i === arr.length - 1

          return (
            <div
              key={course._id}
              className={`flex flex-col sm:flex-row sm:items-center border border-richblack-700 ${
                isLast ? "rounded-b-2xl" : ""
              }`}
            >
              {/* Left column - Thumbnail and Info */}
              <div
                className="flex sm:w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  if (section && subSection) {
                    navigate(
                      `/view-course/${course._id}/section/${section._id}/sub-section/${subSection._id}`
                    )
                  } else {
                    toast.error("Course content is incomplete.")
                  }
                }}
              >
                <Img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>

              {/* Small screens - Duration & Progress */}
              <div className="sm:hidden">
                <div className="px-2 py-3">{course?.totalDuration}</div>
                <div className="flex flex-col gap-2 px-2 py-3">
                  <p>Progress: {course.progressPercentage || 0}%</p>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                  />
                </div>
              </div>

              {/* Large screens - Duration & Progress */}
              <div className="hidden sm:flex w-1/5 px-2 py-3">
                {course?.totalDuration}
              </div>
              <div className="hidden sm:flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
