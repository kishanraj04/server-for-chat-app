import express from 'express'
import { registerUser } from '../controller/user.controller.js'
import { isAuthenticated } from '../auth/login.js'

const app = express.Router()

// parsing the body
app.use(express.json())

// register route
app.post('/register',registerUser)
// login route
app.post('/login',isAuthenticated)


export const userRoute = app