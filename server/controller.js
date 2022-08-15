const axios = require('axios')

const GENERIC_COCKTAIL_URL =
	'https://www.thecocktaildb.com/api/json/v1/1/search.php?f='

require('dotenv').config()
const Sequelize = require('sequelize')
    
const { CONNECTION_STRING } = process.env 
    
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    getDrinksByLetter: (req, res) => {
        let { letter } = req.params

        axios.get(`${GENERIC_COCKTAIL_URL}${letter}`)
            .then(response => {
                res.status(200).send(response.data)
            })
            .catch(err => console.log(err))
    },

    addFavorite : (req, res) => {
        let { id, name, letter } = req.body

        sequelize.query(`
        INSERT INTO favorite_drinks (drink_id, drink_name, drink_letter)
        VALUES (${id}, '${name}', '${letter}')
        `)
        .then(dbRes => {
            res.status(200).send([...dbRes[0], id, name, letter])
        })
        .catch(err => console.log(err))
    },

    deleteFavorite: (req, res) => {
        let { drinkId } = req.params
        console.log(drinkId)

        res.status(200).send(drinkId)
    }
}