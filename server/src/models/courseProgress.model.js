import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        },
    ],
}, {
    timestamps: true
});

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema)
export default CourseProgress