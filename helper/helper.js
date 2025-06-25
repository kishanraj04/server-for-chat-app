import {usersocketIds} from '../app.js'
export const getAllSockets = (members=[])=>{
   return members?.map((user)=>usersocketIds.get(user?.toString()))
}