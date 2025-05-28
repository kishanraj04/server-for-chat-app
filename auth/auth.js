import jwt from 'jsonwebtoken'

// is authenticated
export const isAuthenticated = async(req,res,next)=>{
    const token = req.cookies.token 
    if(!token){
        const err = new Error();
        err.message="unauthorized user"
        err.status=401
        return next(err)
    }     

    const decode = await jwt.verify(token,process.env.JWT_SECRATE)
    req.user=decode
    next()
}