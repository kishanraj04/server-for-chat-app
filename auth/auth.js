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


// is authenticated
export const isAuthenticatedAdmin = async(req,res,next)=>{
    const token = req.cookies.admintoken
    console.log(token);
    if(!token){
        const err = new Error();
        err.message="unauthorized user"
        err.status=401
        return next(err)
    }     

    const decode = await jwt.verify(token,process.env.ADMINKEY)
    console.log(decode);
    req.user=decode
    next()
}

// logout user
export const logoutUser = async(req,res,next)=>{
    const token = req.cookies.token
    console.log("toke ",token);
    if(!token){
        const err = new Error()
        err.message="user already logout"
        err.statue=200
        return next(err)
    }
    res.status(200).clearCookie("token","").json({success:true,message:"user logout"});
    
}