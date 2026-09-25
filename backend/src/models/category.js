
const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    isActive : {
        type : Boolean,
        default : true
    }

})

const Category = mongoose.model("Category" , categorySchema)

module.exports = Category