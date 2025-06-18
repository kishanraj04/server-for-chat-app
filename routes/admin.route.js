import express from 'express'
import { isAuthenticatedAdmin } from '../auth/auth.js'
import { allChats, allMessages, allUsers, getDashBoard, logoutAdmin, verifyAdmin } from '../controller/admin.controller.js'

const app = express.Router()

// verify admin
app.get("/verify",verifyAdmin)

// admin loout
app.delete("/logout/admin",logoutAdmin)

// all users
app.get("/users",isAuthenticatedAdmin,allUsers)

// all chats
app.get("/chats",isAuthenticatedAdmin,allChats)

// all messages
app.get("/messages",isAuthenticatedAdmin,allMessages)

// dashboard
app.get("/dashboard",isAuthenticatedAdmin,getDashBoard)

export const adminRoute = app