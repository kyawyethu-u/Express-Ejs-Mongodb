exports.getLoginPage = (req,res) =>{
    res.render("auth/login",{title: "Login" })
}//for login page


//for create cookie form submit
exports.postLoginData = (req,res) => {
    res.setHeader("Set-Cookie","isLogin=true")//name,value
    res.redirect("/");
}