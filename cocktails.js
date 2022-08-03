const GENERIC_COCKTAIL_URL =
	'https://www.thecocktaildb.com/api/json/v1/1/search.php?f='

////// DISPLAY COCKTAIL ////////
function displayCocktail(cocktail, index) {
    
	let currentDrink = cocktail.drinks[index]

	////// DRINK CARD //////
	let drinkCard = document.querySelector('.drink-card')
	let drinkName = document.querySelector('.drink-name')
	drinkName.innerText = currentDrink.strDrink

	////// PICTURE //////
	let pic = document.querySelector('img')
	pic.src = `${currentDrink.strDrinkThumb}`

	////// INGREDIENTS LIST //////
	let ingredientsList = document.querySelector('.ingredients-list')
	let ingredientsListTitle = document.querySelector('.ingredients-list-title')
	ingredientsListTitle.innerHTML = 'Ingredients'

	for (let i = 1; i <= 15; i++) {
		
		if (
			currentDrink[`strIngredient${i}`] == null ||
			currentDrink[`strIngredient${i}`] === ''
		) {
			break
		}
		if (currentDrink[`strMeasure${i}`] == null) {
			currentDrink[`strMeasure${i}`] = ''
		}

		let ingredient = document.createElement('li')
		ingredient.innerHTML = `${currentDrink[[`strMeasure${i}`]]} ${
			currentDrink[[`strIngredient${i}`]]}`
		ingredient.classList.add('ingredient')
		ingredientsList.append(ingredient)
		
		
	}
	////// GLASS //////
    let glass = document.querySelector('.glass-name')
	glass.innerText = `Glass: ${currentDrink.strGlass}`

	////// DIRECTIONS //////
	let directionsCard = document.querySelector('.directions-card')
	directionsCard.innerText = currentDrink.strInstructions
    
}


////// POPULATE DRINK DROPDOWN ////////
function populateDrinkDropdown(cocktails, letter) {

	$('.option').detach()

	for (let i = 0; i < cocktails.drinks.length; i++) {
		let select = document.querySelector('.drink-dropdown')
		let option = document.createElement('option')
		option.classList.add('option')
		option.text = cocktails.drinks[i].strDrink
		option.value = cocktails.drinks[i].idDrink
		select.appendChild(option)
	}

	let form = document.querySelector('.drinks-form')
	form.addEventListener('submit', e => {
		e.preventDefault()
		console.log(e)

		let select = e.target[1]
		let opt = select.options[select.selectedIndex].value
		console.log(opt)

		let index = cocktails.drinks.findIndex(object => 
			 object.idDrink == opt
		)

		/* jQuery used to remove the ingredients from 
		the prev. drink before repopulating */
		$('.ingredient').detach()
		
		axios
			.get(`${GENERIC_COCKTAIL_URL}${letter}`)
			.then(res => displayCocktail(res.data, index))
	})

}

function populateLettersDropdown() {
	let alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

	let lettersDropdown = document.querySelector('.letters-dropdown')

	for (let i = 0; i < alpha.length; i++) {
		lettersDropdown.options[lettersDropdown.options.length] = new Option(alpha[i], alpha[i].toLowerCase())
	}

	$('.letters-dropdown').change(e => {
		let letter = e.target.value
		axios.get(`${GENERIC_COCKTAIL_URL}${letter}`).then(res => populateDrinkDropdown(res.data, letter))
	})
}
	

populateLettersDropdown()

