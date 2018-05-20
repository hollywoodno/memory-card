import Card = require('./card');

const container = document.getElementsByClassName('container')[0];
const matchedCards: Set<string> = new Set([]);
const facedUpCards: Set<Element> = new Set([]);

const topTechTheme: ITheme = {
    name: 'Top Tech Companies',
    element: 'i',
    icons: ['fab fa-amazon', 'fab fa-google', 'fab fa-facebook-f',
        'fab fa-apple', 'fab fa-slack-hash', 'fab fa-github',
        'fab fa-microsoft', 'fab fa-linkedin-in'
    ]
};

/**
 * Generates deck of game cards from a theme
 * @param theme
 */
const makeCards = (theme: ITheme) => {

    const deck: Card.Card[] = [];

    for (const index of theme.icons.keys()) {
        const newCards = [
            new Card.Card(
                topTechTheme.icons[index],
                topTechTheme.name,
                new Set(['card'])
            ),
            new Card.Card(
                topTechTheme.icons[index],
                topTechTheme.name,
                new Set(['card'])
            )
        ];

        deck.push(...newCards);
    }
    return deck;
};

/**
 * Randomize position of elements in an array
 * Shuffle function from http://stackoverflow.com/a/2450976
 * updated to es6
 * @param any
 */
const shuffle = (array: any[]) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

/**
 * Makes a gameboard in the DOM from a deck of cards
 * @param deck
 */
const buildGameBoard = (deck: Card.Card[]) => {

    const fragHelper = () => {
        const frag = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.classList.add('deck');

        // Create DOM elements from the cards
        for (const card of deck) {
            const li = document.createElement(card.html);
            const icon = document.createElement(topTechTheme.element);

            li.classList.add(...card.classes.values());
            li.setAttribute('data-icon', card.icon);
            // li.classList.add('match');
            icon.classList.add(...card.icon.split(' '));
            li.appendChild(icon);

            ul.appendChild(li);
        }

        frag.appendChild(ul);
        return frag;
    };

    container.appendChild(fragHelper());
};

const isFlippable = (event: any) => {
    if (event === null ||
        event === undefined ||
        event.target === null ||
        (event.target.classList.contains('match') || event.target.classList.contains('show')) ||
        (event.target.nodeName !== 'LI' && event.target.nodeName !== 'I') ||
        facedUpCards.size > 1) {

        console.log('validation failed!');
        return false;
    }

    return true;
};

const faceUp = (element: any) => {
    element.classList.add(...['open', 'show']);
    updateFaceUpCards('add', element);

    // TODO: Consider optimization - reduce number of reflows
};

const faceDown = (element: any, icon?: Element) => {
    element.classList.remove(...['open', 'show']);

    icon ? updateFaceUpCards('delete', icon) : updateFaceUpCards('clear');

    /*
    TODO:
        Consider optimization - reduce number of reflows
        Why two parameters - refactor this function
    */
};

const updateFaceUpCards = (action: string, icon?: Element) => {
    switch (action) {
        case 'add':
            if (icon) { facedUpCards.add(icon); }
            break;
        case 'clear':
            facedUpCards.clear();
            break;
        case 'delete':
            if (icon) { facedUpCards.delete(icon); }
    }
};

const isMatch = (element: any) => {
    if (facedUpCards.size < 1) { return false; }

    const card1: Element = facedUpCards.values().next().value;

    if (card1.getAttribute('data-icon') === element.getAttribute('data-icon')) {
        return true;
    }

    return false;
};

const confirmMatch = (element: any) => {
    // Cards should be emptied from faced up list
    updateFaceUpCards('clear');

    // Find the card by their data attribute and add match class
    const icon = `${element.getAttribute('data-icon')}`;
    const matches = document.querySelectorAll(`li[data-icon*="${icon}"`);

    matches.forEach((e: Element) => {
        e.classList.add('match');
    });

    // TODO: Consider optimization - reduce number of reflows
};

const failMatch = () => {
    setTimeout(() => {
        // If no match we have to face the cards down
        facedUpCards.forEach((i) => {
            faceDown(i, i);
        });
    }, 3000);
};

const processMove = (event: any) => {
    const target = event.target;

    // Get the card type
    const icon = `${target.getAttribute('data-icon')}`;

    // Show the card
    faceUp(event.target);

    // User is flipping first card
    if (facedUpCards.size < 2) { return; }

    // Attempting to make a match
    if (isMatch(target)) {
        console.log(' a match!');
        confirmMatch(target);
    } else {
        console.log('no match');
        failMatch();
    }

    // TODO: consider event propagation
};

//////////////////////////
// Listeners
container.addEventListener('click', (event: any) => {

    // Validate element is flippable
    if (!isFlippable(event)) { return; }

    // Process user's move
    processMove(event);
});

//////////////////////////

const newDeck: Card.Card[] = shuffle(makeCards(topTechTheme));
buildGameBoard(newDeck);
