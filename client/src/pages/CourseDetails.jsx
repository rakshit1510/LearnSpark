import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { GiReturnArrow } from 'react-icons/gi'
import { MdOutlineVerified } from 'react-icons/md'

import ConfirmationModal from "../components/common/ConfirmationModal"
import Footer from "../components/common/Footer"
import RatingStars from "../components/common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import Img from './../components/common/Img'
import Loading from "../components/common/Loading"

import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import { ACCOUNT_TYPE } from "../utils/constants"
import GetAvgRating from "../utils/avgRating"
import { addToCart } from "../slices/cartSlice"

import toast from "react-hot-toast"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { courseId } = useParams()

  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  const [isActive, setIsActive] = useState([])

  // Fetch course details
  useEffect(() => {
    if (!courseId) return
    const fetchDetails = async () => {
      const res = await fetchCourseDetails(courseId)
      if (res?.data?.courseDetails) {
        setResponse(res)
      }
    }
    fetchDetails()
  }, [courseId])

  useEffect(() => {
    if (response?.data?.courseDetails?.ratingAndReviews) {
      const avg = GetAvgRating(response.data.courseDetails.ratingAndReviews)
      setAvgReviewCount(avg)
    }
  }, [response])

  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec?.subSection?.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  const handleActive = (id) => {
    setIsActive(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const handleBuyCourse = () => {
    if (!token) {
      return setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to Purchase Course.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
    }
    buyCourse(token, [courseId], user, navigate, dispatch)
  }

  const handleAddToCart = () => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      return toast.error("Instructors can't buy courses.")
    }
    if (!token) {
      return setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to add To Cart",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
    }
    dispatch(addToCart(response?.data?.courseDetails))
  }

  // Loading
  if (loading || paymentLoading || !response) return <Loading />

  // Destructure course data
  const {
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag
  } = response.data.courseDetails

  return (
    <>
      {/* Top section */}
      <div className="bg-richblack-800 relative w-full">
        <div className="mx-auto px-4 lg:w-[1260px] min-h-[450px] flex flex-col justify-center py-10">
          <GiReturnArrow className="w-8 h-8 cursor-pointer text-yellow-100 mb-4" onClick={() => navigate(-1)} />

          {/* Mobile Thumbnail */}
          <div className="relative block lg:hidden">
            <Img src={thumbnail} className="rounded-xl" />
          </div>

          <div className="text-richblack-5 text-lg">
            <h1 className="text-4xl font-bold">{courseName}</h1>
            <p>{courseDescription}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-25">{avgReviewCount}</span>
              <RatingStars Review_Count={avgReviewCount} Star_Size={20} />
              <span>{ratingAndReviews.length} reviews</span>
              <span>{studentsEnrolled.length} students</span>
            </div>
            <p>Created by <strong>{instructor?.firstName} {instructor?.lastName}</strong></p>
            <div className="flex items-center gap-4 text-richblack-300">
              <p><BiInfoCircle /> {formatDate(createdAt)}</p>
              <p><HiOutlineGlobeAlt /> English</p>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="lg:hidden mt-4">
            <p className="text-2xl font-semibold">Rs. {price}</p>
            <button className="yellowButton w-full" onClick={handleBuyCourse}>Buy Now</button>
            <button className="blackButton w-full mt-2" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>

        {/* Floating card for desktop */}
        <div className="hidden lg:block absolute top-10 right-10 w-[400px]">
          <CourseDetailsCard
            course={response.data.courseDetails}
            handleBuyCourse={handleBuyCourse}
            setConfirmationModal={setConfirmationModal}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:w-[1260px] mx-auto">
        <div className="max-w-maxContentTab mx-auto">
          <section className="my-8 border p-6 border-richblack-600">
            <h2 className="text-2xl font-semibold">What you'll learn</h2>
            <ul className="mt-2 list-disc ml-5">
              {whatYouWillLearn?.split("\n")?.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="my-6">
            <h2 className="text-xl font-bold mb-2">Tags</h2>
            <div className="flex gap-2 flex-wrap">
              {tag?.map((t, i) => (
                <span key={i} className="px-2 py-1 bg-yellow-50 rounded-full text-black text-sm">{t}</span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">Course Content</h2>
            <div className="flex justify-between mb-3">
              <span>{courseContent?.length} section(s)</span>
              <span>{totalNoOfLectures} lecture(s)</span>
              <button className="text-yellow-25" onClick={() => setIsActive([])}>Collapse All</button>
            </div>
            <div>
              {courseContent?.map((course, idx) => (
                <CourseAccordionBar key={idx} course={course} isActive={isActive} handleActive={handleActive} />
              ))}
            </div>
          </section>

          <section className="mt-8 mb-16">
            <h2 className="text-2xl font-semibold mb-3">Author</h2>
            <div className="flex items-center gap-4">
              <Img src={instructor?.image} className="w-14 h-14 rounded-full" />
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  {instructor?.firstName} {instructor?.lastName}
                  <MdOutlineVerified className="text-[#00BFFF] w-5 h-5" />
                </h3>
                <p className="text-richblack-300">{instructor?.additionalDetails?.about}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails
