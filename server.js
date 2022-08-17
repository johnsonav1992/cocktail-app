require('dotenv').config()
const express = require("express")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('client'))


const { getHomePage } = require('./server/controller.js');

///Routes///
app.get('/', getHomePage)
require(`./server/routes.js`)(app)

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Server running at port ${port}`))

