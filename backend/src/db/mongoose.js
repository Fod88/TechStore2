
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Connected to MongoDB")
    })

    .catch((error) => {
        console.log("MongoDB connection error:", error)
    })