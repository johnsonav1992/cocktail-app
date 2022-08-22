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
function displayCocktail(cocktail, index = 0) {
	// console.log(cocktail)
	let currentDrink = cocktail.drinks[index]
	let {
		idDrink: id,
		strDrink: name,
		strDrinkThumb: picture,
		strGlass: glass,
		strInstructions: instructions,
	} = currentDrink

	let idHolder = document.querySelector('.id-holder')
	idHolder.setAttribute('id', id)

	// Drink card
	let drinkName = document.querySelector('.drink-name')
	drinkName.innerText = name

	// Picture
	let pic = document.querySelector('.drink-image')
	pic.src = `${picture}`

	// Ingredients List
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
			currentDrink[[`strIngredient${i}`]]
		}`
		ingredient.classList.add('ingredient')
		ingredientsList.append(ingredient)
	}

	// Glass
	let glassText = document.querySelector('.glass-name')
	glassText.innerText = `Glass: ${glass}`

	// Directions
	let directionsCard = document.querySelector('.directions-card')
	directionsCard.innerText = instructions
}

////// GET RANDOM COCKTAIL /////////
function getRandomCocktail() {
	let randomButton = document.querySelector('.random-cocktail')

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
			if(response.data.drinks == null) {
				return alertUser('That drink does not exist or was spelled incorrectly. Please try again!')
			}
			displayCocktail(response.data)
		})
		.catch(err => console.log(err))
		
	e.target[0].value = ''
}

////// GET DRINK BY INGREDIENT //////
function getDrinkByIngredient(e) {
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
function populateIngredientsDropDown(cocktails) {
	$('.option').detach() //jQuery to remove old options before repopulating

	for (let i = 0; i < cocktails.drinks.length; i++) {
		let select = document.querySelector('.ingredients-dropdown')
		let option = document.createElement('option')
		option.classList.add('option')
		option.text = cocktails.drinks[i].strDrink
		option.value = cocktails.drinks[i].idDrink
		select.appendChild(option)
	}

	let ingredientsForm = document.querySelector('.ingredients-form')
	console.log(ingredientsForm)
	ingredientsForm.addEventListener('submit', e => {
		e.preventDefault()
		console.log(e.target)

		let select = e.target[1]
		let id = select.options[select.selectedIndex].value
		console.log('id: ', id)

		getDrinkById(id)
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
		'A','B','C','D','E','F','G','H',
		'I','J','K','L','M','N','O','P',
		'Q','R','S','T','U','V','W','X',
		'Y','Z'
	]

	let lettersDropdown = document.querySelector('.letters-dropdown')

	for (let i = 0; i < alpha.length; i++) {
		lettersDropdown.options[lettersDropdown.options.length] = new Option(
			alpha[i],
			alpha[i].toLowerCase()
		)
	}

	$('.letters-dropdown').change(e => {
		let letter = e.target.value
		axios.get(`/drinks/letter/${letter}`)
			.then(response => {
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
	if (listItemLength >= 10)
		return alertUser('You have reached the max amount of favorites!')

	let drinkId =
		e.target.parentNode.parentNode.parentNode.children[1].children[2].id
	let drinkLetter =
	e.target.parentNode.parentNode.parentNode.children[1].children[0].innerHTML.charAt(0).toLowerCase()
	let drinkName =
	e.target.parentNode.parentNode.parentNode.children[1].children[0].innerHTML
	// let imgSrc = String(e.target.parentNode.parentNode.parentNode.children[1].children[1].children[0].src)


	console.log(`%c ID: ${drinkId}`, `color: red;`)
	console.log(`%c Letter: ${drinkLetter}`, `color: aquamarine;`)
	console.log(`%c Name: ${drinkName}`, `color: lightyellow;`)
	// console.log(imgSrc)

	let drinkObj = {
		id: drinkId,
		name: drinkName,
		letter: drinkLetter,
		// pic: imgSrc
	}

	console.log(drinkObj)

	axios
		.post(`/drinks/favorites`, drinkObj)
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
	let { id, name, letter, pic } = drinkObj
	let favoriteLi = document.createElement('li')
	favoriteLi.classList.add('favorite')
	favoriteLi.setAttribute('id', id)
	// for (let i = 0; i < favoritesBox.children.length; i++) {
	// 	if (favoritesBox.children[i].firstChild.innerHTML === name)
	// 	return alert('You already added that drink!')
	// }
	favoriteLi.innerHTML = `
							<h3 class="fave-name">${name}</h3>
							<div class="button-container">
								<button class="button" onClick="reloadDrink(${id}, '${letter}')">Load</button>
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
					drinkToDelete.getAttribute('id') ===
					String(drink.drinkId)
				) {
					favoritesBox.children[i].classList.add('fall')
					favoritesBox.children[i].addEventListener('transitionend', () => {
						drinkToDelete.remove()
					})
					
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
				console.log(drink)
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

///// LOAD DRINK CARD ON RELOAD BUTTON /////
function reloadDrink(id) {
	getDrinkById(id)
}

function alertUser(message) {
	alertMessage.innerText = message
	alertModal.classList.remove('hide')
}

////// GLOBAL LISTENERS ///////
addFavoriteButton.addEventListener('click', addFavorite)
searchForm.addEventListener('submit', getDrinkByName)
ingredientInput.addEventListener('change', getDrinkByIngredient)
closeButton.addEventListener('click', () => {
	alertMessage.innerText = ''
	alertModal.classList.add('hide')
})

