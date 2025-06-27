import {combineReducers} from "@reduxjs/toolkit"
import authReducer from "../slices/authSlice.js"
import profileReducer from "../slices/profileSlice.js";
import viewCourseReducer from "../slices/viewCourseSlice.js";
import sidebarReducer from "../slices/sidebarSlice.js";
import courseReducer from "../slices/courseSlice.js";
import cartSliceReducer from "../slices/cartSlice.js";



const rootReducer = combineReducers({
    auth:authReducer,
    profile:profileReducer,
    viewCourse:viewCourseReducer,
    sidebar:sidebarReducer,
    course:courseReducer,
    cart:cartSliceReducer,

})

export default rootReducer;