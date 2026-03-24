// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0;
let timeLeft = 30;
let timerInterval; // Controls the countdown timer

const winningMessages = [
  "Amazing work! You reached the water goal!",
  "Victory! Every drop you caught makes a difference!",
  "Great job! You crushed the challenge!",
];

const losingMessages = [
  "Nice try! Play again and go for 20 drops!",
  "You are close. Give it another shot!",
  "Keep going. The next round can be your win!",
];

const scoreSpan = document.getElementById("score");
const timeSpan = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const gameWrapper = document.querySelector(".game-wrapper");

function updateGameStateUI() {
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
}

function setScore(newScore) {
  score = newScore;
  updateGameStateUI();
}

function setTimeLeft(newTimeLeft) {
  timeLeft = newTimeLeft;
  updateGameStateUI();
}

// Show the initial score/time values as soon as the script loads
updateGameStateUI();

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  const previousEndMessage = document.getElementById("end-message");
  if (previousEndMessage) {
    previousEndMessage.remove();
  }

  // Reset game state and UI
  setScore(0);
  setTimeLeft(30);

  // Remove any drops left from a previous round
  gameContainer.innerHTML = "";

  // Ensure old intervals are cleared before starting fresh
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  gameRunning = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Decrease timer every second and stop game at zero
  timerInterval = setInterval(() => {
    setTimeLeft(timeLeft - 1);

    if (timeLeft === 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  gameContainer.innerHTML = "";

  const messages = score >= 20 ? winningMessages : losingMessages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const endMessage = document.createElement("div");
  endMessage.id = "end-message";
  endMessage.textContent = messages[randomIndex];

  const playAgainButton = document.createElement("button");
  playAgainButton.id = "play-again-btn";
  playAgainButton.textContent = "Play Again";
  playAgainButton.addEventListener("click", () => {
    window.location.reload();
  });

  endMessage.appendChild(playAgainButton);
  gameWrapper.appendChild(endMessage);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  const isBadDrop = Math.random() < 0.2;
  if (isBadDrop) {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  drop.addEventListener("click", () => {
    const points = isBadDrop ? -1 : 1;
    setScore(score + points);
    drop.remove();
  });

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
