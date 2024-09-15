const express = require("express");
const path = require("path");

const router = express.Router(); 
const {posts} = require("./admin");

const postController = require("../controllers/post");//import
const userController = require("../controllers/user");

router.get("/",postController.renderHomePage);

router.get("/post/:postId",postController.getPost);//postId is key

router.get("/save/:id",postController.savePostAsPDF);

router.get("/profile/:id",userController.getPublicProfile);





module.exports = router;