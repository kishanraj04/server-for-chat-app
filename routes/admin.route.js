import express from 'express'
import { allChats, allUsers } from '../controller/admin.controller.js'

const app = express.Router()

// all users
app.get("/users",allUsers)

// all chats
app.get("/chats",allChats)


export const adminRoute = app