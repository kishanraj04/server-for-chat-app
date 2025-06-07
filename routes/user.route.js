import express from 'express'
import { getMyProfile, registerUser, searchUser } from '../controller/user.controller.js'
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

export const userRoute = app