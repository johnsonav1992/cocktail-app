const baseURL = `http://localhost:4000/drinks`

//// GLOBAL SELECTORS /////
let addFavoriteButton = document.querySelector('.add-favorite-btn')
let favoritesBox = document.querySelector('.favorites-box')

//// Invoke starter functions on window load
loadFavorites()
populateLettersDropdown()
initDisplay() //initialize the drink to be displayed on first load
// getRandomCocktail()

function initDisplay() {
	axios.get(`${baseURL}/m`)
			.then(response => displayCocktail(response.data, 4))
			.catch(err => console.log(err))
}

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
	$('.ingredient').detach() // jQuery to remove the ingredients from the previous drink
	let ingredientsList = document.querySelector('.ingredients-list')
	let ingredientsListTitle = document.querySelector('.list-title')
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

// ////// GET RANDOM COCKTAIL /////////
// function getRandomCocktail() {
// 	let randomButton = document.querySelector('.random-cocktail')

// 	randomButton.addEventListener('click', () => {
// 		axios.get(`https://www.thecocktaildb.com/api/json/v1/1/random.php`)
// 			.then(response => displayCocktail(response.data))
// 			.catch(err => console.log(err))
// 	})
	
// }

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

/////// ADD FAVORITE ///////
function addFavorite(e) {
	let listItemLength = e.target.parentNode.parentNode.children[3].children.length
	if (listItemLength === 15) return alert('You have reached the max amount of favorites!')

	let drinkId = e.target.parentNode.parentNode.children[1][1][e.target.parentNode.parentNode.children[1][1].selectedIndex].value
	let drinkLetter = e.target.parentNode.parentNode.children[1][0][e.target.parentNode.parentNode.children[1][0].selectedIndex].value
	let drinkName = e.target.parentNode.parentNode.children[1][1][e.target.parentNode.parentNode.children[1][1].selectedIndex].innerHTML

	console.log(`%c ID: ${drinkId}`, `color: red;`)
	console.log(`%c Letter: ${drinkLetter}`, `color: aquamarine;`)
	console.log(`%c Name: ${drinkName}`, `color: lightyellow;`)

	let drinkObj = {
		id: drinkId,
		name: drinkName,
		letter: drinkLetter
	}

	console.log(drinkObj)

	axios.post(`${baseURL}/favorites`, drinkObj)
		.then(response => {
			let { data } = response
			console.log(data)
			addFavoriteItem(data)
		})
		.catch(error => {
			console.log(error)
		})

}

/// LOAD THE FAVORITE TO DOM /////
function addFavoriteItem(drinkObj) {
	let { id, name, letter } = drinkObj
	let favoriteLi = document.createElement('li')
	favoriteLi.classList.add('favorite')
	favoriteLi.setAttribute('id', id)
	// for (let i = 0; i < favoritesBox.children.length; i++) {
	// 	if (favoritesBox.children[i].firstChild.innerHTML === name) 
	// 	return alert('You already added that drink!')
	// }
	favoriteLi.innerHTML = `<h3 class="fave-name">${name}</h3>
							<div class="button-container">
								<button class="button" onClick="reloadDrink(${id}, '${letter}')">Load</button>
								<button onClick='deleteFavorite(${id})'   class="delete-btn button"><strong>✘</strong></button>
							</div>`	
	
	favoritesBox.appendChild(favoriteLi)
}

/////// DELETE FAVORITE ///////
function deleteFavorite(drinkId) {
	axios.delete(`${baseURL}/favorites/${drinkId}`)
        .then(response => {
			let drink = response.data
			console.log(response)

			for (let i = 0; i < favoritesBox.children.length; i++) {
				if (favoritesBox.children[i].getAttribute('id') === String(drink.drinkId)) {
					favoritesBox.children[i].remove()
				}
			}
        })
        .catch(err => {
            console.log(err)
		})
}

///// RELOADING FAVORITES ///////
function loadFavorites() {
	axios.get(`${baseURL}`)
		.then(response => {
			console.log(response)
			response.data.forEach(drink => {
				console.log(drink)
				addFavoriteItem(drink)
			})
		})
		.catch(err => console.error(err))
}

///// LOAD DRINK CARD ON RELOAD BUTTON /////
function reloadDrink(id, letter) {
	console.log(id, letter)
	axios.get(`${baseURL}/${letter}`).then(response => {
		console.log(response)
		let index = response.data.drinks.findIndex(object => 
			object.idDrink == String(id))
	   
	   axios.get(`${baseURL}/${letter}`)
		   .then(response => displayCocktail(response.data, index))
		   .catch(err => console.log(err))
	})	


}

////// GLOBAL LISTENERS ///////
addFavoriteButton.addEventListener('click', addFavorite)
	



