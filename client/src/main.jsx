import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import rootReducer from './reducer/index.js'

const store = configureStore({
  reducer: rootReducer,
})
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Provider store={store}>
    <App />
    <Toaster />
  </Provider>
  </BrowserRouter>
)
