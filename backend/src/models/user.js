
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name : {
        type : String ,
        required : true,
        trim : true,
    },
    
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        unique : true
    },

    password : {
        type : String,
        required : true,
        minlength : 8
    },

    role : {
        type : String,
        enum : ["customer" , "admin"],
        default : "customer"
    }
} , { timestamps: true })

const User = mongoose.model("User" , userSchema)

module.exports = User