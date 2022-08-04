const express = require("express")
const cors = require("cors")
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

require(`./server/routes.js`)(app)

app.listen(PORT, () => console.log(`Server running at port ${PORT}`))

