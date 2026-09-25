const express = require("express")
const Cart = require("../models/cart")
const auth = require("../middleware/auth")
const mongoose = require("mongoose")
const Product = require("../models/product")


const router = express.Router()

// CREATE NEW CART
router.post('/cart' , auth , async (req , res) => {
    try{
        const cart = await Cart.findOne({userId : req.user._id})
        console.log(req.user)
        console.log(cart)
        if(cart){
            return res.status(200).send(cart)
        }

        const new_cart = new Cart({userId : req.user._id , items : [] })
        await new_cart.save()
        res.status(201).send(new_cart)

    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})

// ADD NEW PRODUCT TO CART
router.post('/cart/items' , auth , async (req , res) => {
    try{
        const allowFields = ["productId" , "quantity"]
        const fields = Object.keys(req.body)

        const isValid = fields.every(field => allowFields.includes(field))

        if(! isValid){
            return res.status(400).send({error : "invalid fields"})
        }

        const {productId , quantity} = req.body

        if(!productId || quantity === undefined){
            return res.status(400).send({error : "productId and quantity are required"})
        }

        if(! mongoose.isValidObjectId(productId)){
            return res.status(400).send({error : "Invalid product id"})
        }

        const product = await Product.findOne({_id : new mongoose.Types.ObjectId(productId) , isActive : true})
        if(! product){
            return res.status(404).send({error : "404 Product Not Found"})
        }

        const stock = product.stock

        if(typeof quantity !== "number" || quantity <= 0){
            return res.status(400).send({error : "Quantity must be Postive Number"})
        }

        


        if(quantity > stock){
            return res.status(400).send({error : `The available quantity is insufficient to meet your needs ${stock}`})
        }

        const cart = await Cart.findOne({userId : req.user._id})
        if(cart){
            const items = cart.items
            const index = items.findIndex(item => item.productId.toString() === productId)
            if(index !== -1){
                const new_quantity = items[index].quantity + quantity
                if(new_quantity > stock){
                    return res.status(400).send({errorr : `The available quantity is insufficient to meet your needs ${stock}`})
                }
                cart.items[index].quantity = new_quantity

                await cart.save()

                return res.status(200).send(cart)
            }


            cart.items.push({productId , quantity})
            await cart.save()

            return res.status(200).send(cart)
            
        }

        const new_cart = new Cart({userId : req.user._id , items : [{productId , quantity}]})
        await new_cart.save() 

        return res.status(200).send(new_cart)


    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// PATCH PRODUCT IN CART
router.patch('/cart/items/:productId' , auth , async (req , res) => {
    try{
        const productId = req.params.productId
        if(! mongoose.isValidObjectId(productId)){
            return res.status(400).send({error : "Invalid product id"})
        }

        const product = await Product.findOne({_id : productId , isActive : true})
        if(! product){
            return res.status(404).send({error : "404 Product Not Found"})
        }

        
        const fields = Object.keys(req.body)

        if(fields.length === 0){
            return res.status(400).send({error : "not found updated Fields"})
        }

        const isValid = fields.every(field => field === "quantity")

        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const {quantity} = req.body

        if(typeof quantity !== "number" || quantity <= 0){
            return res.status(400).send({error : "Quantity must be Postive Number"})
        }


        const cart = await Cart.findOne({userId : req.user._id})
        if(! cart){
            return res.status(404).send({error : "404 Cart Not Found"}) 
        }

        const index = cart.items.findIndex(item => item.productId.toString() === productId)
        if(index === -1){
            return res.status(404).send({error : "404 Product Not Found in Your Cart"})
            
        }

        if(product.stock < quantity){
            return res.status(400).send({error : `The available quantity is insufficient to meet your needs ${product.stock}`})
        }

        cart.items[index].quantity = quantity
        await cart.save()

        res.status(200).send(cart)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// DELETE TO PRODUCT IN CART

router.delete('/cart/items/:productId' , auth , async (req , res) => {
    try{
        const productId = req.params.productId
        if(! mongoose.isValidObjectId(productId)){
            return res.status(400).send({error : "Invalid product id"})
        }

        const cart = await Cart.findOne({userId : req.user._id})
        if(! cart){
            return res.status(404).send({error : "404 Cart Not Found"}) 
        }

        const index = cart.items.findIndex(item => item.productId.toString() === productId)
        if(index === -1){
            return res.status(404).send({error : "404 Product Not Found in Your Cart"})
            
        }

        cart.items.splice(index , 1)
        await cart.save()

        res.status(200).send(cart)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// GET CART AND CALCLUTE TOTOAL PRICE

router.get('/cart' , auth , async (req , res) => {
    try{
        const cart = await Cart.findOne({userId : req.user._id}).populate("items.productId")
        if(! cart){
            return res.status(404).send({error : "404 Cart Not Found"}) 
        }

        let totalPrice = 0

        cart.items.forEach((item) => {
            totalPrice += item.productId.price * item.quantity
        })

        res.status(200).send({cart , totalPrice})

    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})



module.exports = router