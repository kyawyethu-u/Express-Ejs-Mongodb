// const post = require("../model/post");
const Post = require("../model/post")
const {validationResult} = require("express-validator");
const  {formatISO9075}  = require("date-fns");
const fileDelete = require("../utils/fileDelete");

const pdf = require("pdf-creator-node");
const fs = require("fs");
const expath = require("path");
const { Console } = require("console");

const POST_PAR_PAGE = 6;

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
    const {title,description} = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if(image === undefined){
        return res.status(422)
        .render("addpost",{
            title: "Post create",
            errorMsg :"Image extension must be jpg,jpeg and png",
            oldFormData: {title,description}})
    }
    
    if(!errors.isEmpty()){
        return res.status(422)
        .render("addpost",{
            title: "Post create",
            errorMsg :errors.array()[0].msg,
            oldFormData: {title,description}})
    }
            //store in db
       Post.create({title, description, img_url : image.path, userId : req.user})
       .then(result => {
        res.redirect("/");
 }).catch(err => {
    console.log(err);
    const error = new Error("Something went wrong!");
        return next(error)
 })
};

//render home page 
//be careful (+req.query.page || 1)
exports.renderHomePage = (req,res,next)=>{
    const pageNumber = +req.query.page || 1;
 
    let totalPostNumber;
    Post.find().countDocuments()
    .then(totalPostCount => {
        totalPostNumber = totalPostCount;
        
     return Post.find()
    .select("title description img_url")
    .populate("userId","email")//userId is document refered
    .skip((pageNumber-1) * POST_PAR_PAGE)
    .limit(POST_PAR_PAGE)
    .sort({createdAt: -1})
    })
    .then((posts)=>{
        if(posts.length > 0){
          return  res.render("home",{
                title: "homepage" ,
                postsArr: posts,
                currentUserEmail : req.session.userInfo && req.session.userInfo.email ?
                req.session.userInfo.email: " ",
                currentPage : pageNumber,
                hasNextPage: POST_PAR_PAGE * pageNumber < totalPostNumber,
                hasPreviousPage: pageNumber > 1,
                nextPage: pageNumber + 1,
                previousPage: pageNumber - 1,
                })

        }else{
           return res.status(500).render("error/500", {
                title :"Something went wrong!",
                message: "No posts in this page"});
        }
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
            oldFormData: {title:undefined,
                description:undefined},
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
    const {postId,title,description} = req.body;
    const image = req.file;
    const errors = validationResult(req);

    // if(image === undefined){
    //     return res.status(422)
    //     .render("editPost",{
    //         postId,
    //         title,
    //         isValidationFail: true,
    //         errorMsg :"Image extension must be jpg,jpeg and png",
    //         oldFormData: {title,description}})
    // }
   
    if(!errors.isEmpty()){
        return res.status(422)
        .render("editPost",{
            postId,
            title,
            errorMsg :errors.array()[0].msg,
            oldFormData: {title,description},
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
       if(image){
        fileDelete(post.img_url)      
        post.img_url = image.path;
       }
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
   Post.findById(postId)
   .then((post)=>{
        if(!post){
            return res.redirect("/")
        }
        fileDelete(post.img_url); //delete local storage
 return   Post.deleteOne({_id: postId, userId : req.user._id})})
   .then(result => {             //deleting database post's info
            console.log("Post deleted!!!");
            res.redirect("/");
        })
   .catch(err => {
    console.log(err);
    const error = new Error("Something went wrong!");
     return next(error)})
}

exports.savePostAsPDF = (req,res,next) =>{
 const {id} = req.params
 console.log(typeof(id))
 const templateUrl = `${expath.join(__dirname,"../views/template/template.html")}`
   const html = fs.readFileSync(templateUrl,"utf8");//read template.html/utf8
   const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "20mm",
        contents: '<div style="text-align: center;">PDF DOWNLOAD FROM BLOG.IO</div>'
    },
    footer: {
        height: "15mm",
            contents: '<span style="color: #444; text-align: center;">Energy</span>', // fallback value
        }
    }

    Post.findById(id)
    .populate("userId", "email")
    .lean()
    .then((post)=>{
        console.log(post)
        const date = new Date();
        const pdfSaveURL = `${expath.join(__dirname,"../public/pdf",date.getTime() + ".pdf")}`
        //public/pdf/12345123.pdf
        const document = {
           html,
           data: {
               post
           },
           path: pdfSaveURL,
           type: ""
        }
   pdf.create(document, options)
     .then((result) => {
        console.log(result);
        res.download(pdfSaveURL,(err)=>{
            if(err) throw (err)
                fileDelete(pdfSaveURL);
        });
      })
      .catch((error) => {
        console.error(error);
      });

    })
    .catch(err => {
    console.log(err);
    const error = new Error("Something went wrong!");
     return next(error)})
     

}