import {body,validationResult,check} from "express-validator"

export const registerValidator = () => [
  body("name", " enter name").notEmpty(),
  body("password", " enter password").notEmpty(),
  body("bio", " enter bio").notEmpty()
];

export const loginValidator = () =>[
    body("name","provide name").notEmpty(),
    body("password","provide password").notEmpty()
]

export const groupChatValidator = ()=>[
    body("groupname","provide groupname").notEmpty(),
    body("members").notEmpty().withMessage("provide members").isArray({min: 2,max:150}).withMessage("members must be 2-150")
]

export const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errmsg = []
  errors?.array()?.map((err)=>errmsg.push(err?.msg))
  const errstr = errmsg.join(", ")
  if (!errors.isEmpty()) {
    const err = new Error()
    err.status = 400; 
    err.message = errstr
    return next(err);
  }

  next(); 
};
