const express = require("express")
const router = express.Router();
const {check} = require("express-validator")  //check method
const User = require("../model/user")

const authController = require("../controllers/auth")

//render register page
router.get("/register",authController.getRegisterPage);
//handle register
//async validation 
router.post("/register",
    check("email")
    .isEmail()         //check email format is correct
    .withMessage("Please enter a valid email address!")   //alert message or alert(errors.array()[0].msg) in controller
    .custom((value, {req}) => { //value == email
       return User.findOne({email: value})   
        .then(user =>{if(user){
            return Promise.reject("Email is already exit! Please choose another one.")
        }
    })})
    ,authController.registerAccount);

//render login page
router.get("/login",authController.getLoginPage);
//(handle login)
router.post("/login",authController.postLoginData);

//handle logout
router.post("/logout",authController.logout);

//render reset password page
router.get("/reset-password",authController.getResetpage)
//sent reset password link
router.post("/reset",authController.resetLinksend)

//render feedback page
router.get("/feedback",authController.getFeedbackPage)

//render changed password page
router.get("/reset-password/:token",authController.getNewpasswordPage)

//handle change new password
router.post("/change-new-password",authController.changeNewpassword)





module.exports = router;
