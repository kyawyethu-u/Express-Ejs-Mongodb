const express = require("express");
const path = require("path")
const bodyparser = require("body-parser");
const mongoose = require("mongoose")
const dotenv = require("dotenv").config();
const session = require("express-session");//import pakages
const mongoStore = require("connect-mongodb-session")(session);

const app = express();//server

 app.set("view engine","ejs");//engine
 app.set("views","views")

const postRoutes = require("./routes/post");//routes
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const User = require("./model/user");//model

const store = new mongoStore({
  uri : process.env.MONGODB_URI,
  collection: "sessions"
})


app.use(express.static(path.join(__dirname, "public")));//middleware
app.use(bodyparser.urlencoded({extended: false}))
app.use(session({
    secret : process.env.SESSION_KEY,
    resave : false,
    saveUninitialized: false,
    store,
}))



app.use("/admin",adminRoutes);//route define
app.use(postRoutes);  
app.use(authRoutes);

mongoose.connect(process.env.MONGODB_URL)//connecting to database
.then((res)=>{
    app.listen(8080);
    console.log("Connected to mongodb!!!");

   
})
// .then(result => console.log(result))
.catch((err)=>console.log(err))
