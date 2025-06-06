import express from 'express'
import { addMember, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, groupChat, leaveFromGroup, remaneGroup, removeMember, sendAttachment } from '../controller/chat.controller.js';
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

// remane group
app.put("/:id",isAuthenticated,remaneGroup)

// delete chat
app.delete("/:id",isAuthenticated,deleteChat)

// get msgs
app.get("/message/:id",isAuthenticated,getMessages)
export const chatRoute = app;