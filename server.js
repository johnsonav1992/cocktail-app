const express = require("express")
const cors = require("cors")
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

app.get(`/https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a`, (req, res) => {
    console.log(res)
    // res.status(200).send(res.body)
})






app.listen(PORT, () => console.log(`Server running at port ${PORT}`))

