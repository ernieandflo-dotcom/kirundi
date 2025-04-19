// Remove the hardcoded 'flashcards' object and replace with:
let flashcards = {};

// Add this at the start of your code:
async function loadFlashcards() {
  try {
    const response = await fetch('flashcards.json');
    if (!response.ok) throw new Error("Failed to load flashcards");
    flashcards = await response.json();
    console.log("Flashcards loaded successfully!");
  } catch (error) {
    console.error("Error loading flashcards:", error);
    // Fallback to a small hardcoded set if JSON fails
    flashcards = {
      vocabulary: [
        { id: 1, question: "What is 'bread' in Kirundi?", answer: "umugati", type: "fill" }
      ]
    };
  }
}

const BOXES = 5;
let progress = JSON.parse(localStorage.getItem("leitnerProgress")) || {};
let learnedCards = JSON.parse(localStorage.getItem("learnedCards")) || [];
let sessionCards = [], cardIndex = 0, currentCard;
let score = 0, streak = 0, maxStreak = 0;

function startSession() {
  // Add this check at the start:
  if (Object.keys(flashcards).length === 0) {
    alert("Flashcards not loaded yet. Please wait...");
    return;
  }

  // Rest of your existing code...
  score = 0;
  streak = 0;
  maxStreak = 0;
  
  const category = document.getElementById("categorySelect").value;
  const count = parseInt(document.getElementById("cardCountSelect").value);
  let availableCards = flashcards[category].filter(c => !learnedCards.includes(c.id));

  availableCards.forEach(card => {
    if (!progress[card.id]) {
      progress[card.id] = { box: 5, streak: 0 };
    }
  });

  availableCards.sort((a, b) => progress[b.id].box - progress[a.id].box);
  sessionCards = availableCards.slice(0, count);

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("flashcardSection").classList.remove("hidden");
  document.getElementById("learnedSection").classList.add("hidden");
  cardIndex = 0;
  
  updateProgressDisplay();
  showNextCard();
}

// Previous JavaScript remains the same until the showNextCard function

function showNextCard() {
  if (cardIndex >= sessionCards.length) {
    endSession();
    return;
  }

  currentCard = sessionCards[cardIndex];
  const flashcard = document.getElementById("flashcard");
  flashcard.textContent = currentCard.question;
  flashcard.className = "fade-in";
  
  updateProgressDisplay();

  const inputSection = document.getElementById("inputSection");
  inputSection.innerHTML = "";

  if (currentCard.type === "fill") {
    inputSection.innerHTML = '<input type="text" id="textAnswer" placeholder="Type your answer..." autofocus>';
  } else if (currentCard.type === "mcq") {
    currentCard.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        document.querySelectorAll("#inputSection button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        document.getElementById("answerInput")?.remove();
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.id = "answerInput";
        hidden.dataset.answer = opt;
        inputSection.appendChild(hidden);
      };
      inputSection.appendChild(btn);
    });
  } else if (currentCard.type === "shuffled") {
    // Create word pool container
    const wordPool = document.createElement("div");
    wordPool.className = "word-pool";
    wordPool.innerHTML = '<div class="word-pool-title">Available Words</div>';
    
    // Create sentence builder container
    const sentenceBuilder = document.createElement("div");
    sentenceBuilder.className = "sentence-builder";
    sentenceBuilder.innerHTML = '<div class="sentence-builder-title">Build Your Sentence Here</div>';
    const outputArea = document.createElement("div");
    outputArea.id = "shuffledOutput";
    sentenceBuilder.appendChild(outputArea);
    
    // Add shuffled words to word pool
    const shuffled = [...currentCard.parts].sort(() => 0.5 - Math.random());
    shuffled.forEach(word => {
      const span = document.createElement("span");
      span.className = "word-token";
      span.textContent = word;
      span.onclick = () => {
        span.remove();
        outputArea.appendChild(span);
        // Add space between words if needed
        if (outputArea.children.length > 1) {
          outputArea.insertBefore(document.createTextNode(" "), span);
        }
      };
      wordPool.appendChild(span);
    });
    
    // Add both containers to input section
    inputSection.appendChild(wordPool);
    inputSection.appendChild(sentenceBuilder);
    
    // Add reset button
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset Words";
    resetBtn.onclick = () => {
      outputArea.innerHTML = '';
      wordPool.innerHTML = '<div class="word-pool-title">Available Words</div>';
      shuffled.forEach(word => {
        const span = document.createElement("span");
        span.className = "word-token";
        span.textContent = word;
        span.onclick = () => {
          span.remove();
          outputArea.appendChild(span);
          if (outputArea.children.length > 1) {
            outputArea.insertBefore(document.createTextNode(" "), span);
          }
        };
        wordPool.appendChild(span);
      });
    };
    inputSection.appendChild(resetBtn);
  }
}

// Rest of the JavaScript remains the same

function submitAnswer() {
  let userAnswer = "";
  const flashcard = document.getElementById("flashcard");

  if (currentCard.type === "mcq") {
    userAnswer = document.getElementById("answerInput")?.dataset.answer || "";
  } else if (currentCard.type === "fill") {
    userAnswer = document.getElementById("textAnswer").value.trim().toLowerCase();
  } else if (currentCard.type === "shuffled") {
    userAnswer = document.getElementById("shuffledOutput").innerText.trim().toLowerCase();
  }

  const correct = userAnswer === currentCard.answer.toLowerCase();
  const cardProgress = progress[currentCard.id];

  if (correct) {
    flashcard.classList.add("correct");
    score += 10 * cardProgress.box; // More points for higher boxes
    streak++;
    maxStreak = Math.max(maxStreak, streak);
    
    cardProgress.box = Math.max(1, cardProgress.box - 1);
    cardProgress.streak++;
    
    setTimeout(() => {
      flashcard.classList.remove("correct");
      showFeedback(true, currentCard.answer);
    }, 500);
  } else {
    flashcard.classList.add("incorrect");
    streak = 0;
    
    cardProgress.box = Math.min(BOXES, cardProgress.box + 1);
    cardProgress.streak = 0;
    
    setTimeout(() => {
      flashcard.classList.remove("incorrect");
      showFeedback(false, currentCard.answer);
    }, 500);
  }
}

function showFeedback(isCorrect, correctAnswer) {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
  feedback.innerHTML = `
    <h3>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h3>
    ${!isCorrect ? `<p>Correct answer: <strong>${correctAnswer}</strong></p>` : ''}
    <p>Current streak: ${streak}</p>
    <p>Score: ${score}</p>
    <button onclick="continueSession()">Continue</button>
  `;
  
  document.getElementById("flashcardSection").appendChild(feedback);
  document.getElementById("submit").disabled = true;
}

function continueSession() {
  document.querySelector(".feedback")?.remove();
  document.getElementById("submit").disabled = false;
  
  const cardProgress = progress[currentCard.id];
  if (cardProgress.box === 1 && cardProgress.streak >= 5) {
    if (!learnedCards.includes(currentCard.id)) {
      learnedCards.push(currentCard.id);
      delete progress[currentCard.id];
      showMasteryMessage();
      return;
    }
  }

  cardIndex++;
  saveProgress();
  updateProgressDisplay();
  showNextCard();
}

function showMasteryMessage() {
  const mastery = document.createElement("div");
  mastery.className = "mastery-message";
  mastery.innerHTML = `
    <h3>🎉 Card Mastered! 🎉</h3>
    <p>You've correctly answered this card 5 times in Box 1!</p>
    <button onclick="cardIndex++; continueSession();">Continue</button>
  `;
  
  document.getElementById("flashcardSection").appendChild(mastery);
}

function updateProgressDisplay() {
  const progressBar = document.querySelector(".progress-bar");
  const progressPercent = (cardIndex / sessionCards.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  const scoreDisplay = document.querySelector(".score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score} | Streak: ${streak} (Max: ${maxStreak})`;
  }
  
  // Update box indicator
  if (currentCard && progress[currentCard.id]) {
    const boxIndicator = document.querySelector(".box-indicator");
    if (boxIndicator) {
      boxIndicator.innerHTML = '';
      for (let i = 1; i <= BOXES; i++) {
        const box = document.createElement("div");
        box.className = `box ${progress[currentCard.id].box === i ? 'active' : ''}`;
        box.textContent = i;
        boxIndicator.appendChild(box);
      }
    }
  }
}

function endSession() {
  const sessionResult = document.createElement("div");
  sessionResult.className = "session-result";
  sessionResult.innerHTML = `
    <h2>Session Complete! 🎉</h2>
    <p>Final Score: <strong>${score}</strong></p>
    <p>Longest Streak: <strong>${maxStreak}</strong></p>
    <button onclick="location.reload()">Start New Session</button>
  `;
  
  document.getElementById("flashcardSection").innerHTML = '';
  document.getElementById("flashcardSection").appendChild(sessionResult);
  saveProgress();
}

function showLearned() {
  const learnedSection = document.getElementById("learnedSection");
  const list = document.getElementById("learnedCardsList");
  list.innerHTML = "";

  if (learnedCards.length === 0) {
    list.innerHTML = "<p>No cards in the Learned basket yet.</p>";
  } else {
    learnedCards.forEach(id => {
      const card = getCardById(id);
      if (card) {
        const item = document.createElement("div");
        item.className = "learned-card";
        item.innerHTML = `
          <input type="checkbox" value="${card.id}" id="reintro-${card.id}">
          <label for="reintro-${card.id}">${card.question}</label>
        `;
        list.appendChild(item);
      }
    });
  }

  learnedSection.classList.remove("hidden");
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("flashcardSection").classList.add("hidden");
}

function reintroduceSelected() {
  const checkboxes = document.querySelectorAll("#learnedCardsList input[type='checkbox']:checked");
  const selected = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (selected.length === 0) {
    alert("Please select at least one card to reintroduce.");
    return;
  }

  selected.forEach(id => {
    progress[id] = { box: 5, streak: 0 };
    const index = learnedCards.indexOf(id);
    if (index !== -1) learnedCards.splice(index, 1);
  });

  saveProgress();
  showLearned();
  alert("Selected cards have been reintroduced!");
}

function reintroduceAll() {
  learnedCards.forEach(id => {
    progress[id] = { box: 5, streak: 0 };
  });
  learnedCards = [];
  saveProgress();
  showLearned();
  alert("All learned cards have been reintroduced.");
}

function getCardById(id) {
  for (let cat in flashcards) {
    const found = flashcards[cat].find(card => card.id === id);
    if (found) return found;
  }
  return null;
}

function saveProgress() {
  localStorage.setItem("leitnerProgress", JSON.stringify(progress));
  localStorage.setItem("learnedCards", JSON.stringify(learnedCards));
}

// Initialize the app like this:
document.addEventListener('DOMContentLoaded', async function() {
  await loadFlashcards(); // Wait for flashcards to load
});