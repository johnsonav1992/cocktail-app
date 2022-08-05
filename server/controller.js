const axios = require('axios')

const GENERIC_COCKTAIL_URL =
	'https://www.thecocktaildb.com/api/json/v1/1/search.php?f='

module.exports = {
    getDrinksByLetter: (req, res) => {
        let { letter } = req.params

        axios.get(`${GENERIC_COCKTAIL_URL}${letter}`)
            .then(response => {
                res.status(200).send(response.data)
            })
            .catch(err => console.log(err))
    }
}