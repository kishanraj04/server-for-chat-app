import express from 'express'

const app = express.Router()


app.get('/',(req,res)=>{
    res.status(200).json("hii bro what app")
})


export const userRoute = app