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
    res.render("auth/register",{
        title: "Register", 
        errorMsg :message,
        oldFormData : {email:"",password:""}})
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
        errorMsg :errors.array()[0].msg,
        oldFormData : {email,password}})
}
 
      bcrypt.hash(password,10).then((hashedPassword)=>{
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
}

//render login page
exports.getLoginPage = (req,res) =>{
    res.render("auth/login",
        {title: "Login", 
        errorMsg : req.flash("error"),
        oldFormData : {email:"",password:""}})
}
//(handle login)
exports.postLoginData = (req,res) => {
   // req.session.isLogin = true;
    // res.redirect("/");
    const {email,password} = req.body;
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
         res.status(422).
        render("auth/login",{title: "Login",
         errorMsg : errors.array()[0].msg,
         oldFormData : {email,password}
        })
    }
    User.findOne({email})
    .then((user)=>{
        if(!user){//error message alert (key: value) when not found email/password
        return res.status(422).
        render("auth/login",{title: "Login",
         errorMsg : "Please enter valid mail and password!",
         oldFormData : {email,password}
        });

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
            res.status(422).
         render("auth/login",{title: "Login",
         errorMsg : "Password incorrect!",
         oldFormData : {email,password}
        })
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
    res.render("auth/reset",{title: "Reset password", errorMsg :message,
        oldFormData : {email:""}
    })
}
//render feedback page
exports.getFeedbackPage = (req,res)=>{
   res.render("auth/feedback",{title: "Success."})
}

//reset password link send
exports.resetLinksend = (req,res)=>{
    const {email} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
     return res.status(422)
     .render("auth/reset",
         {title: "Reset Password", 
         errorMsg :errors.array()[0].msg,
         oldFormData : {email}})
 }
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
                return res.status(422).
                render("auth/reset",{title: "Reset Password",
                errorMsg : "No account exist with this email!!",
                oldFormData : {email}
            })
                }
                user.resetToken = token;
                user.tokenExpiration = Date.now() + 1800000;
                return user.save();
            })
            .then(result => {
                return res.redirect("/feedback");
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
    User.findOne({
        resetToken: token, 
        tokenExpiration: {$gt: Date.now()}})
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
                user_id: user._id,
                oldFormData : {password: "",confirm_password: ""}})
        }else{res.redirect("/")}
     } 
    )
    .catch(err => {console.log(err)})
}

//
exports.changeNewpassword = (req,res) => {
    const {password,confirm_password,user_id,resetToken} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).
        render("auth/new-password",{
                    title: "Change password",
                    errorMsg :errors.array()[0].msg,
                    resetToken: token,
                    user_id,
                    oldFormData : {password,confirm_password}})
                
    }

    console.log(req.body)
    let resetUser;
    
    User.findOne({
        resetToken,
        tokenExpiration: {$gt: Date.now()},
        _id: user_id})
        .then((user)=>{
            resetUser = user;
            return bcrypt.hash(password, 10)
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