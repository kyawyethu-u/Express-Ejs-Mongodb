const mongodb = require("mongodb")//1

const mongodbClient = mongodb.MongoClient;//2-built client
const dotenv =require("dotenv").config();//4-package import
//dotenv.config()

let db;
//6
const mongodbConnector = () =>{
    mongodbClient.connect(process.env.MONGODB_URL)//3
.then((result) => {
    console.log("Connected to DB.");//5
    db = result.db();//result.db() method assign db-name "blog" in db
    console.log("result")
})
.catch(err=>console.log(err))
};

const getDatabase = () =>{
    if(db){
        return db;
    }
    throw "No database!";
};



module.exports = {mongodbConnector,getDatabase};

