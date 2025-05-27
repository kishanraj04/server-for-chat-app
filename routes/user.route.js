import express from 'express'
import { registerUser } from '../controller/user.controller.js'

const app = express.Router()

// parsing the body
app.use(express.json())

app.post('/register',registerUser)


export const userRoute = app