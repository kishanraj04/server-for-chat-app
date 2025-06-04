import express from 'express'
import { addMember, getChatDetails, getMyChats, getMyGroups, groupChat, leaveFromGroup, removeMember, sendAttachment } from '../controller/chat.controller.js';
import { isAuthenticated } from '../auth/auth.js';
import { attachment } from '../middleware/upload.js';

const app = express.Router()

// group chats
app.post('/group-chat',isAuthenticated,groupChat)

// get my chats
app.get('/my-chats',isAuthenticated,getMyChats)

// get my groups
app.get("/my-groups",isAuthenticated,getMyGroups)

// add memebers
app.put("/add-members",isAuthenticated,addMember)

// remove member
app.delete('/remove/member',isAuthenticated,removeMember)

// leave from group
app.put('/leave/group/:gid',isAuthenticated,leaveFromGroup)

// attachment and message
app.post('/message',attachment,isAuthenticated,sendAttachment)

// get chat details
app.get("/:id",isAuthenticated,getChatDetails)

export const chatRoute = app;