/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "initialize" }]*/

// Configuration
const config = {
	cardCount: 16, // HTML currently limits game to 16 cards
	cardIcons: ["otter", "spider", "kiwi-bird", "frog", "fish", "feather-alt", "dragon", "cat", "dog", "anchor", "archway", "baby", "bell", "biking", "binoculars", "bug", "bomb", "carrot", "child", "coffee", "crown", "bullhorn"]
}

// For stats:
let startTime;
let myTimer;
let moves;
let stars;

// Setup: initialize card array, add event listeners, reset UI:
function initialize() {

	// State array for cards:
	let cards = [];
	for (let i = 0; i < config.cardCount; i++) {
		cards.push({
			id: `card${i + 1}`,
			icon: "",
			turned: false,
			solved: false
		});
	}

	// Save element handles to array:
	for (let card of cards) {
		card.element = document.querySelector(`#${card.id}`);
	}

	// General event listener:
	document.querySelector("body").addEventListener("click", function() { clicked(cards); });

	// Restart button:
	document.querySelectorAll("i.restart").forEach(e => e.addEventListener("click", function() { restart (cards); }));

	restart(cards);

}

// Start and restart the game:
function restart(cards) {

	// Reset stats:
	moves = 0;
	startTime = 0;
	stars = 5;
	if (typeof myTimer !== "undefined") {
		clearInterval(myTimer);
	}

	// Reset cards:
	for (let card of cards) {
		card.turned = false;
		card.solved = false;
		card.icon = false;
		card.element.classList.remove("winner");
	}

	// Reset modal:
	document.querySelector("container.modal .overlay").style.opacity = 0;
	document.querySelectorAll(".pulse").forEach(i => {i.style.transform = "scale(1)";});
	document.querySelector("container.game").style.removeProperty("filter");
	document.querySelector("container.modal").style.display = "none";


	// Distribute icons in random order:
	let cardsToPaint = cards;
	for (let i = 0; i < config.cardCount / 2; i++) {
		let currentIcon = "";
		do {
			currentIcon = config.cardIcons[Math.floor(Math.random() * config.cardIcons.length)];
		} while (cards.map(c => c.icon).includes(currentIcon)) 
		cardsToPaint[Math.floor(Math.random() * cardsToPaint.length)].icon = currentIcon;
		cardsToPaint = cardsToPaint.filter(c => !c.icon);
		cardsToPaint[Math.floor(Math.random() * cardsToPaint.length)].icon = currentIcon;
		cardsToPaint = cardsToPaint.filter(c => !c.icon);
	}

	// Paint cards:
	for (let card of cards) {
		card.element.querySelector("div.front i").setAttribute("class", `fas fa-${card.icon}`);
	}

	writeCardStates(cards);
	writeStats(moves);

}

// Click-handler: react to user click on card:
function clicked(cards) {

	// Check, whether event is coming from a card:
	if (event.target.parentNode.classList.contains("card")) {
		
		// Stats:
		moves++;
		if (!startTime) {
			startTimer();
		}
		
		// Get card:
		const cardId = event.target.parentNode.id;
		const cardClicked = cards.find(c => c.id === cardId);

		if (cardClicked) {

			// Is it a turned-open card? If yes just turn it back:
			if (cardClicked.turned) {
				cardClicked.turned = false;
			}
			else {
				// Find out how many cards are currently turned-open and react accordingly:
				// QUESTION: Originally, I used cards.filter to get the turned cards. However, as that's a copy, I couldn't edit them. Is there some way to filter an array and get the elements in-place?
				const intCardsTurned = cards.filter(c => (c.turned && !c.solved)).length;
				if (intCardsTurned < 1) {
					cardClicked.turned = true;
				}
				else if (intCardsTurned < 2) {
					// There might be a solve:
					for (let card of cards) {
						if (card.turned && (card.icon === cardClicked.icon)) {
							card.solved = true;
							cardClicked.solved = true;
						}
					}
					if (cardClicked.solved) {
						stars++;
					}
					else {
						stars--;
					}
					cardClicked.turned = true;
					// There might even be a win:
					if (cards.filter(c => c.solved).length > 15) {
						youWon(cards);
					}
				}
				else {
					for (let card of cards) {
						if (!card.solved) {
							card.turned = false;
						}
					}
					cardClicked.turned = true;
				}
			}

		}
		if (stars < 0) stars = 0;
		if (stars > 5) stars = 5;
		writeCardStates(cards);
		writeStats(moves, stars);
	}
}

// Helper: Write state array to UI (only write changes to avoid performance impediments):
function writeCardStates(cards) {
	for (let card of cards) {
		if (card.element.classList.contains("turned") !== card.turned) {
			card.element.classList.toggle("turned");
		}
		if (card.element.classList.contains("solved") !== card.solved) {
			card.element.classList.toggle("solved");
		}
	}
}

// Helper: Write stats to UI:
function writeStats(moves) {
	document.querySelector("nav .moves").innerText = moves;
	colorIcons("nav .stars i", stars)
}

// Helper: color stars:
function colorIcons (querySelector, intColor) {
	document.querySelectorAll(querySelector).forEach(function(e, i) {
		if (i < intColor) {
			e.classList.add("fas");
			e.classList.remove("far");
		}
		else {
			e.classList.add("far");
			e.classList.remove("fas");
		}
	})
}

// Helper: start timer:
function startTimer() {
	startTime = Date.now();
	const elementTime = document.querySelector("nav .time");
	elementTime.innerText = 0;
	myTimer = setInterval(function() {
		elementTime.innerText = parseInt((Date.now() - startTime) / 1000)		;
	}, 1000);
}

// Decorative: Winning function with modal:
function youWon(cards) {
	for (let card of cards) {
		card.element.classList.add("winner");
	}
	clearInterval(myTimer);
	document.querySelector(".modal .time").innerText = parseInt((Date.now() - startTime) / 1000);
	document.querySelector(".modal .moves").innerText = moves;
	colorIcons(".modal .stars i", stars)
	document.querySelector("container.modal").style.display = "block";
	setTimeout(function() {
		document.querySelector("container.game").style.filter = "blur(10px)";
		document.querySelectorAll(".pulse").forEach(i => {i.style.transform = "scale(300)";});
		document.querySelector("container.modal .overlay").style.opacity = 1;
	}, 0)
}