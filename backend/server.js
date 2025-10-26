const express = require("express")
const booksRoutes = require("./routes/books")
const mongoose = require("mongoose")
const cors = require('cors');

const app = express()

const SERVER_PORT = process.env.SERVER_PORT || 3001
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || "mongodb+srv://sa:zXRcenjBrPmpXLx3@cluster0.7wn4nmp.mongodb.net/F2025_week6_lab?retryWrites=true&w=majority&appName=Cluster0"

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Allow all origins
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies or authorization headers
};
app.use(cors(corsOptions));

app.use("/api/v1", booksRoutes)

app.route("/")
    .get((req, res) => {
        res.send("<h1>MogoDB + Mongoose Example</h1>")
    })

mongoose.connect(DB_CONNECTION_STRING).then(() => {
    console.log("Connected to MongoDB")
    app.listen(SERVER_PORT, () => {
        console.log(`Server running at http://localhost:${SERVER_PORT}/`)
    })
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err.message)
})


