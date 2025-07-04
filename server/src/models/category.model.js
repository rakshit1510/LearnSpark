import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
        name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
}, {
    timestamps: true
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
