import type Axios = require("axios");

const axios: Axios.AxiosStatic = require("axios");

//// GLOBAL SELECTORS /////
let addFavoriteButton = document.querySelector('.add-favorite-btn')
let favoritesBox = document.querySelector('.favorites-box')
let searchForm = document.querySelector('.search-form')
let alertModal = document.querySelector('.alert-wrapper')
let alertMessage = document.querySelector('.modal-message')
let closeButton = document.querySelector('.modal-close-btn')
let ingredientInput = document.querySelector('.ingredient-input')

//// Invoke starter functions on window load
loadFavorites()
populateLettersDropdown()
initDisplay() //initialize the drink to be displayed on first load
getRandomCocktail()

async function initDisplay() {
	try {
		displayCocktail((await axios.get(`/drinks/letter/m`)).data, 15)
	} catch (err) {
		console.log(err)
	}
}

////// DISPLAY COCKTAIL ////////
function displayCocktail(cocktail: any, index = 0) {
	// console.log(cocktail)
	let currentDrink = cocktail.drinks[index]
	let {
		idDrink: id,
		strDrink: name,
		strDrinkThumb: picture,
		strGlass: glass,
		strInstructions: instructions,
	} = currentDrink

	$('.id-holder').attr('id', id)

	// Drink card
	$('.drink-name').text(name)

	// Picture
	$('.drink-image').attr('src', picture)

	// Ingredients List
	$('.ingredient').detach() //remove the ingredients from previous drink
	$('.ingredients-title').text('Ingredients')
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
			currentDrink[[`strIngredient${i}`]]
		}`
		ingredient.classList.add('ingredient')
		$('.ingredients-list').append(ingredient)
	}

	// Glass
	$('.glass-name').text(`Glass: ${glass}`)

	// Directions
	$('.directions-card').text(instructions)
}

////// GET RANDOM COCKTAIL /////////
function getRandomCocktail() {
	let randomButton = document.querySelector('.random-cocktail') as HTMLButtonElement;

	randomButton.addEventListener('click', () => {
		axios
			.get(`https://www.thecocktaildb.com/api/json/v1/1/random.php`)
			.then(response => displayCocktail(response.data))
			.catch(err => console.log(err))
	})
}

////// GET DRINK BY NAME //////
function getDrinkByName(e) {
	e.preventDefault()
	let name = e.target[0].value

	axios
		.get(`/drinks/name/${name}`)
		.then(response => {
			if (response.data.drinks == null) {
				return alertUser(
					'That drink does not exist or was spelled incorrectly. Please try again!'
				)
			}
			displayCocktail(response.data)
		})
		.catch(err => console.log(err))

	e.target[0].value = ''
}

////// GET DRINK BY INGREDIENT //////
function getDrinkByIngredient(e: any) {
	e.preventDefault()
	let ingredient = e.target.value

	axios
		.get(`/drinks/ingredient/${ingredient}`)
		.then(response => {
			populateIngredientsDropDown(response.data)
		})
		.catch(err => console.log(err))
}

/////// POPULATE INGREDIENTS DRINKS DROPDOWN ////////
function populateIngredientsDropDown(cocktails: any) {
	$('.option').detach() //remove old options before repopulating

	for (let i = 0; i < cocktails.drinks.length; i++) {
		let select = document.querySelector('.ingredients-dropdown') as HTMLSelectElement;
		let option = document.createElement('option')
		option.classList.add('option')
		option.text = cocktails.drinks[i].strDrink
		option.value = cocktails.drinks[i].idDrink
		select.appendChild(option)
	}

	let ingredientsForm = document.querySelector('.ingredients-form')
	ingredientsForm?.addEventListener('submit', e => {
		e.preventDefault()
		let select = e.target?.[1]
		let id = select.options[select.selectedIndex].value

		getDrinkById(id)
	})
}

////// POPULATE DRINK DROPDOWN ////////
function populateDrinkDropdown(cocktails, letter) {
	$('.option').detach() //remove old options before repopulating

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
		let select = e.target[1]
		let opt = select.options[select.selectedIndex].value

		let index = cocktails.drinks.findIndex(object => object.idDrink == opt)

		axios
			.get(`/drinks/letter/${letter}`)
			.then(response => displayCocktail(response.data, index))
			.catch(err => console.log(err))
	})
}

////// POPULATE LETTERS DROPDOWN ////////
function populateLettersDropdown() {
	let alpha = [
		'A','B','C','D','E','F',
		'G','H','I','J','K','L',
		'M','N','O','P','Q','R',
		'S','T','U','V','W','X',
		'Y','Z',
	]

	let lettersDropdown = document.querySelector('.letters-dropdown')

	for (let i = 0; i < alpha.length; i++) {
		lettersDropdown.options[lettersDropdown.options.length] = new Option(
			alpha[i],
			alpha[i].toLowerCase()
		)
	}

	$('.letters-dropdown').on('change', e => {
		let letter = e.target.value
		axios.get(`/drinks/letter/${letter}`).then(response => {
			console.log(response)
			populateDrinkDropdown(response.data, letter)
		})
	})
}

/////// ADD FAVORITE TO DB///////
function addFavorite(e) {
	let listItemLength =
		e.target.parentNode.parentNode.children[7].children.length
	console.log(listItemLength)
	let id = $('.id-holder').attr('id')

	for (let i = 0; i < favoritesBox.children.length; i++) {
		if (Number(favoritesBox.children[i].getAttribute('id')) === +id)
			return alertUser(`You've already added that drink!`)
	}

	if (listItemLength >= 10)
		return alertUser('You have reached the max amount of favorites!')

	let drinkId =
		e.target.parentNode.parentNode.parentNode.children[1].children[2].id
	let drinkLetter =
		e.target.parentNode.parentNode.parentNode.children[1].children[0].innerHTML
			.charAt(0)
			.toLowerCase()
	let drinkName =
		e.target.parentNode.parentNode.parentNode.children[1].children[0]
			.innerHTML

	let drinkObj = {
		id: drinkId,
		name: drinkName,
		letter: drinkLetter,
	}

	axios
		.post(`/drinks/favorites`, drinkObj)
		.then(response => {
			let { data } = response
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

	favoriteLi.innerHTML = `
							<h3 class="fave-name">${name}</h3>
							<div class="button-container">
								<button class="button" onClick="getDrinkById(${id})">Load</button>
								<button onClick='deleteFavorite(${id})' class="delete-btn button"><strong>✘</strong></button>
							</div>`
	favoritesBox.appendChild(favoriteLi)
}

/////// DELETE FAVORITE ///////
function deleteFavorite(drinkId) {
	axios
		.delete(`/drinks/favorites/${drinkId}`)
		.then(response => {
			let drink = response.data

			for (let i = 0; i < favoritesBox.children.length; i++) {
				let drinkToDelete = favoritesBox.children[i]
				if (
					drinkToDelete.getAttribute('id') === String(drink.drinkId)
				) {
					favoritesBox.children[i].classList.add('fall')
					favoritesBox.children[i].addEventListener(
						'transitionend',
						() => {
							drinkToDelete.remove()
						}
					)
				}
			}
		})
		.catch(err => {
			console.log(err)
		})
}

///// LOAD FAVORITES ON WINDOW ONLOAD ///////
function loadFavorites() {
	axios
		.get(`/drinks`)
		.then(response => {
			// console.log(response)
			response.data.forEach(drink => {
				addFavoriteItem(drink)
			})
		})
		.catch(err => console.error(err))
}

///// GET DRINK By ID //////
function getDrinkById(id) {
	axios
		.get(`/drinks/id/${id}`)
		.then(response => {
			displayCocktail(response.data)
		})
		.catch(err => console.log(err))
}

///// ALERT FUNCTION /////
function alertUser(message) {
	alertMessage.innerText = message
	alertModal.classList.remove('hide')
}

////// GLOBAL LISTENERS ///////
addFavoriteButton.addEventListener('click', addFavorite)
searchForm.addEventListener('submit', getDrinkByName)
ingredientInput.addEventListener('keyup', getDrinkByIngredient)
closeButton.addEventListener('click', () => {
	alertMessage.innerText = ''
	alertModal.classList.add('hide')
})
