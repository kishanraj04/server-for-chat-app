import { Chat } from "../models/chat.model.js"
import { User } from "../models/user.model.js"

// all user
export const allUsers = async(req,res,next)=>{
    try {
        const users = await User.find({})
        const modifydata = await Promise.all(users?.map(async({_id,avatar,name})=>{
            const [group,friends] = await Promise.all([Chat.countDocuments({groupchat:true,members:_id}),Chat.countDocuments({groupchat:false,members:_id})])
            
            return {
                _id,avatar:avatar?.url,name,group,friends
            }
        }))

        return res.status(200).json({success:true,modifydata})
    } catch (error) {
        
    }
}
