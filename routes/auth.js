const express = require("express")
const router = express.Router();

const authController = require("../controllers/auth")

//render register page
router.get("/register",authController.getRegisterPage);
//handle register
router.post("/register",authController.registerAccount);

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
