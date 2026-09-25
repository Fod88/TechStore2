
const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    description : {
        type : String,
        trim : true,
        maxlength : 500
    },

    price : {
        type : Number,
        required : true,
        min : 0
    },

    stock : {
        type : Number,
        required : true,
        default : 0
    },

    image : {
        type : String,
    },

    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Category"
    },

    isActive : {
        type : Boolean,
        default : true
    }

})


const Product = mongoose.model("Product" , productSchema)

module.exports = Product