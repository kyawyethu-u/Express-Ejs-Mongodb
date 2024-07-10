const posts =[]; //supposed model
const Post = require("../model/post")


exports.createPost =(req,res)=>{
    const {title,description,photo} = req.body;//destructure form's name's key
    const post = new Post( title,description,photo);

    post
    .create()
    .then((result)=>{
        console.log(result)
         res.redirect('/')
        })
    .catch(err => console.log(err));
};

exports.renderCreatePage = (req,res)=>{
    // res.sendFile(path.join(__dirname,"..","views","addpost.html"))
    res.render("addpost",{title: "Post create"})//"addpost", value is must
};

exports.renderHomePage = (req,res)=>{
    Post.getPosts()
    .then((posts)=>
        res.render("home",{title: "homepage" ,postsArr: posts}))
    .catch(err => console.log(err))
    
}


exports.getPost = (req,res)=>{
    const postId = req.params.postId;
    Post.getPost(postId)
    .then((post)=>
        res.render("details", {title: post.title ,post}))
    .catch(err => console.log(err))
    
}

exports.getEditPost = (req,res) => {
    const postId = req.params.postId;
    Post.getPost(postId)
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
    const post = new Post(title,description,photo,postId);

    post.create()
    .then(result => {
        console.log(result);
        res.redirect("/");
    })
    .catch(err => console.log(err));
}

exports.deletePost = (req,res) => {
    const {postId} = req.params;
   
    Post.deleteByID(postId)
    .then(result => {
        console.log("Post deleted!!!");
        res.redirect("/");
    })
    .catch(err => console.log(err));

}