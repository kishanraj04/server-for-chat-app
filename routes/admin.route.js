import express from 'express'
import { allChats, allMessages, allUsers } from '../controller/admin.controller.js'

const app = express.Router()

// all users
app.get("/users",allUsers)

// all chats
app.get("/chats",allChats)

// all messages
app.get("/messages",allMessages)
export const adminRoute = app