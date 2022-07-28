const GENERIC_COCKTAIL_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f='


function getDrinkByFirstLetter() {
let firstLetter = 'o'
    axios.get(`${GENERIC_COCKTAIL_URL}${firstLetter}`)
    .then(response => {
        displayCocktail(response.data)
    })
    .catch(error => {
        console.log(error)
    })
  
}

getDrinkByFirstLetter()

function displayCocktail(cocktail) {

    // let input = document.querySelector('drink-input')
    // let selected = input.value
    let currentDrink = cocktail.drinks[0]
    console.log(currentDrink)

    ////// DRINK CARD //////
    let drinkCard = document.querySelector('.drink-card')
    let drinkName = document.createElement('h1')
    drinkName.classList.add('drink-name')
    drinkCard.appendChild(drinkName)
    drinkName.innerText = currentDrink.strDrink

    ////// PICTURE //////
    let pic = document.createElement('img')
    pic.src = `${currentDrink.strDrinkThumb}`
    drinkCard.appendChild(pic)

    ////// INGREDIENTS LIST //////
    let ingredientsList = document.createElement('ul')
    ingredientsList.classList.add('ingredients-list')
    drinkCard.appendChild(ingredientsList)
    let ingredientsListTitle = document.createElement('h2')
    ingredientsListTitle.innerText = 'Ingredients'
    ingredientsListTitle.classList.add('ingredients-list-title')
    ingredientsList.appendChild(ingredientsListTitle)

    for (let i = 1; i <= 15; i++) {

        if(currentDrink[`strIngredient${i}`] == null || currentDrink[`strIngredient${i}`] === '') {
            break;
        }
        if(currentDrink[`strMeasure${i}`] == null) {
            currentDrink[`strMeasure${i}`] = ''
        }

        let ingredient = document.createElement('li')
        ingredient.classList.add('ingredient')
        ingredient.innerText = `${currentDrink[[`strMeasure${i}`]]} ${currentDrink[[`strIngredient${i}`]]}`
        ingredientsList.appendChild(ingredient)
    }

    ////// GLASS //////
    let glass = document.createElement('h3')
    glass.classList.add('glass-name')
    glass.innerText = `Glass: ${currentDrink.strGlass}`
    ingredientsList.appendChild(glass)

    ////// DIRECTIONS //////
    let directionsCard = document.createElement('div')
    directionsCard.classList.add('directions-card')
    directionsCard.innerHTML = currentDrink.strInstructions
    drinkCard.appendChild(directionsCard)

    
}

// let form = document.querySelector('form')
// form.addEventListener('submit', getDrinkByFirstLetter)








