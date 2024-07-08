const mongodb = require("mongodb");//for detail 
const {getDatabase} = require("../utils/database")//for connection

//1
class Post {
    constructor(title,description,img_url){
        this.title = title,
        this.description = description,
        this.img_url = img_url
    };

    create(){
            const db = getDatabase();//connect
            return db.collection("posts")//collection or table create
            .insertOne(this)//(this is class obj)
            .then((result) => 
                console.log(result))
            .catch(err => console.log(err));
    }//() insert data to database

    static getPosts(){
        const db = getDatabase();
        return db
        .collection("posts").find()   //find post collection
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
}

module.exports = Post;