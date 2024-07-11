const mongoose = require("mongoose")

const {Schema,model} = mongoose;

//data format
const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    img_url: {
        type: String,
        required: true
    }
})

module.exports = model("Post", postSchema)