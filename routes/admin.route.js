import express from 'express'
import { allChats, allMessages, allUsers, getDashBoard } from '../controller/admin.controller.js'

const app = express.Router()

// all users
app.get("/users",allUsers)

// all chats
app.get("/chats",allChats)

// all messages
app.get("/messages",allMessages)

// dashboard
app.get("/dashboard",getDashBoard)
export const adminRoute = app