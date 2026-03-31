// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0;
let difficulty = "Normal";
const difficultySettings = {
  Easy: {
    time: 30,
    winScore: 15,
    dropInterval: 1200,
  },
  Normal: {
    time: 25,
    winScore: 20,
    dropInterval: 1000,
  },
  Hard: {
    time: 20,
    winScore: 25,
    dropInterval: 750,
  },
};

let currentSettings = difficultySettings[difficulty];
let timeLeft = currentSettings.time;
let timerInterval; // Controls the countdown timer

const winningMessages = [
  "Amazing work! You reached the water goal!",
  "Victory! Every drop you caught makes a difference!",
  "Great job! You crushed the challenge!",
];

const losingMessages = [
  "Nice try! Play again and go for the goal!",
  "You are close. Give it another shot!",
  "Keep going. The next round can be your win!",
];

const milestones = [
  { score: 5, message: "Nice start!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "You're on fire!" },
];

const shownMilestones = new Set();

const scoreSpan = document.getElementById("score");
const timeSpan = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const gameWrapper = document.querySelector(".game-wrapper");
const difficultySelect = document.getElementById("difficulty-select");
const difficultyValue = document.getElementById("difficulty-value");

function applyDifficulty(newDifficulty) {
  difficulty = newDifficulty;
  currentSettings = difficultySettings[difficulty];
  difficultyValue.textContent = difficulty;
}

function showDropFeedback(drop, points) {
  const dropRect = drop.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  const feedback = document.createElement("div");
  feedback.className = "drop-feedback";
  feedback.textContent = points > 0 ? "+1" : "-1";

  if (points > 0) {
    feedback.classList.add("drop-feedback-good");
  } else {
    feedback.classList.add("drop-feedback-bad");
  }

  feedback.style.left = `${dropRect.left - containerRect.left + dropRect.width / 2}px`;
  feedback.style.top = `${dropRect.top - containerRect.top + dropRect.height / 2}px`;

  gameContainer.appendChild(feedback);

  // Remove after animation so feedback never lingers in the DOM.
  const cleanup = () => feedback.remove();
  feedback.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1000);
}

function showMilestoneMessage(message) {
  const milestoneMessage = document.createElement("div");
  milestoneMessage.className = "milestone-message";
  milestoneMessage.textContent = message;

  gameContainer.appendChild(milestoneMessage);

  const cleanup = () => milestoneMessage.remove();
  milestoneMessage.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1300);
}

function checkMilestone(currentScore) {
  const matchedMilestone = milestones.find(
    (milestone) => milestone.score === currentScore
  );

  if (!matchedMilestone || shownMilestones.has(matchedMilestone.score)) {
    return;
  }

  shownMilestones.add(matchedMilestone.score);
  showMilestoneMessage(matchedMilestone.message);
}

function updateGameStateUI() {
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
}

function setScore(newScore) {
  score = newScore;
  updateGameStateUI();
  checkMilestone(score);
}

function setTimeLeft(newTimeLeft) {
  timeLeft = newTimeLeft;
  updateGameStateUI();
}

// Show the initial score/time values as soon as the script loads
applyDifficulty(difficulty);
updateGameStateUI();

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

difficultySelect.addEventListener("change", (event) => {
  if (gameRunning) {
    return;
  }

  applyDifficulty(event.target.value);
  setTimeLeft(currentSettings.time);
});

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  applyDifficulty(difficultySelect.value);

  const previousEndMessage = document.getElementById("end-message");
  if (previousEndMessage) {
    previousEndMessage.remove();
  }

  // Reset game state and UI
  shownMilestones.clear();
  setScore(0);
  setTimeLeft(currentSettings.time);

  // Remove any drops left from a previous round
  gameContainer.innerHTML = "";

  // Ensure old intervals are cleared before starting fresh
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  gameRunning = true;
  difficultySelect.disabled = true;

  // Create new drops at the selected mode speed
  dropMaker = setInterval(createDrop, currentSettings.dropInterval);

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
  difficultySelect.disabled = false;
  gameContainer.innerHTML = "";

  const messages =
    score >= currentSettings.winScore ? winningMessages : losingMessages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const endMessage = document.createElement("div");
  endMessage.id = "end-message";
  if (score >= currentSettings.winScore) {
    endMessage.textContent = messages[randomIndex];
  } else {
    endMessage.textContent = `${messages[randomIndex]} Goal: ${currentSettings.winScore} points.`;
  }

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
    showDropFeedback(drop, points);
    drop.remove();
  });

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
