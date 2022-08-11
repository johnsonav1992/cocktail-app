const baseURL = `http://localhost:3000/drinks`

//// Invoke starter functions on window load
populateLettersDropdown()
getRandomCocktail()

////// DISPLAY COCKTAIL ////////
function displayCocktail(cocktail, index = 0) {
    
	let currentDrink = cocktail.drinks[index]

	////// DRINK CARD //////
	let drinkName = document.querySelector('.drink-name')
	drinkName.innerText = currentDrink.strDrink

	////// PICTURE //////
	let pic = document.querySelector('.drink-image')
	pic.src = `${currentDrink.strDrinkThumb}`

	////// INGREDIENTS LIST //////
	$('.ingredient').detach() // jQuery used to remove the ingredients from the previous drink
	let ingredientsList = document.querySelector('.ingredients-list')
	let ingredientsListTitle = document.querySelector('.ingredients-list-title')
	ingredientsListTitle.innerHTML = 'Ingredients'
	let numOfIngredients = 15

	for (let i = 1; i <= numOfIngredients; i++) {
		
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

////// GET RANDOM COCKTAIL /////////
function getRandomCocktail() {
	let randomButton = document.querySelector('.random-cocktail')

	randomButton.addEventListener('click', () => {
		axios.get(`https://www.thecocktaildb.com/api/json/v1/1/random.php`)
			.then(response => displayCocktail(response.data))
			.catch(err => console.log(err))
	})
	
}

////// POPULATE DRINK DROPDOWN ////////
function populateDrinkDropdown(cocktails, letter) {

	$('.option').detach() //jQuery to remove old options before repopulating

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
		
		axios.get(`${baseURL}/${letter}`)
			.then(response => displayCocktail(response.data, index))
			.catch(err => console.log(err))
	})

}

////// POPULATE LETTERS DROPDOWN ////////
function populateLettersDropdown() {
	let alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

	let lettersDropdown = document.querySelector('.letters-dropdown')

	for (let i = 0; i < alpha.length; i++) {
		lettersDropdown.options[lettersDropdown.options.length] = new Option(alpha[i], alpha[i].toLowerCase())
	}

	$('.letters-dropdown').change(e => {
		let letter = e.target.value
		axios.get(`${baseURL}/${letter}`).then(response => {
			console.log(response)
			populateDrinkDropdown(response.data, letter)
		})
		
	})
}
	



