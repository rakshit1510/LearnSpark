import { createSlice } from "@reduxjs/toolkit";

const initialState={
    courseSectionData:[],
    courseEntireData:[],
    completedLecture:[],
    totalNoOfLectures:0,
}

const viewCourseSlice= createSlice({
    name:'viewCourse',
    initialState:initialState,
    reducers:{
        setCourseSectionData(state,action){
            state.courseSectionData=action.payload;
            },
            setCourseEntireData(state,action){
                state.courseEntireData=action.payload;
                },
                setCompletedLecture(state,action){
                    state.completedLecture=action.payload;
                    },
                    setTotalNoOfLectures(state,action){
                        state.totalNoOfLectures=action.payload;
                        },
                        updateCompletedLectures(state,action){
                            state.completedLecture=[...state.completedLecture,action.payload];
                        }
                        }
                        })
export const {setCourseSectionData, 
                setCourseEntireData,
                 setCompletedLecture,
                  setTotalNoOfLectures,
                  updateCompletedLectures}
    =viewCourseSlice.actions;
const viewCourseReducer=viewCourseSlice.reducer;
export default viewCourseReducer;