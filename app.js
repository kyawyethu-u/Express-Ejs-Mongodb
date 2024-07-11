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


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({extended: false}))
// app.use(express.json());  //watching obj datas from form submit


app.use("/admin",adminRoutes);
app.use(postRoutes);  

mongoose.connect(process.env.MONGODB_URL)
.then((res)=>{
    app.listen(8080);
    console.log("Connected to mongodb!!!");})
.catch((err)=>console.log(err))
