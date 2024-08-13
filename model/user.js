const mongoose = require("mongoose")

const {Schema,model} = mongoose
//defined db'document'keys in User model

const userSchema = new Schema({
    email : {
        type : String,
        unique: true,
        required: true
    },
    password : {
        type : String,
        required: true,
        minLength: 4,
    },
    resetToken: String,
    tokenExpiration: Date,
    
})

module.exports = model("User",userSchema)