const express = require("express")
const router = express.Router();
const {body} = require("express-validator")  //check method
const User = require("../model/user")

const authController = require("../controllers/auth")

//render register page
router.get("/register",authController.getRegisterPage);
//handle register
//async validation 
router.post("/register",
    body("email")
    .isEmail()         //check email format is correct
    .withMessage("Please enter a valid email address!")   //alert message or alert(errors.array()[0].msg) in controller
    .custom((value, {req}) => { //value == email
       return User.findOne({email: value})   
        .then(user =>{if(user){
            return Promise.reject("Email is already exit! Please choose another one.")
        }
    })}),
    body("password")
    .isLength({min: 4})
    .trim()
    .withMessage("Password must have 4 character at least!")
    ,authController.registerAccount);

//render login page
router.get("/login",authController.getLoginPage);
//(handle login)
router.post("/login",
    body("email")
    .isEmail()         //check email format is correct
    .withMessage("Please enter a valid email address!")   //alert message or alert(errors.array()[0].msg) in controller
    ,
    body("password")
    .isLength({min: 4})
    .trim()
    .withMessage("Password must valid!"),
    authController.postLoginData);

//handle logout
router.post("/logout",authController.logout);

//render reset password page
router.get("/reset-password",authController.getResetpage)
//sent reset password link
router.post("/reset",
    body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!"),
    authController.resetLinksend)

//render feedback page
router.get("/feedback",authController.getFeedbackPage)

//render changed password page
router.get("/reset-password/:token",authController.getNewpasswordPage)

//handle change new password
router.post("/change-new-password", 
    body("password")
    .isLength({min: 4})
    .trim()
    .withMessage("Password must have 4 character at least!"),
    body("confirm_password")
    .trim()
    .custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Password must be the same!!")
        }
        return true;
    }),
    authController.changeNewpassword)





module.exports = router;
