import express from 'express'
import { userRoute } from './routes/user.route.js'

const app = express()

// user route
app.use("/user",userRoute)


app.listen(3000,()=>{
    console.log("sever listen on 3000");
})

