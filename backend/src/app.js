require("dotenv").config()
const cors = require("cors")
const express = require("express")

const app = express()

app.use(cors())
require("./db/mongoose")


app.use(express.json())

const port = process.env.PORT || 3000

// ROUTER OF USER
const userRouter = require("./routers/user")
app.use(userRouter)

// ROUTER OF CATEGORY
const categoryRouter = require("./routers/category")
app.use(categoryRouter)

// ROUTER OF PRODUCT
const productRouter = require("./routers/product")
app.use(productRouter)

// ROUTER OF CARTS
const cartRouter = require("./routers/cart")
app.use(cartRouter)

// ROUTER OF ORDER
const orderRouter = require("./routers/order")
app.use(orderRouter)

app.listen(port , () =>{
    console.log(`Server is running on port ${port}`)
})