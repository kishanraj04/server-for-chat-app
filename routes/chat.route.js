import express from 'express'
import { groupChat } from '../controller/chat.controller.js';
import { isAuthenticated } from '../auth/auth.js';

const app = express.Router()

app.post('/group-chat',isAuthenticated,groupChat)

export const chatRoute = app;