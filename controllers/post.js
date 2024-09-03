const post = require("../model/post");
const Post = require("../model/post")
const {validationResult} = require("express-validator");
const  {formatISO9075}  = require("date-fns");

//render create page
exports.renderCreatePage = (req,res,next)=>{
    // res.sendFile(path.join(__dirname,"..","views","addpost.html"))
    res.render("addpost",{title: "Post create",
        oldFormData: {title:"",description:"",photo:""},
        errorMsg : "",
    })//"addpost", value is must
};
//handle create post
exports.createPost =(req,res,next)=>{
    const {title,description,photo} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422)
        .render("addpost",{
            title: "Post create",
            errorMsg :errors.array()[0].msg,
            oldFormData: {title,description,photo}})
    }

       Post.create({title,description,img_url : photo, userId : req.user})
       .then(result => {
        res.redirect("/");
 }).catch(err => {
    console.log(err);
    const error = new Error("Something went wrong!");
        return next(error)
 })
};

//render home page
exports.renderHomePage = (req,res,next)=>{
    console.log(req.session.userInfo)
    console.log(req.session.isLogin)
    Post.find()
    .select("title description")
    .populate("userId","email")//userId is document refered
    .then((posts)=>{
    res.render("home",{
        title: "homepage" ,
        postsArr: posts,
        currentUserEmail : req.session.userInfo && req.session.userInfo.email ?
        req.session.userInfo.email: " ",
        })
})
    .catch(err => {console.log(err);
        const error = new Error("Something went wrong!");
        return next(error)
    }) 
}


exports.getPost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .populate("userId", "email")
    .then((post)=>
        res.render("details", {
            title: post.title ,
            post,
            date: post.createdAt ? formatISO9075(post.createdAt,{ representation: 'date' }) : undefined,
            currentLoginUserId: req.session.userInfo ?
            req.session.userInfo._id: " ",}))
    .catch((err) =>{
         console.log(err);
         const error = new Error("Post did not find with this ID");
         return next(error);
        })
}

//render update post
exports.getEditPost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then((post)=>{
        if(!post){
            return res.redirect("/")
        }
        res.render("editPost", {
            postId: undefined,
            title: post.title,
            post,
            oldFormData: {title:undefined,description:undefined,photo:undefined},
            errorMsg : "",
            isValidationFail: false,})
    })
    .catch(err => {
        console.log(err)
        const error = new Error("Something went wrong!");
         return next(error)}
    )
}
//handle update post
exports.updatePost = (req,res,next) => {
    const {postId,title,description,photo} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422)
        .render("editPost",{
            postId,
            title,
            errorMsg :errors.array()[0].msg,
            oldFormData: {title,description,photo},
            isValidationFail: true,
            })
    }

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
    .catch(err =>{
        console.log(err);
         const error = new Error("Something went wrong");
        return next(error)})
}

//handle delete post
exports.deletePost = (req,res,next) => {
    const {postId} = req.params;
   
    Post.deleteOne({_id: postId, userId : req.user._id})
    .then(result => {
        console.log("Post deleted!!!");
        res.redirect("/");
    })
    .catch(err => {
        console.log(err);
        const error = new Error("Something went wrong!");
         return next(error)
    });
}