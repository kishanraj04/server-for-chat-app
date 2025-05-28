import { Chat } from "../models/chat.model.js"

// group chat
export const groupChat = async(req,res,next)=>{
    try {
        const {name,members} = req?.body
        const you = req?.user
        if(members?.length<2){
            const err = new Error()
            err.message="members should greter than 2"
            err.status=400
            return next(err)
        }

        const allmembers = [...members,you?._id]
        
        const createdGroup = await Chat.create({
            user:you?.name,
            groupChat:true,
            members:allmembers,
            creator:you?._id
        })

        res.status(200).json({success:true,message:"group created",createdGroup})
    } catch (error) {
        next(error)
    }
}