const bcrypt = require("bcryptjs");
const User = require("../model/user")

//render register page
exports.getRegisterPage = (req,res) =>{
    res.render("auth/register",{title: "Register"})
}
//(handle register )
/*Call User model : to work with db, email: email (db'doc'email: req'email)
                  : if found in db,insert into user,(if(user) validation
                  : return register ;
                  : else User.create() after created hashedPassword)
                  : returns are used for many promises */
exports.registerAccount = (req,res) => {
    const {email,password} =req.body;
    console.log(email,password);
    User.findOne({email})
    .then(user =>{if(user){
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
    })
})
    .catch(err=>console.log(err));
}

//render login page
exports.getLoginPage = (req,res) =>{
    res.render("auth/login",{title: "Login" })
}
//(handle login)
exports.postLoginData = (req,res) => {
   // req.session.isLogin = true;
    // res.redirect("/");
    const {email,password} = req.body;
    User.findOne({email})
    .then((user)=>{
        if(!user){
            return res.redirect("/login")
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