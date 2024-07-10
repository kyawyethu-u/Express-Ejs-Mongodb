const mongodb = require("mongodb");//for detail 
const {getDatabase} = require("../utils/database")//for connection

//1
class Post {
    constructor(title,description,img_url,id){
        this.title = title,
        this.description = description,
        this.img_url = img_url,
        this._id = id ? new mongodb.ObjectId(id) :null
    };

    create(){
            const db = getDatabase();//connect
            let dbTemp;
            if(this._id){
                //upd post
                dbTemp = db.collection("posts").updateOne({_id: this._id},{$set: this})
            }else{dbTemp = db.collection("posts").insertOne(this) }

            return dbTemp
            .then((result) => 
                console.log(result))
            .catch(err => console.log(err));
    }//() insert data to database

    static getPosts(){
        const db = getDatabase();
        return db
        .collection("posts")
        .find()   //find post collection
        .sort({ title: 1 })
        .toArray()                             //json to array
        .then(posts => {
            console.log(posts)
            return posts;})
        .catch(err => console.log(err))
    }

    static getPost(postId){
        const db = getDatabase();
        return db
        .collection("posts")
        .find({_id : new mongodb.ObjectId(postId)})   //find post collection
        .next()                          //json to array
        .then((post) => {
            console.log(post)
            return post;})
        .catch(err => console.log(err))
    }
    static deleteByID(postId){
        const db = getDatabase();
        return db
        .collection("posts")
        .deleteOne({_id : new mongodb.ObjectId(postId)})
        .then((result) => {
            console.log("post deleted")
           })
        .catch(err => console.log(err))
         
    }
}

module.exports = Post;