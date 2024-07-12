const express = require("express");
const path = require("path")
const bodyparser = require("body-parser");//body parsing middleware
const mongoose = require("mongoose")
const dotenv = require("dotenv").config();

const app = express();
//using "view engine" node server know/detect extenctions like .html/.ejs("ejs")
 app.set("view engine","ejs");//declare to use ejs with 2 line
 app.set("views","views")//sec para is views folder(first para is path)

const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const User = require("./model/user")


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({extended: false}))
// app.use(express.json());  //watching obj datas from form submit
app.use((req,res,next)=>{
    User.findById("668f9502c6179234006a7197")
    .then(user => {
        req.user = user ;//custom req
        next();
    })
    .catch()
   })



app.use("/admin",adminRoutes);
app.use(postRoutes);  
app.use(authRoutes);

mongoose.connect(process.env.MONGODB_URL)
.then((res)=>{
    app.listen(8080);
    console.log("Connected to mongodb!!!");

    return User.findOne()
    .then((user) => {if(!user){
         User.create({
            username: "kyaw",
            email: "abcd@gmail.com", 
            password: "abcd" })
    }
    return user})
})
.then(result => console.log(result))
.catch((err)=>console.log(err))
