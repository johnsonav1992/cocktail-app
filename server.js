require('dotenv').config()
const express = require("express")
const cors = require("cors")
const app = express()
const { SERVER_PORT } = process.env

app.use(express.json())
app.use(cors())

require(`./server/routes.js`)(app)

app.listen(SERVER_PORT, () => console.log(`Server running at port ${SERVER_PORT}`))

