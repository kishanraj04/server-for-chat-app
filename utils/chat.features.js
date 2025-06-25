import { sockets, usersocketIds } from "../app.js";
import { getAllSockets } from "../helper/helper.js";

// emit the event
export const emitEvent = (req,evnet,user,data)=>{
    
    console.log("user soc ",sockets,user,usersocketIds);
}


// delete att..
export const deleteAttachments = (public_id)=>{

}