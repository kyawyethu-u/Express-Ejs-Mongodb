const  {formatISO9075}  = require("date-fns");
const Post = require("../model/post")
const User = require("../model/user")

const POST_PAR_PAGE = 6;
const {validationResult} = require("express-validator");
const user = require("../model/user");
const stripe = require("stripe")("sk_test_51PyViqRvTBdt3nYpCj6MUY1RjmD67RgKfoTEn9eaS7fF1wTUcW68LC3vdoNJi7gpmhezncrG2ga0CWlM87OPxiwm00hVBtJQl5")

exports.getProfile = (req,res,next) =>{
    const pageNumber = +req.query.page || 1;
 
    let totalPostNumber;
    Post.find({userId : req.user._id})
    .countDocuments()
    .then(totalPostCount => {
        totalPostNumber = totalPostCount;
     return Post.find({userId : req.user._id})
    .populate("userId","email isPremium username")//userId is document refered
    .skip((pageNumber-1) * POST_PAR_PAGE)
    .limit(POST_PAR_PAGE)
    .sort({createdAt: -1})
    })
    .then((posts)=>{
        if(posts.length > 0){
          return  res.render("user/profile",{
                title: req.session.userInfo.username ,
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
//without login
exports.getPublicProfile = (req,res,next) =>{
    const {id} = req.params;
    const pageNumber = +req.query.page || 1;
 
    let totalPostNumber;
    Post.find({userId : id})
    .countDocuments()
    .then(totalPostCount => {
        totalPostNumber = totalPostCount;
     return Post.find({userId : id})
    .populate("userId","email isPremium username")//userId is document refered
    .skip((pageNumber-1) * POST_PAR_PAGE)
    .limit(POST_PAR_PAGE)
    .sort({createdAt: -1})
    })
    .then((posts)=>{
        if(posts.length > 0){
          return  res.render("user/public-profile",{
                title: posts[0].userId.email ,
                postsArr: posts,
                currentUserEmail : posts[0].userId.email,
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

//render set username page
exports.renderUsernamepage = (req,res) => {
    let message = req.flash("error");
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render("user/username",{title: "Set username",
         errorMsg :message,
         oldFormData : {username : ""}
    })
}
//handle set username 
exports.setUsername =(req,res,next) =>{
    const {username} = req.body;
    const Updateusername = username.replace("@","");
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
     return res.status(422)
     .render("user/username",
         {title: "Reset Password", 
         errorMsg :errors.array()[0].msg,
         oldFormData : { username }})
 }
    User.findById(req.user._id)
    .then((user)=>{
            user.username = `@${Updateusername}`;
           return user.save()
           .then((result => {
            console.log("Username added!");
            res.redirect("/admin/profile");
        }))
    }).catch((err) =>{
        console.log(err);
        const error = new Error("User not found with this ID");
        return next(error);
       }
        
    )
}
//render stripe premium page
exports.renderPremiumpage = (req,res,next) =>{
    stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        line_items: [
            {
                price: "price_1PytCCRvTBdt3nYpYBYsXE6Z",
                quantity: 1,
            }
        ],mode: "subscription",
        success_url: `${req.protocol}://${req.get("host")}/admin/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/admin/subscription-cancel`
    }).then((stripe_session)=>{
        res.render("user/premium",{
            title: "Buy premium",
            session_id: stripe_session.id})
    })
    .catch((err) =>{
        console.log(err);
        const error = new Error("Something went wrong");
        return next(error);
       })
}
//render 
exports.getSuccessPage = (req,res) => {
    const session_id = req.query.session._id;
    if(!sesssion_id){
        return res.redirect("/admin/profile")
    }
    User.findById(req.user._id)
    .then(user=>{
        user.isPremium = true;
        user.payment_session_key = session_id;
        return user.save();
    })
    .then(results=>{
        res.render("user/subscription-success",{title: "Success",subscription_id: session_id})
    })
    .catch((err) =>{
        console.log(err);
        const error = new Error("Something went wrong");
        return next(error);
       })
}