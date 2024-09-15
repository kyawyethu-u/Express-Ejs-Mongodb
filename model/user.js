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
    username: {
        type: String,
        minLength: 3,
        unique: true,
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    payment_session_key:{
        type: String,
    },
    resetToken: String,
    tokenExpiration: Date,
    
})

module.exports = model("User",userSchema)