const express = require("express");
const path = require("path")
const bodyparser = require("body-parser");
const mongoose = require("mongoose")
const dotenv = require("dotenv").config();
const session = require("express-session");//import pakages
const mongoStore = require("connect-mongodb-session")(session);
const {isLogin} = require("./middlewares/is-login")//middle work left to right
const csrf = require("csurf")
const flash = require('connect-flash');
// work as order : middleware -> routes -> 
                 
                 

const app = express();//server

 app.set("view engine","ejs");//template engine
 app.set("views","views")

const postRoutes = require("./routes/post");//routes 
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const User = require("./model/user");//model

const errorController = require("./controllers/error");//controller imp

const store = new mongoStore({
  uri : process.env.MONGODB_URI,
  collection: "sessions"
})

const csrfProtect = csrf(); //  called token

app.use(express.static(path.join(__dirname, "public")));//middleware
app.use(bodyparser.urlencoded({extended: false}))
app.use(session({
    secret : process.env.SESSION_KEY,
    resave : false,
    saveUninitialized: false,
    store,
}))

app.use(csrfProtect);//registered as a middleware to generate a csrf token from server and use to check while form submit by user if(csrfToken)
app.use(flash()); //registered connect-flash package

//Custom middleware
app.use((req,res,next) => {
  if(req.session.isLogin === undefined){
    return next();
  }
  User.findById(req.session.userInfo._id)
  .select("_id email")
  .then((user)=>{
    req.user = user;
    next();
  })
})

//midddleware to send csrf token as local variable for every page render
app.use((req,res,next)=>{
  res.locals.isLogin =  req.session.isLogin ? true : false;
  res.locals.csrfToken = req.csrfToken();
  next();
})


app.use("/admin", isLogin ,adminRoutes);//route define
app.use(postRoutes);  
app.use(authRoutes);

//undefined route catcher and render 404
app.all("*", errorController.get404Page)
//error middleware()
app.use( errorController.get500Page)

mongoose.connect(process.env.MONGODB_URL)//connecting to database
.then((_)=>{
    app.listen(8080);
    console.log("Connected to mongodb!!!");
})
// .then(result => console.log(result))
.catch((err)=>console.log(err))


