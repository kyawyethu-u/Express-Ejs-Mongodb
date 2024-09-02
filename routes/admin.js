const express = require("express")
const {body} = require("express-validator")

const router = express.Router()
const postController = require("../controllers/post")



//render create page
router.get("/create-post",postController.renderCreatePage);  
//handle createpost
router.post("/",[
    body("title").isLength({min: 10,max: 40}).withMessage("Title must have 10 lettesr!"),
    body("photo").isURL().withMessage("Image must be valid URL!"),
    body("description").isLength({min: 30}).withMessage("Description must have 30 letter at least!")]
    ,postController.createPost)

//render update page
router.get("/edit/:postId",postController.getEditPost)
//handle update
router.post("/edit-post",
   [body("title").isLength({min: 10,max: 40}).withMessage("Title must have 10 lettesr!"),
    body("photo").isURL().withMessage("Image must be valid URL!"),
    body("description").isLength({min: 30}).withMessage("Description must have 30 letter at least!")]
    ,postController.updatePost)

//handle delete 
router.post("/delete/:postId",postController.deletePost)

module.exports =  router;

