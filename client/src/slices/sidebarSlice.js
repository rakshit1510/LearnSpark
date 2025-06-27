import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    openSideMenu: false,
    sceeenSize: undefined,

    courseViewSidebar:false,
}


const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        setOpenSideMenu: (state, action) => {
            // console.log('action.payload == ', action.payload)
            state.openSideMenu = action.payload
        },
        setScreenSize: (state, action) => {
            state.screenSize = action.payload
        },
        setCourseViewSidebar: (state, action) => {
            state.courseViewSidebar = action.payload
        }

    }
})

export const { setOpenSideMenu, setScreenSize, setCourseViewSidebar } = sidebarSlice.actions
const sidebarReducer = sidebarSlice.reducer
export default sidebarReducer;