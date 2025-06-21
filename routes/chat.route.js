import express from 'express'
import { addMember, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, groupChat, leaveFromGroup, remaneGroup, removeMember, sendAttachment } from '../controller/chat.controller.js';
import { isAuthenticated } from '../auth/auth.js';
import { attachment } from '../middleware/upload.js';
import { addMemberValidator, deleteChatValidator, getMessagesValidator, groupChatValidator, leaveGroupValidator, removeMemberValidator, sendAttachmentValidator, validateHandler } from '../lib/validator.js';

const app = express.Router()

// group chats
app.post('/group-chat',isAuthenticated,groupChatValidator(),validateHandler,groupChat)

// get my chats
app.get('/my-chats',isAuthenticated,getMyChats)

// get my groups
app.get("/my-groups",isAuthenticated,getMyGroups)

// add memebers
app.put("/add-members",isAuthenticated,addMemberValidator(),validateHandler,addMember)

// remove member
app.delete('/remove/member',isAuthenticated,removeMemberValidator(),validateHandler,removeMember)

// leave from group
app.put('/leave/group/:gid',isAuthenticated,leaveGroupValidator(),validateHandler,leaveFromGroup)

// attachment and message
app.post('/message',attachment,isAuthenticated, sendAttachmentValidator(),validateHandler,sendAttachment)

// get chat details
app.get("/:id",isAuthenticated,getChatDetails)

// remane group
app.put("/:id",isAuthenticated,remaneGroup)

// delete chat
app.delete("/:id",isAuthenticated,deleteChatValidator(),validateHandler,deleteChat)

// get msgs
app.get("/message/:chatId",isAuthenticated,getMessagesValidator(),validateHandler,getMessages)


export const chatRoute = app;