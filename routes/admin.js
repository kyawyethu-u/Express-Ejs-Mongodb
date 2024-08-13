const express = require("express")

const router = express.Router()
const postController = require("../controllers/post")//import
// const {isLogin} = require("../middleware/is-login")//middle work left to right

//render create page
router.get("/create-post",postController.renderCreatePage);  
//handle createpost
router.post("/",postController.createPost)

//render update page
router.get("/edit/:postId",postController.getEditPost)
//handle update
router.post("/edit-post",postController.updatePost)

//handle delete 
router.post("/delete/:postId",postController.deletePost)

module.exports =  router;

