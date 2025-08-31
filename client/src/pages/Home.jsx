import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"

import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import TimelineSection from '../components/core/HomePage/TimelineSection'
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ExploreMore from '../components/core/HomePage/ExploreMore'
import ReviewSlider from '../components/common/ReviewSlider'
import Course_Slider from '../components/core/Catalog/Course_Slider'

import { MdOutlineRateReview } from 'react-icons/md'
import { FaArrowRight } from "react-icons/fa"

import { motion } from 'framer-motion'
import { fadeIn } from './../components/common/motionFrameVarients';

// background random images
import backgroundImg1 from '../assets/Images/random bg img/coding bg1.jpg'
import backgroundImg2 from '../assets/Images/random bg img/coding bg2.jpg'
import backgroundImg3 from '../assets/Images/random bg img/coding bg3.jpg'
import backgroundImg4 from '../assets/Images/random bg img/coding bg4.jpg'
import backgroundImg5 from '../assets/Images/random bg img/coding bg5.jpg'
import backgroundImg6 from '../assets/Images/random bg img/coding bg6.jpeg'
import backgroundImg7 from '../assets/Images/random bg img/coding bg7.jpg'
import backgroundImg8 from '../assets/Images/random bg img/coding bg8.jpeg'
import backgroundImg9 from '../assets/Images/random bg img/coding bg9.jpg'
import backgroundImg10 from '../assets/Images/random bg img/coding bg10.jpg'
import backgroundImg11 from '../assets/Images/random bg img/coding bg11.jpg'

const randomImges = [
  backgroundImg1,
  backgroundImg2,
  backgroundImg3,
  backgroundImg4,
  backgroundImg5,
  backgroundImg6,
  backgroundImg7,
  backgroundImg8,
  backgroundImg9,
  backgroundImg10,
  backgroundImg11,
];

// ✅ dummy courses for frontend (instead of backend)
const dummyCourses1 = [
  { title: "React Basics", price: 499 },
  { title: "Advanced Node.js", price: 799 },
  { title: "JavaScript Mastery", price: 699 },
];

const dummyCourses2 = [
  { title: "Python for Data Science", price: 599 },
  { title: "Machine Learning Bootcamp", price: 999 },
  { title: "AI Fundamentals", price: 899 },
];

const Home = () => {
  // random background
  const [backgroundImg, setBackgroundImg] = useState(null);

  useEffect(() => {
    const bg = randomImges[Math.floor(Math.random() * randomImges.length)];
    setBackgroundImg(bg);
  }, []);

  return (
    <React.Fragment>
      {/* background random image */}
      <div>
        <div className="w-full h-[450px] md:h-[650px] absolute top-0 left-0 opacity-[0.3] overflow-hidden object-cover ">
          <img
            src={backgroundImg}
            alt="Background"
            className="w-full h-full object-cover "
          />
          <div className="absolute left-0 bottom-0 w-full h-[250px] opacity_layer_bg "></div>
        </div>
      </div>

      <div>
        {/* Section 1 */}
        <div className="relative h-[450px] md:h-[550px] justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white ">
          <Link to={"/signup"}>
            <div
              className="z-0 group p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
                              transition-all duration-200 hover:scale-95 w-fit"
            >
              <div
                className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                transition-all duration-200 group-hover:bg-richblack-900"
              >
                <p>Become an Instructor</p>
                <FaArrowRight />
              </div>
            </div>
          </Link>

          <motion.div
            variants={fadeIn("left", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className="text-center text-3xl lg:text-4xl font-semibold mt-7  "
          >
            Empower Your Future with
            <HighlightText text={"Coding Skills"} />
          </motion.div>

          <motion.div
            variants={fadeIn("right", 0.1)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.1 }}
            className=" mt-4 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-300"
          >
            With our online coding courses, you can learn at your own pace, from
            anywhere in the world, and get access to a wealth of resources,
            including hands-on projects, quizzes, and personalized feedback from
            instructors.
          </motion.div>

          <div className="flex flex-row gap-7 mt-8">
            <CTAButton active={true} linkto={"/signup"}>
              Learn More
            </CTAButton>

            <CTAButton active={false} linkto={"/login"}>
              Book a Demo
            </CTAButton>
          </div>
        </div>

        {/* animated code */}
        <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between">
          {/* Code block 1 */}
          <div>
            <CodeBlocks
              position={"lg:flex-row"}
              heading={
                <div className="text-3xl lg:text-4xl font-semibold">
                  Unlock Your
                  <HighlightText text={"coding potential "} />
                  with our online courses
                </div>
              }
              subheading={
                "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
              }
              ctabtn1={{
                btnText: "try it yourself",
                linkto: "/signup",
                active: true,
              }}
              ctabtn2={{
                btnText: "learn more",
                linkto: "/login",
                active: false,
              }}
              codeblock={`<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><a href="/">Header</a>\n</h1>\n<nav><a href="one/">One</a><a href="two/">Two</a><a href="three/">Three</a>\n</nav>`}
              codeColor={"text-yellow-25"}
              backgroundGradient={"code-block1-grad"}
            />
          </div>

          {/* Code block 2 */}
          <div>
            <CodeBlocks
              position={"lg:flex-row-reverse"}
              heading={
                <div className="w-[100%] text-3xl lg:text-4xl font-semibold lg:w-[50%]">
                  Start
                  <HighlightText text={"coding in seconds"} />
                </div>
              }
              subheading={
                "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
              }
              ctabtn1={{
                btnText: "Continue Lesson",
                link: "/signup",
                active: true,
              }}
              ctabtn2={{
                btnText: "Learn More",
                link: "/signup",
                active: false,
              }}
              codeColor={"text-white"}
              codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
              backgroundGradient={"code-block2-grad"}
            />
          </div>

          {/* course slider (dummy data instead of backend) */}
          <div className="mx-auto box-content w-full max-w-maxContentTab py-12 lg:max-w-maxContent">
            <h2 className="text-white mb-6 text-2xl ">Popular Picks for You 🏆</h2>
            <Course_Slider Courses={dummyCourses1} />
          </div>
          <div className="mx-auto box-content w-full max-w-maxContentTab py-12 lg:max-w-maxContent">
            <h2 className="text-white mb-6 text-2xl ">Top Enrollments Today 🔥</h2>
            <Course_Slider Courses={dummyCourses2} />
          </div>

          <ExploreMore />
        </div>

        {/* Section 2 */}
        <div className="bg-pure-greys-5 text-richblack-700 ">
          <div className="homepage_bg h-[310px]">
            <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto">
              <div className="h-[150px]"></div>
              <div className="flex flex-row gap-7 text-white ">
                <CTAButton active={true} linkto={"/signup"}>
                  <div className="flex items-center gap-3">
                    Explore Full Catalog
                    <FaArrowRight />
                  </div>
                </CTAButton>
                <CTAButton active={false} linkto={"/signup"}>
                  <div>Learn more</div>
                </CTAButton>
              </div>
            </div>
          </div>

          <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
            <div className="flex flex-col lg:flex-row gap-5 mb-10 mt-[95px]">
              <div className="text-3xl lg:text-4xl font-semibold w-full lg:w-[45%]">
                Get the Skills you need for a
                <HighlightText text={"Job that is in demand"} />
              </div>

              <div className="flex flex-col gap-10 w-full lg:w-[40%] items-start">
                <div className="text-[16px]">
                  The modern StudyNotion dictates its own terms. Today, to be a
                  competitive specialist requires more than professional skills.
                </div>
                <CTAButton active={true} linkto={"/signup"}>
                  <div>Learn more</div>
                </CTAButton>
              </div>
            </div>

            {/* leadership */}
            <TimelineSection />

            <LearningLanguageSection />
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-14 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
          <InstructorSection />

          {/* Reviews */}
          <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
            Reviews from other learners <MdOutlineRateReview className="text-yellow-25" />
          </h1>
          <ReviewSlider />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default Home;
