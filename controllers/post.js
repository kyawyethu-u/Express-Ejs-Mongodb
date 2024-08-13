const post = require("../model/post");
const Post = require("../model/post")

//render create page
exports.renderCreatePage = (req,res)=>{
  
    // res.sendFile(path.join(__dirname,"..","views","addpost.html"))
    res.render("addpost",{title: "Post create"})//"addpost", value is must

};

//handle create post
exports.createPost =(req,res)=>{
    const {title,description,photo} = req.body;
       Post.create({title,description,img_url : photo, userId : req.user})
       .then(result => {
        res.redirect("/");
 }).catch(err => console.log(err))
};

//render home page
exports.renderHomePage = (req,res)=>{
    console.log(req.session.userInfo)
    console.log(req.session.isLogin)
    Post.find()
    .select("title")
    .populate("userId","email")
    .then((posts)=>{
    res.render("home",{
        title: "homepage" ,
        postsArr: posts,
        currentUserEmail : req.session.userInfo.email ?
        req.session.userInfo.email: " ",
        })
})
    .catch(err => console.log(err))
    
}


exports.getPost = (req,res)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then((post)=>
        res.render("details", {title: post.title ,post,currentLoginUserId: req.session.userInfo.email ?
            req.session.userInfo._id: " ",}))
    .catch(err => console.log(err))
    
}

exports.getEditPost = (req,res) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then((post)=>{
        if(!post){
            return res.redirect("/")
        }
        res.render("editPost", {title: post.title, post})
    })
    .catch(err => console.log(err))
}

exports.updatePost = (req,res) => {
    const {postId,title,description,photo} = req.body;
    Post.findById(postId)
    .then((post) => {// .toString is used cause of (!==, obj id to string)
        if(post.userId.toString() !== req.user._id.toString()){ 
            return res.redirect ("/")
        }
        post.title = title;
        post.description = description;
        post.img_url = photo;
        return post.save()
          .then((result => {
            console.log(result);
            res.redirect("/");
        }))
    })
   
    .catch(err => console.log(err))

}

exports.deletePost = (req,res) => {
    const {postId} = req.params;
   
    Post.deleteOne({_id: postId, userId : req.user._id})
    .then(result => {
        console.log("Post deleted!!!");
        res.redirect("/");
    })
    .catch(err => console.log(err));
}