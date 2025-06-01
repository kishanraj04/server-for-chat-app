// // other user
export const otherUser = (members,userId)=>{
    return members?.find((id)=>id.toString()!==userId?.toString())
}