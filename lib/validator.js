import {body,validationResult,check} from "express-validator"

export const registerValidator = () => [
  body("name", " enter name").notEmpty(),
  body("password", " enter password").notEmpty(),
  body("bio", " enter bio").notEmpty(),
  check("avatar").notEmpty().withMessage("upload avatar")
];

export const loginValidator = () =>[
    body("name","provide name").notEmpty(),
    body("password","provide password").notEmpty()
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
