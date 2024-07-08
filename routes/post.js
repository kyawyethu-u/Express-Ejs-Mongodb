const express = require("express");
const path = require("path");

const router = express.Router(); 
const {posts} = require("./admin");

const postController = require("../controllers/post");//import


router.get("/",postController.renderHomePage);
router.get("/post/:postId",postController.getPost);//postId is key





module.exports = router;