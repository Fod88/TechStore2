const express = require("express")
const Order = require('../models/order')
const Cart = require('../models/cart')
const Product = require('../models/product')
const mongoose = require("mongoose")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/admin")
const User = require("../models/user")

const router = express.Router()


// CREATE ORDER

router.post('/orders' , auth , async (req , res) => {
    try{
        const cart = await Cart.findOne({userId : req.user._id}).populate("items.productId")

        if(! cart){
            return res.status(404).send({error : "404 Cart Not Found"}) 
        }

        if(cart.items.length === 0){
            return res.status(400).send({error : "Cart is Empty"})
        }

        const items = cart.items

        for(const item of items) {
            if(!item.productId){
                return res.status(404).send({error : "404 Product Not Found"})
            }

            if(item.productId.isActive === false){
                return res.status(400).send({error : `${item.productId.name} is currently unavailable`})
            }

            if(item.productId.stock < item.quantity){
                return res.status(400).send({error : `The available quantity ${item.productId.name} is insufficient to fulfill your order`})
            }
        }

        const orderItems = items.map((item) => {
            return {
                productId : item.productId._id,
                productName : item.productId.name, 
                price : item.productId.price, 
                quantity : item.quantity
            }
        })

        let totalPrice = 0
        
        orderItems.forEach((item) => {
            totalPrice += item.price *  item.quantity
            
        })

        const fields = Object.keys(req.body)
        const isValid = fields.every(field => field === "shippingAddress")
        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const { shippingAddress } = req.body
        if(! shippingAddress){
            return res.status(400).send({error : "shippingAddress is required"})
        }


        const allowedFields = ["city", "street", "phone"]

        const addressFields = Object.keys(shippingAddress)

        const addressIsValid = addressFields.every(field => allowedFields.includes(field))

        if (!addressIsValid) {
            return res.status(400).send({
                error: "Invalid fields"
            })
        }
        const {city , street , phone} = shippingAddress
        if(!city || !street || !phone){
            return res.status(400).send({error : "city,street, and phone are required"})
        }

        const order = new Order({userId : req.user._id , items : orderItems , totalPrice , shippingAddress})
        
        for (const item of orderItems) {
            const product = await Product.findById(item.productId)

            product.stock -= item.quantity

            await product.save()
        }

        cart.items = []

        await order.save()
        await cart.save()


        res.status(200).send(order)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// GET MY ORDERS

router.get('/orders' , auth , async (req , res) => {
    try{
        const orders = await Order.find({userId : req.user._id}).sort({createdAt : -1})
        res.status(200).send(orders)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// GET ORDER BY ID

router.get('/orders/:id' , auth , async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid order id"})
        }

        const order = await Order.findById(_id)

        if(! order){
            return res.status(404).send({error : "404 Order Not Found"})
        }

        if(order.userId.toString() !== req.user._id.toString()){
            return res.status(403).send({error : "Access denied"})
        }

        res.status(200).send(order)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// ADMIN GET ALL ORDERS

router.get('/admin/orders' , auth , adminAuth , async (req , res) => {
    try{
        const orders = await Order.find({}).sort({createdAt : -1})
        res.status(200).send(orders)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// ADMIN UPDATE ORDER STATUS

router.patch('/admin/orders/:id/status' , auth , adminAuth , async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid order id"})
        }

        const fields = Object.keys(req.body)
        if(fields.length !== 1){
            return res.status(400).send({error : "Invalid Fields"})
        }
        const isValid = fields.every(field => field === "status")
        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }
        const {status} = req.body

        const cases = ["pending", "processing", "shipped", "delivered", "cancelled"]
        if(!cases.includes(status)){
            return res.status(400).send({error : "Value of Status not Match"})
        }

        const order = await Order.findById(_id)

        if(! order){
            return res.status(404).send({error : "404 Order Not Found"})
        }

        order.status = status
        await order.save()

        res.status(200).send(order)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// ADMIN DASHBOARD STATISTICES

router.get('/admin/dashboard' , auth , adminAuth , async (req , res) => {
    try{
        const totalUsers = await User.countDocuments()
        const totalProducts = await Product.countDocuments()
        const totalOrders = await Order.countDocuments()

        const result = await Order.aggregate([
            {
                $match : {
                    status : {$ne : "cancelled"}
                }
            },
            
            { 
                $group : {
                    _id : null,
                    total : {$sum : "$totalPrice"}
                }
            }
        ])

        const revenue = result[0]?.total || 0

        const statistics = {totalUsers , totalProducts , totalOrders , revenue}
        res.status(200).send(statistics)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})

module.exports = router