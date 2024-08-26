const bcrypt = require("bcryptjs");
const User = require("../model/user")
const crypto = require("crypto")

const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

const {validationResult} = require("express-validator");


//created a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SENDER_MAIL,
        pass: process.env.MAIL_PASSWORD
    }
})


    //render register page
exports.getRegisterPage = (req,res) =>{
    let message = req.flash("error");
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render("auth/register",{title: "Register", errorMsg :message})
}

//(handle register )
/*Call User model : to work with db, email: email (db'doc'email: req'email)
                  : if found in db,insert into user,(if(user) validation
                  : return register ;
                  : else User.create() after created hashedPassword)
                  : returns are used for many promises */
exports.registerAccount = (req,res) => {
    const {email,password} =req.body;

    const errors = validationResult(req);
  
   if(!errors.isEmpty()){
    return res.status(422)
    .render("auth/register",
        {title: "Register", 
        errorMsg :errors.array()[0].msg})
}
 
    
    User.findOne({email})
    .then(user =>{if(user){
        req.flash("error","Email already exit");
        return res.redirect("/register");
    }
    return bcrypt.hash(password,10).then((hashedPassword)=>{
       return User.create({   
            email,
            password : hashedPassword
        })
    })
    .then((_)=>{
        res.redirect("/login");
        transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Register Sucessful",
            html: "<h1>Register account Sucessful.</h1><p>Created an account using this email in blog.io.</p>",
        },
        (err)=>console.log(err));
    })
})
    .catch(err=>console.log(err));
}

//render login page
exports.getLoginPage = (req,res) =>{
    res.render("auth/login",{title: "Login", errorMsg : req.flash("error") })
}
//(handle login)
exports.postLoginData = (req,res) => {
   // req.session.isLogin = true;
    // res.redirect("/");
    const {email,password} = req.body;
    User.findOne({email})
    .then((user)=>{
        if(!user){//error message alert (key: value) when not found email/password
            req.flash("error","Check your information and Try again");
            return res.redirect("/login");

        }
         bcrypt
        .compare(password,user.password)//pass= req.body,user.pass=from db
        .then(isMatch =>{ // isMatch store boolean value = true
            if(isMatch){   //if(true)
                req.session.isLogin = true;  
                req.session.userInfo = user; //after that save()
                return req.session.save(err => {
                    res.redirect("/");
                    console.log(err);
                })

            }
            res.redirect("/login")
        }).catch(err => console.log(err))
    })
    .catch(err => console.log(err))

}

//handle logout
exports.logout = (req,res) =>{
    req.session.destroy(_=>{
        res.redirect("/");
    })
}

//render reset password page
exports.getResetpage = (req,res)=>{
    let message = req.flash("error");
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render("auth/reset",{title: "Reset password", errorMsg :message})
}
//render feedback page
exports.getFeedbackPage = (req,res)=>{
   res.render("auth/feedback",{title: "Success."})
}

//reset password link send
exports.resetLinksend = (req,res)=>{
    const {email} = req.body;
    //dynamic id generate(buffer  generated string)
        crypto.randomBytes(32,(err,buffer)=>{
            if(err){
                console.log(err);
                return res.redirect("/reset-password");
            }
            const token = buffer.toString("hex");
            User.findOne({email})
            .then((user)=>{
                if(!user){
                    req.flash("error","No account found with this email");
                    return res.redirect("/reset-password");
                }
                user.resetToken = token;
                user.tokenExpiration = Date.now() + 1800000;
                return user.save();
            })
            .then(result => {
                res.redirect("/feedback");
                transporter.sendMail({
                    from: process.env.SENDER_MAIL,
                    to: email,
                    subject: "Reset Password",
                    html: `<h1>Reset password now</h1><p>Change your account password by clicking the link below</p><a href="http://localhost:8080/reset-password/${token}" target="_blank">Click here to change password !!</a>`,
                },
                (err)=>console.log(err));
            }).catch(err => {console.log(err)})
        })
}

//render changed password page
//  :$gt (greater than)
    //
exports.getNewpasswordPage = (req,res)=>{
    const {token} =req.params;
    User.findOne({resetToken: token, tokenExpiration: {$gt: Date.now()}})
    .then((user)=>{
        if(user){
            console.log(user)
            let message = req.flash("error")
            if(message.length > 0){
                message = message[0];
            }else{
                message = null;
            }
            res.render("auth/new-password",{
                title: "Change password",
                errorMsg :message,
                resetToken: token,
                user_id: user._id})
        }else{res.redirect("/")}
     } 
    )
    .catch(err => {console.log(err)})
}

//
exports.changeNewpassword = (req,res) => {
    const {password,confirm_password,user_id,resetToken} = req.body;
    console.log(req.body)
    let resetUser;
    
    User.findOne({
        resetToken,
        tokenExpiration: {$gt: Date.now()},
        _id: user_id})
        .then((user)=>{
            console.log(user)
            if(password === confirm_password){
                resetUser = user
               return bcrypt.hash(password, 10)
            }
            
        })
        .then((hashedPassword) => {
             resetUser.password =hashedPassword;
             resetUser.resetToken = undefined;
             resetUser.tokenExpiration = undefined;
             return resetUser.save();
        }).then(() => {
            res.redirect("login")
        })
        .catch(err=>console.log(err))
}