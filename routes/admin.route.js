import express from 'express'
import { allUsers } from '../controller/admin.controller.js'

const app = express.Router()

// all users
app.get("/users",allUsers)



export const adminRoute = app