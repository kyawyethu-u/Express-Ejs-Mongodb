const express = require("express")
const {body} = require("express-validator")

const router = express.Router()
const postController = require("../controllers/post")
const userController = require("../controllers/user")



//render create page
router.get("/create-post",postController.renderCreatePage);  
//handle createpost
router.post("/",[
    body("title").isLength({min: 10,max: 40}).withMessage("Title must have 10 lettesr!"),
  
    body("description").isLength({min: 30}).withMessage("Description must have 30 letter at least!")]
    ,postController.createPost)

//render update page
router.get("/edit/:postId",postController.getEditPost)
//handle update
router.post("/edit-post",
   [body("title").isLength({min: 10,max: 40}).withMessage("Title must have 10 lettesr!"),
    
    body("description").isLength({min: 30}).withMessage("Description must have 30 letter at least!")]
    ,postController.updatePost)

//handle delete 
router.post("/delete/:postId",postController.deletePost);

// render profile
router.get("/profile",userController.getProfile);

//render username.ejs
router.get("/username",userController.renderUsernamepage);
//handle username
router.post("/setusername",
     body("username").isLength({min: 4}).withMessage("Username must have 4 letters")
    ,userController.setUsername);

//render premium.ejs
router.get("/premium",userController.renderPremiumpage)   
//render subscription-success
router.get("/subscription-success",userController.getSuccessPage)

module.exports =  router;

