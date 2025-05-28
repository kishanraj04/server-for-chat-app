import express from 'express'
import { registerUser } from '../controller/user.controller.js'
import { isLogin } from '../auth/login.js'
import { directLogin } from '../auth/directlogin.js'
import { isAuthenticated } from '../auth/auth.js'

const app = express.Router()

// parsing the body
app.use(express.json())

// register route
app.post('/register',registerUser)
// login route
app.post('/login',isLogin)
// direct login
app.get('/direct-login',directLogin)
//get my profile
// app.get('/profile',isAuthenticated,getMyProfile)

export const userRoute = app