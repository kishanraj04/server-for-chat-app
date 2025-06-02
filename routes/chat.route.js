import express from 'express'
import { addMember, getMyChats, getMyGroups, groupChat, removeMember } from '../controller/chat.controller.js';
import { isAuthenticated } from '../auth/auth.js';

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

export const chatRoute = app;