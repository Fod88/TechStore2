
const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    userId : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "User"
        },

    items : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                required : true,
                ref : "Product"
            } ,

            productName : {
                type : String,
                trim : true,
                required : true
            },

            price : {
                type : Number,
                required : true,
                min : 0
            },

            quantity : {
                type : Number,
                required : true,
                default : 1,
                min : 1
            },
        }
    ],

    totalPrice : {
        type : Number,
        required : true,
        min : 0
    },

    status : {
        type : String,
        required : true,
        trim : true,
        enum : ["pending", "processing", "shipped", "delivered", "cancelled"],
        default : "pending"
    },
            

    shippingAddress : {
        city : {
            type : String,
            required : true,
            trim : true
        },

        street : {
            type : String,
            required : true,
            trim : true
        },

        phone : {
            type : String,
            required : true,
            trim : true
        }
    }

},  { timestamps: true })


const Order = mongoose.model("Order" , orderSchema)

module.exports = Order