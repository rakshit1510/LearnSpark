import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"

import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({ modalData, setModalData, add = false, view = false, edit = false }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  // Fill form fields in case of view/edit
  useEffect(() => {
    if ((view || edit) && modalData) {
      setValue("lectureTitle", modalData?.title || "")
      setValue("lectureDesc", modalData?.description || "")
      setValue("lectureVideo", modalData?.videoUrl || "")
    }
  }, [modalData, setValue, view, edit])

  const isFormUpdated = () => {
    const currentValues = getValues()
    return (
      currentValues.lectureTitle !== modalData?.title ||
      currentValues.lectureDesc !== modalData?.description ||
      currentValues.lectureVideo !== modalData?.videoUrl
    )
  }

  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    formData.append("sectionId", modalData.sectionId)
    formData.append("subSectionId", modalData._id)

    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }

    try {
      setLoading(true)
      const result = await updateSubSection(formData, token)
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section
        )
        dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
        toast.success("Lecture updated")
      }
    } catch (error) {
      toast.error("Update failed")
    } finally {
      setModalData(null)
      setLoading(false)
    }
  }
const onSubmit = async (data) => {
  if (view) return;

  if (edit) {
    if (!isFormUpdated()) {
      toast.error("No changes made to the form");
      return;
    }
    handleEditSubsection();
    return;
  }

  if (!(data.lectureVideo instanceof File)) {
    toast.error("Please upload a valid video file");
    return;
  }

  const formData = new FormData();
  formData.append("sectionId", modalData.sectionId || modalData);
  formData.append("title", data.lectureTitle);
  formData.append("description", data.lectureDesc);
  formData.append("video", data.lectureVideo);

  try {
    setLoading(true);
    const result = await createSubSection(formData, token);
    console.log("result ",result)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === (modalData.sectionId || modalData) ? result : section
      );
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }));
      toast.success("Lecture added");
    }
  } catch (error) {
    toast.error("Creation failed");
  } finally {
    setModalData(null);
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 z-[1000] grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-8 py-10">
          {/* Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData?.videoUrl : null}
            editData={edit ? modalData?.videoUrl : null}
          />

          {/* Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture description is required
              </span>
            )}
          </div>

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading..." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
