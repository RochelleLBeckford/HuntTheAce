// Create cards dynamically

/* 
Create an array of objects
    -> each array item is a card -> card definition
*/

const cardObjectDefinitions = [
    // has an id prop. and an image path for that card [in ''s use what you saved the name of what the image is]
    {id: 1, imagePath: '/images/cardKingHearts.png'},
    {id: 2, imagePath: '/images/cardJackClubs.png'},
    {id: 3, imagePath: '/images/cardQueenDiamonds.png'},
    {id: 4, imagePath: '/images/cardAceSpades.png'}
]

// ? declare the id for the ace of spades which will be used in the evaluateCardChoice function to decide whether the card chosen is the Ace of Spades or not
const aceId = 4;

// ? create a const that stores a path for the img the represents the back of the card
const cardBackImgPath = '/images/cardBackBlue.png';

// ? stores a reference to an array of card elements
let cards = [];

//? reference to store start game method
const playGameBtnElem = document.getElementById('playGame');

// ? contains the grid cells that this element has been designated
const cardContainerElem = document.querySelector('.card-container');

// ? collapse all the cards to one grid cell
const collapsedGridAreaTemplate = '"a a" "a a"';
// ? store the class of the grid element that will be the only cell in the grid once modify gridareatemplate property
// choosing 1st cell in the grid to collect all the stacked cards 
const cardCollectionCellClass = ".card-pos-a";

// ? the number of cards
const numCards = cardObjectDefinitions.length

// ? store an array of card positions w/in the grid
let cardPositions = [];

// ? declare and initialzie Var's involved in the expression for choosing a card
let gameInProgress = false;
let shufflingInProgress = false;
let cardsRevealed = false;

/*
-> updateStatusElement(currentGameStatusElem, "block", winColor, "Hit!! - Great Job!! : )")
-> this element will be updated throughout the game \
*/
const currentGameStatusElem = document.querySelector('.current-status');
// ? this will store the container element for the score
const scoreContainerElem = document.querySelector('.header-score-container');
// ? store the score element
const scoreElem = document.querySelector('.score');
// ? this will store the container element for the round 
const roundContainerElem = document.querySelector('.header-round-container');
// ? store the round element
//* A bug occured since i referred to round when the variable is roundNum
const roundElem = document.querySelector('.round');

// ? if the user guesses the correct card -> the output text will be green 
const winColor = "green";
// ? if the user guesses the incorrect card -> the output text will be red 
const loseColor = "red";
// ? when a new round is initialized the updateStatus output text will be black 
const primaryColor = "black";

// ? declare and initialize var's regarding the rounds of the game
let roundNum = 0;
let maxRounds = 4;
let score = 0;

// ? declare and initialize var's regarding the local storage
let gameObj = {};
// ~ unique key to identify incomplete game key in local storage
const localStorageGameKey = "HTA";

// * the html that made a static card -> use this as a guide to make dynamic code ?
/* 
    <div class="card">
        <div class="card-inner">
            <div class="card-front">
                <img src="/images/cardJackClubs.png" alt="Jack Of Clubs Card" class="card-img">
            </div>
            <div class="card-back">
                <img src="/images/cardBackBlue.png" alt="Back of the card is Blue" class="card-img">
            </div>
        </div>
    </div> 
*/
// ****************************************************************************************************

loadGame();
// createCards();
// ? when game over want the score and the round # to be hidden and output message stating this will be presented to the user
function gameOver() {
    updateStatusElement(scoreContainerElem, "none");
    updateStatusElement(roundContainerElem, "none");

    const gameOverMessage = `Game Over!! Final Score - <span class='badge'>${score}</span> Click 'Play Game' button to play again`;

    updateStatusElement(currentGameStatusElem, "block", primaryColor, gameOverMessage);

    gameInProgress = false;
    playGameBtnElem.disabled = false;
}

function endRound() {
    // & ensures that if the game is not over the next round will begin in 3 seconds aka 3000 milliseconds
    setTimeout(() => {
        if (roundNum == maxRounds) {
            // & if game is over output text will emphasis so and a new round will not start
            gameOver();

            return;

        }else {
            startRound();
        }
    }, 3000);
}

/*
? Choose Card -> User making a choice to pick the card that they believe to be the Ace of Spades
~ Now to make functionality that if the user chooses a card they believe to be the Ace of Spades 
-> the card the is chosen will flip to the front and the user will then be made aware if their choice was correct or not 
-> if the user choice is correct -> user will be awarded point depending on the round number that is played
-> if user choice is incorrect -> user ios awarded no points
-> must include a card param
*/
function chooseCard(card) {
    if (canChooseCard()) {
        // -> must include a card param 
        evaluateCardChoice(card);
        // & save data pertaining to a game after the user has selected a card
        saveGameObjectToLocalStorage(score, roundNum);
        // -> when a card is chosen by the user we want the card to flip to the front
        flipCard(card, false);
        
        /*        
        ~ -> 3 seconds = 3000 miliseconds after the user makes a guess flip the cards
            -> want all the cards to be revealed to the user so that the user can see where the Ace of Spades actually is if the user did not choose it
        */
        setTimeout(() => {
            flipCards(false);
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "Card positions revealed");

            // & test to see if the final round [the 4th round] has been reached by the user
            endRound();

        }, 3000);
        cardsRevealed = true;
    }
    // ~ inorder for the choose card element to run in response to user clicking the back of the card need to add an event listener to each card element
}

// ? this method states how many points each round contains and those points depending on the round will be added to the score
function calculateScoreToAdd(roundNum) {
    if (roundNum == 1) {
        return 100;
    }
    
    else if (roundNum == 2) {
        return 50;
    }
    
    else if (roundNum == 3) {
        return 25;

    }else{
        return 10;
    }
}

// ? this method calculates the # of points to update to the users scrore
function calculateScore() {
    // the # of point to add to the score depends on the round #
    const scoreToAdd = calculateScoreToAdd(roundNum);
    score = score + scoreToAdd;
}

// ? this method updates the score
function updateScore() {
    // discovers the # of points to add to the users score in regard to the specific round
    calculateScore();
    // & when the score changes this will reflect it to the user
    updateStatusElement(scoreElem, "block", primaryColor, `Score <span class='badge'>${score}</span>`);
}

// ? method to update the status element
// ~ certain times only want to make the update status visible or invisible w/o updating the relevant elem text
function updateStatusElement(elem, display, color, innerHTML) {

    elem.style.display = display;

    /*
    ~  if there is more than 2 arguements called then the text needs to update of the relevant elem and possibly update the color of the text as well 
    -> techique for method overloading in js
    */
    if (arguments.length > 2) {
        elem.style.color = color;
        elem.innerHTML = innerHTML;
    }
}

// ? if the user hits the target -> output a message regarding the choice made by the user
function outputChoiceFeedBack(hit) {
    // message for the winning choice
    if (hit) {
        updateStatusElement(currentGameStatusElem, "block", winColor, "Hit!! - Great Job!! :)")

    } else {
        updateStatusElement(currentGameStatusElem, "block", loseColor, "Missed!! - Sorry Try Again :(")
    }
}

// ? Evaluation functionality -> evaluates the users choice of card
// ~ Evaluates whether the card the user chooses is the Ace of Spades or not 
function evaluateCardChoice(card) {
    // evaluate whether the id if the card chosen is the id of the Ace of Spades
    if (card.id == aceId) {
        // if the users choice is correct -> update the score appropriately
        updateScore();
        outputChoiceFeedBack(true);

    } else {
        outputChoiceFeedBack(false);
    }
}

//? Create a method that can choose a card
function canChooseCard() {
    /*    
    ~ Instances we do not want the user to click on the back of the cards -> like when the cards are being shuffled
    ~ do not want the chooseCard function to execute while the cards are shuffling 
    ~ this will return a boolean value to indicate whether the game is in the right state where the chooseCard functionality can run
    ~ basically if the game is in progress and shuffling is not in progress and the cards are not in the process of being revealed the expression returns true
        -> when the expression returns true the user us able to choose a card
        -> if returns false -> the function chooseCard method will not be executed if a card is clicked
    */
    return gameInProgress == true && !shufflingInProgress && !cardsRevealed;
}

//? create a method that will load the game when it first lauches -> want cards to be created dynamically when the game is 1st launch
    // will call createCards method from w/i the loadGame method
function loadGame() {
    createCards();

    // ~ results for a query of all card elements to card []
    cards = document.querySelectorAll('.card');

    // ~ want the fly-in effect to be executed when the game 1st loads
    // -> needs to be added to each card as it is created 
    cardFlyInEffect();

    // ~ wire up click event handler to playGame game btn event 
    // when user clickes start game btn the start game function needs to be called
    playGameBtnElem.addEventListener('click', () => startGame());

    // ~ when game first load do not want the score and the round # to be displayed to the user
    updateStatusElement(scoreContainerElem, "none");
    updateStatusElement(roundContainerElem, "none");
}

/*
? check for incomplete game
~ this method will check local storage for a unique for an incomplete game
-> if the key exists in local storage that means the user has data for an incomplete game saved to local storage
*/
function checkForIncompleteGame() {
    const serializedGameObj = getLocalStorageItemValue(localStorageGameKey);
    // & if the relevant key exists -> ask the user if they want to continue the game the left off
    if (serializedGameObj) {
        gameObj = getObjectFromJSON(serializedGameObj);

        if (gameObj.round >= maxRounds) {
            removeLocalStorageItem(localStorageGameKey);

        } else {
            if (confirm('Would you like to continue where you left off?')) {
                // & if user press 'ok' btn then the game will update the score and round # from the previous incomplete game saved to local storage
                // -> the score and round # will be initialized to 0 if the user does not choose to click ok 
                score = gameObj.score;
                round = gameObj.round;
            }
        }
    }
}

// ? create a method called to start the game -> called when the user clicks the button to start the game
// i.e. the game play button
function startGame() {
    // ~ test if event listener is working 
    // it works
    // alert('')

    initializeNewGame();
    startRound();
}

// ? method to initialize a new game
function initializeNewGame() {
    score = 0;
    roundNum = 0;

    checkForIncompleteGame();

    shufflingInProgress = false;

    // ~ when a new game is started want to make the score and round elemenets visible to the user
    updateStatusElement(scoreContainerElem, "flex");
    updateStatusElement(roundContainerElem, "flex");

    // ~ update the score and round elements with the appropriate values
    updateStatusElement(scoreElem, "block", primaryColor, `Score <span class='badge'>${score}</span>`);
    //* A bug occured since i referred to round in the <span> when the variable is roundNum -> changed this correctly 
    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>`);
}

// ? create method that will be called when a new round has begun
function startRound() {
    initializeNewRound();
    collectCards();
    /*
    ~ commenet this out to test if the positions of the cards are being randomized by shuffle functionality -> if so then on to choosing a card
    -> now to remove all the borders and background colors from the grid cell's to get an idea of what the game looks like thus far
    */
    flipCards(true); // have this set tp true 
    shuffleCards();
}

// ? create a method that will initialize a new round 
function initializeNewRound() {
    roundNum++;
    playGameBtnElem.disabled = true;

    gameInProgress = true;
    shufflingInProgress = true;
    cardsRevealed = false;

    // ? when a round is started want to update the status of the game in black text
    // -> when a new round begins the 1st thimg that occurs is that the cards are shuffled
    updateStatusElement(currentGameStatusElem, "block", primaryColor, "Shuffling....")

    // ? when a new round is started want the round to be updated appropriately 
    //* A bug occured since i referred to round in the <span> when the variable is roundNum -> changed this correctly
    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>`)
}


// ^ Before game starts want the user to see the cards stacked on one another in the center of the game play grid
// will first collapse the grid into one cell and we will add all the cards to this one cell
// ? create a method to collect all the cards
function collectCards() {
    // pass in method we just created to collapse cards as a param
    transformGridArea(collapsedGridAreaTemplate);
    addCardsToGridAreaCell(cardCollectionCellClass);
}

// ? transform grid area method -> will change grid area properties
function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas;
}

// ? method to add card to the cell that takes up the entire grid
// -> now with this method the grid would contain only one cell 
function addCardsToGridAreaCell(cellPositionClassName) {
    const cellPositionElem = document.querySelector(cellPositionClassName);

    cards.forEach((card, index) => {
        addChildElement(cellPositionElem, card);
    })
}

// ~ has 2 params -> 1st store the relevant card element and 2nd the boolean flip to back value
function flipCard(card, flipToBack) {
    /*
    -> the inner card element is used to flip the card
    -> use the first child property to reference the inner child element
    */
    const innerCardElem = card.firstChild

    if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.add('flip-it');
    }
    /*
    ~ if card is already back facing do not want to flip the card so that it will be front facing 
    -> thus if it does contain flip-it remove it
    */
    
    else if(innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.remove('flip-it');
    }
}

// ? Flip the card -> if the card is on it's front it and the flipToBack arg. is true -> it will flip to it's back 
    // -> the back of the card will be facing the user flip the card if the arg is true so that the back of the card is facing the user
function flipCards(flipToBack) {
    // make sure all cards are traversed and flipped if need be
    cards.forEach((card, index) => {
        // use this method to that each card is flipped at a different time -> create a simple animation where the cards are flipped at milliseconds 
        setTimeout(() => {
            flipCard(card, flipToBack)
        }, index * 100);
    });
}

// ? create a method to have a fly-in affect -> want the cards to fly in from the left side of the screen when the game first loads 
// ~ -> the cards will be positioned appropriately off screen so when the fly-in is removed the cards will go to their original position on the grid
// -> remove the fly-in elements and controlled time intervals 
function cardFlyInEffect() {
    const id = setInterval(flyIn, 5);
    let cardCount = 0;

    let count = 0;

    function flyIn() {
        count++;
        if (cardCount == numCards) {
            clearInterval(id);

            // & display of btn set to inline-block after the fly-in effect completes
            playGameBtnElem.style.display = "inline-block";
        }

        // & controlling when the flyIn class is removed from the relevant card element
        if (count == 1 || count == 250 || count == 500 || count == 750) {
            cardCount++;
            let card = document.getElementById(cardCount);
            card.classList.remove("fly-in");
        }
    }

}

// ? create a method to make sure that once shuffling is completed that none of the card elements contain the shuffle left class or the right class
function removeShuffleClasses() {
    cards.forEach((card) => {
        card.classList.remove("shuffle-left");
        card.classList.remove("shuffle-right");
    });
}

// ? create a method to create the illusion of the cards being shuffled
function animateShuffle(shuffleCount) {
    // ~ will be a numeric arg. that passes through the param which will be a numeric value the increments each time the function is called
    const random1 = Math.floor(Math.random() * numCards) + 1;
    const random2 = Math.floor(Math.random() * numCards) + 1;

    // ~ generate random numbers btw 1 & 4
    // & reference 2 cards of the 4 cards randomly through the 2 random #'s being generated in this method
    let card1 = document.getElementById(random1);
    let card2 = document.getElementById(random2);

    // ~ modify the positions of the cards
    // & when the result of the shuffleCount value is / by 4 and does not have a remainder then the toggle left class will be executed 
    if (shuffleCount % 4 == 0) {
        card1.classList.toggle("shuffle-left");
        card1.style.zIndex = 100;
    }
    
    // & when the result of the shuffleCount value is / by 10 and does not have a remainder then the toggle right class will be executed 
    if (shuffleCount % 10 == 0) {
        card2.classList.toggle("shuffle-right");
        card2.style.zIndex = 200;
    }
    // * cards are selected at random and will create the illusion that the cards are being shuffled
}

// ? create a method to randomize the cards
function shuffleCards() {
    // count the amt of times the shuffle method is called
    let shuffleCount = 0;
    // use setInterval method to create a shuffle every so milliseconds -> every 12th milliseconds the shuffle method will execute
    const id = setInterval(shuffle, 12);

    function shuffle() { 
        /*
        ~ call the method to randomize cards
        -> this will be continously called until the clear interval method is executed from w/i the shuffle method
        -> the cards should now be unpredictable to the user
        */
        randomizeCardPositions();

        animateShuffle(shuffleCount);

        // ~ when the shuffle count is equal to 500 -> will use clearInterval method to stop the shuffle method from being called
        if (shuffleCount == 500) {
            clearInterval(id);
            // & need to set shuffle to false so that chooseCard funtionality works as expected
            // i.e. this code excutes once the shuffle is complete
            shufflingInProgress = false;

            // & remove the shuffle classes 
            removeShuffleClasses();

            // & create a method to deal cards when the shuffle count equals 500 aka called only after the shuffling of the card is complete
            dealCards();
            
            // & output text to the user
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "Please click the card that you think is the Ace of Spades :)....." )

        } else{
            // this will increment each time the shuffle function is called 
            shuffleCount++;
        }
    }
}

// ? create a method to randomize cards
function randomizeCardPositions() {
    /*
    ~ want 2 random numbers generating
    -> generate a random # btw 1 & 4 since length is 4 since that is the number of cards
    */
    const random1 = Math.floor(Math.random() * numCards) + 1;
    const random2 = Math.floor(Math.random() * numCards) + 1;

    const temp = cardPositions[random1 - 1]; 
    // can use these random numbers to swap the position values with the relevant cards in the cardPositions array

    // ~ shuffle like affect for the 4 cards
    cardPositions[random1 - 1] = cardPositions[random2 - 1];
    cardPositions[random2 - 1] = temp;
}

// ? this function will restore the grid to contain 4 grid cells and add each card back to it's origional position in the grid
// the positions will be altered according the randomized position array since the positions will be shuffled every time the playGame btn is invoked
function dealCards() {
    // ~ this will store the grid to it's original state w/ 4 cells and each cell containing a card element
    addCardsToAppropriateCell();
    // ~ will return a grid area template value containing a new position config. of the grid cells based on the random positions stored in the array
    const areasTemplate = returnGridAreasMappedToCardPos();

    // ~ transform the grid to change the pos. of the grid cells by assigning the grid the new grid area template value returned from the returnGridAreasMappedToCardPos
    transformGridArea(areasTemplate);
}

// ? create a method that generates a new area template that contains the new position of the cells based on the random postions generated by shuffle functionality
function returnGridAreasMappedToCardPos() {
    let firstPart = "";
    let secondPart = "";
    let areas = "";

    cards.forEach((card, index) => {
        if (cardPositions[index] == 1) {
            areas = areas + "a ";
        }
        
        else if (cardPositions[index] == 2) {
            areas = areas + "b ";
        }
        
        else if (cardPositions[index] == 3) {
            areas = areas + "c ";
        }
        
        else if (cardPositions[index] == 4) {
            areas = areas + "d ";
        }

        if (index == 1) {
            firstPart = areas.substring(0, areas.length - 1);
            areas = "";
        }
        else if (index == 3) {
            secondPart = areas.substring(0, areas.length - 1)
        }
        
    })
    
    return `"${firstPart}" "${secondPart}"`;
}

// ? create a method that will add the cards to the appropriate cell 
function addCardsToAppropriateCell() {
    // ~ will pass in each card to the addCardToGridCell w/i a loop that will traverse all of the card elements 
    cards.forEach((card) => {
        addCardToGridCell(card);
    })
}


// ? create a method that will loop through each of the card definition that are stored -> create dynamic cards
    // ~ create the cards and add to respective grid positions
function createCards() {
    cardObjectDefinitions.forEach((cardItem) => {
        createCard(cardItem)
    });
}

// ? create a function to create a card dynamically -> card elements ?
// it takes one arguement
function createCard(cardItem) {
    // ? create div elements that make up a card
    // ~ 1. the card element div
    // const cardElem = document.createElement('div');
    const cardElem = createElement('div');
    
    // ~ 2. an inner card element div 
    const cardInnerElem = createElement('div');
    
    // ~ 3. The front and back element are within the inner card element div
    const cardFrontElem = createElement('div');
    const cardBackElem = createElement('div');

    // ? create img elements that are for the front and back elements of each card ? 
    const cardFrontImg = createElement('img');
    const cardBackImg = createElement('img');

    // ? add the card class and id to the card element
    addClassToElement(cardElem, 'card');
    // ~ want the fly-in effect to be executed when the game 1st loads
    // -> needs to be added to each card as it is created 
    addClassToElement(cardElem, 'fly-in');
    addIdToElement(cardElem, cardItem.id);

    // ? add class to inner card element
    addClassToElement(cardInnerElem, 'card-inner');

    // ? add class to front card element
    addClassToElement(cardFrontElem, 'card-front');

    // ? add class to back card element
    addClassToElement(cardBackElem, 'card-back');

    // * Bug Happened -> the img was being added to the front and back div elements instead of the img elements
    // ~ -> the below now references the front and back img elements and not the div elements

    // ? add src attribute and appropriate value to img element - back of card
    addSrcToImgElem(cardBackImg, cardBackImgPath);

    // ? add src attribute and appropriate value to img element - front of the card
    addSrcToImgElem(cardFrontImg, cardItem.imagePath);

    // ? assign card-img class to the image elements -> back of the card
    addClassToElement(cardBackImg, 'card-img');

    // ? assign card-img class to the image elements -> front of the card
    addClassToElement(cardFrontImg, 'card-img');
    // ********************************************************************************************

    // ? add the child elements to their respective parent elemenets
    // ~ add front card img element as a child element for the front of the card element
    addChildElement(cardFrontElem, cardFrontImg);

    // ~ add back card img element as a child element for the back of the card element
    addChildElement(cardBackElem, cardBackImg);

    // ? add the children: front card element and the back card element to the parent: inner card element
    // ~ add front card element to the inner card element
    addChildElement(cardInnerElem, cardFrontElem);

    // ~ add back card element to the inner card element
    addChildElement(cardInnerElem, cardBackElem);

    // ? add the child: inner card element to the parenmt: card element
    addChildElement(cardElem, cardInnerElem);

    // ? Map each card element to it's initial position by mapping card id to respective elemenet that represents a grid cell
    // ~ add card element as a child to it's respective grid cell
    addCardToGridCell(cardElem);

    // ~ call the initialize card positions here so each initial position of the card is estbalished when the game is first loaded through the relative card element id 
    initializeCardPositions(cardElem);

    // ? an event listener will be attached to each element
    attachClickEventHandlerToCard(cardElem);
}

// ~ create a method to attach an event listener to each card element
function attachClickEventHandlerToCard(card) {
    // addEventListener will ensure that choose card method is called whenever a card is clicked 
    card.addEventListener('click', () => chooseCard(card));
}

// ~ create a method to initialize card posisitions
// stores then initial position of the card w/i the grid aka card gameplay area
function initializeCardPositions(card) {
    cardPositions.push(card.id);
}

// ~ create a reusable function to create an html element
function createElement(elemType) {
    return document.createElement(elemType)
};

// ~ create a reusable method that adds a class to an html element
function addClassToElement(elem, className) {
    elem.classList.add(className);
}

// ~ method that adds an id to an html element -> each card will be assigned a unique id 
function addIdToElement(elem, id) {
    // the id will come from the array object of card definitions
    elem.id = id;
}

// ~ method that adds a path to the relevant img to the src attribute of an img element
function addSrcToImgElem(imgElem, src) {
    imgElem.src = src;
}

// ~ method to assign the child elements to their respective parent element 
// this method adds the child element passed in a 2nd param to the parent element passed in as the 1st param
function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem);
}

// ~ method to add the card to it's grid cell 
function addCardToGridCell(card) {
    // ? const that stores a ref to the card element for when we write code to alter the positions of the cards -> this is to initialize the card positions where they will be played in the grid
    // find the parent element for the resepective child card element using the map id to grid cell method
    // each card element has a child element for their respective grid cell positions
    const cardPositionClassName = mapCardIdToGridCell(card);

    const cardPosElem = document.querySelector(cardPositionClassName);

    // ~ add card elemenent to it's respective parent element
    addChildElement(cardPosElem, card);
}   

// ~ method that maps card id to respective grid cell 
function mapCardIdToGridCell(card) {
    // if the card id is 1 -> want this card to be added as a child element to the 1st position of the grid which is told by the div element 
    if (card.id == 1) {
        return '.card-pos-a';
    } 
    // if the card id is 2 -> want this card to be added as a child element to the 2nd position of the grid which is told by the div element 
    else if (card.id == 2) {
        return '.card-pos-b';
    } 
    // if the card id is 3 -> want this card to be added as a child element to the 3rd position of the grid which is told by the div element 
    else if (card.id == 3) {
        return '.card-pos-c';
    } 
    // if the card id is 4 -> want this card to be added as a child element to the 4th position of the grid which is told by the div element 
    else if (card.id == 4) {
        return '.card-pos-d';
    } 
}

// *******************************************************************************************
/*
? local storage -> only use for non-sensitive data -> otherwise easy door for hackers
~ will be used to store incomplete game if for some reason user closers their browser before the game is complete
-> persist an obj to local storage in JSON format
-> pass in obj's through this method it will return a string value in JSON format that rep.'s the obj passed in through this method
-> will be able to save the returned string through local storage
*/
function getSerializedObjectAsJSON(obj) {
    return JSON.stringify(obj)
}

// ~ when read JSON format from local storage -> want to convert the JSON string back into JS obj
function getObjectFromJSON(json) {
    return JSON.parse(json);
}

// ~ this method saves a key value pair to local storage
// -> key is the unique identifier for the value that will be passed into the 2nd param -> which will be a string in JSON format representing a JS obj.
function updateLocalStorageItem(key, value) {
    localStorage.setItem(key, value)
}

// ~ this method will remove and item from the local storage
function removeLocalStorageItem(key) {
    localStorage.removeItem(key);
}

// ~ helper method that returns a value from local storage based on the key arg. passed into this method
function getLocalStorageItemValue(key) {
    return localStorage.getItem(key);
}

// ~ this method will persist the score and round #
function updateGameObject(score, round) {
    gameObj.score = score;
    gameObj.round = round;
}

// ~ this method will save the game object to local storage
function saveGameObjectToLocalStorage(score, round) {
    updateGameObject(score, round);
    updateLocalStorageItem(localStorageGameKey, getSerializedObjectAsJSON(gameObj));
}