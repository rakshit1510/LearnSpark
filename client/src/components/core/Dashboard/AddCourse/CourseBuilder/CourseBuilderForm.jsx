import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI"
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice"

import IconBtn from "../../../../common/IconBtn"
import NestedView from "./NestedView"

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const course = useSelector((state) => state.course.course)
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)

  // 🔁 Redirect to Step 1 if course is missing or invalid
  useEffect(() => {
    if (!course || !Array.isArray(course.courseContent)) {
      toast.error("Course not found. Redirecting to step 1.")
      dispatch(setStep(1))
      dispatch(setEditCourse(false))
      navigate("/dashboard/add-course") // ⬅️ update route if different
    }
  }, [course, dispatch, navigate])

  const onSubmit = async (data) => {
    setLoading(true)
    let result

    try {
      const sectionData = {
        sectionName: data.sectionName,
        courseId: course._id,
      }

      if (editSectionName) {
        sectionData.sectionId = editSectionName
        result = await updateSection(sectionData, token)
      } else {
        result = await createSection(sectionData, token)
      }

      if (result) {
        dispatch(setCourse(result))
        setEditSectionName(null)
        setValue("sectionName", "")
      } else {
        toast.error("Could not update course content")
      }
    } catch (err) {
      console.log(err)
      toast.error("Failed to save section")
    }

    setLoading(false)
  }

  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit()
    } else {
      setEditSectionName(sectionId)
      setValue("sectionName", sectionName)
    }
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  const goToNext = () => {
    if (!Array.isArray(course.courseContent) || course.courseContent.length === 0) {
      toast.error("Please add at least one section")
      return
    }

    const hasEmptySubsections = course.courseContent.some(
      (section) => !section.subSection || section.subSection.length === 0
    )

    if (hasEmptySubsections) {
      toast.error("Please add at least one lecture in each section")
      return
    }

    dispatch(setStep(3))
  }

  return (
    <div className="space-y-8 rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        <div className="flex items-end gap-x-4">
          <IconBtn
            type="submit"
            disabled={loading}
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true}
          >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>

          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Section + Lecture List */}
      {Array.isArray(course.courseContent) &&
        course.courseContent.length > 0 && (
          <NestedView
            handleChangeEditSectionName={handleChangeEditSectionName}
          />
        )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-x-3">
        <button
          onClick={goBack}
          className="rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
        >
          Back
        </button>

        <IconBtn disabled={loading} text="Next" onclick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  )
}
