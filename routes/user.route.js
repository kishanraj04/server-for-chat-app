import express from 'express'
import { acceptrequest,  allRequest,  getMyFriends,  getMyNotifications, getMyProfile, getTotalNotification, registerUser, removeRequest, searchUser, sendRequest } from '../controller/user.controller.js'
import { isLogin } from '../auth/login.js'
import { directLogin } from '../auth/directlogin.js'
import { isAuthenticated, logoutUser } from '../auth/auth.js'
import { loginValidator, registerValidator, validateHandler } from '../lib/validator.js'

const app = express.Router()

// parsing the body
app.use(express.json())

// register route
app.post('/register',registerValidator(),validateHandler,registerUser)

// login route
app.post('/login',loginValidator(),validateHandler,isLogin)

// direct login
app.get('/direct-login',directLogin)

//get my profile
app.get('/profile',isAuthenticated,getMyProfile)

// logout
app.get('/logout',logoutUser)

// search user
app.get('/search/user',isAuthenticated,searchUser)

// send request
app.put("/sendrequest",isAuthenticated,sendRequest)

// accept request
app.put("/acceptrequest",isAuthenticated,acceptrequest)

// notifications
app.get("/notifications",isAuthenticated,getMyNotifications)

// my firends
app.get("/myfriends",isAuthenticated,getMyFriends)

// get all resquest
app.get("/all-request",isAuthenticated,allRequest)

// remove request
app.delete("/remove/request",isAuthenticated,removeRequest)

// get total notification
app.get("/notificatio",isAuthenticated,getTotalNotification)

export const userRoute = app