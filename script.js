let flashcards = {};
const BOXES = 5;
let progress = JSON.parse(localStorage.getItem("leitnerProgress")) || {};
let learnedCards = JSON.parse(localStorage.getItem("learnedCards")) || [];
let sessionCards = [], cardIndex = 0, currentCard;
let score = 0, streak = 0, maxStreak = 0;

async function loadFlashcards() {
  try {
    const response = await fetch('flashcards.json');
    if (!response.ok) throw new Error("Failed to load flashcards");
    flashcards = await response.json();
    console.log("Flashcards loaded successfully:", Object.keys(flashcards).length + " categories loaded");
    
    // Initialize progress for all cards
    initializeProgressForAllCards();
  } catch (error) {
    console.error("Error loading flashcards:", error);
    // Fallback to a minimal set of flashcards
    flashcards = {
      vocabulary: {
        food: [
          { id: 1, question: "What is 'bread' in Kirundi?", answer: "umugati", type: "fill" }
        ]
      }
    };
    initializeProgressForAllCards();
  }
}

function initializeProgressForAllCards() {
  console.log("Initializing progress for all cards...");
  let cardsInitialized = 0;
  
  // Process all top-level categories
  for (const category in flashcards) {
    // Get all cards from this category (including nested subcategories)
    const cards = getAllCardsFromCategory(category);
    
    cards.forEach(card => {
      if (card.id && !progress[card.id]) {
        progress[card.id] = { box: 5, streak: 0 };
        cardsInitialized++;
      }
    });
  }
  
  console.log(`Progress initialized for ${cardsInitialized} cards`);
  saveProgress();
}

function getAllCardsFromCategory(category) {
  if (!category || !flashcards) return [];
  
  const categoryObj = getNestedCategory(category);
  if (!categoryObj) return [];
  
  // If it's an array, return it directly
  if (Array.isArray(categoryObj)) return categoryObj;
  
  // If it's an object, collect all arrays from its properties
  let cards = [];
  for (const key in categoryObj) {
    if (Array.isArray(categoryObj[key])) {
      cards = cards.concat(categoryObj[key]);
    } else if (typeof categoryObj[key] === 'object') {
      // Recursively get cards from nested objects
      cards = cards.concat(getAllCardsFromCategory(`${category}.${key}`));
    }
  }
  return cards;
}

function getNestedCategory(categoryPath) {
  if (!categoryPath) return null;
  
  const parts = categoryPath.split('.');
  let current = flashcards;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current;
}

function flattenCards(category) {
  if (!category || !flashcards) {
    console.warn("No category or flashcards data available");
    return [];
  }
  return getAllCardsFromCategory(category);
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function startSession() {
  console.log("Starting session...");
  
  // Ensure flashcards are loaded
  if (Object.keys(flashcards).length === 0) {
    console.log("Flashcards not loaded yet, loading now...");
    await loadFlashcards();
  }

  score = 0;
  streak = 0;
  maxStreak = 0;
  
  const category = document.getElementById("categorySelect").value;
  const count = parseInt(document.getElementById("cardCountSelect").value);

  let allCards = flattenCards(category);
  
  console.log(`Category: ${category}, found ${allCards.length} cards total`);
  
  let availableCards = allCards.filter(c => c && c.id && !learnedCards.includes(c.id));

  console.log(`After filtering learned cards: ${availableCards.length} available`);

  if (availableCards.length === 0) {
    alert("No cards available in this category or all cards have been learned!");
    console.warn("No available cards - possible reasons:", {
      allCardsCount: allCards.length,
      learnedCardsCount: learnedCards.length,
      category: category,
      progress: progress
    });
    return;
  }

  // Initialize progress for any new cards
  availableCards.forEach(card => {
    if (!progress[card.id]) {
      progress[card.id] = { box: 5, streak: 0 };
    }
  });

  // Shuffle first to ensure randomness
  availableCards = shuffleArray(availableCards);
  
  // Then sort by box number (higher boxes first)
  availableCards.sort((a, b) => {
    const boxA = progress[a.id]?.box || 5;
    const boxB = progress[b.id]?.box || 5;
    return boxB - boxA;
  });

  sessionCards = availableCards.slice(0, Math.min(count, availableCards.length));
  
  console.log(`Starting session with ${sessionCards.length} cards`, {
    sessionCards: sessionCards,
    progress: progress
  });

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("flashcardSection").classList.remove("hidden");
  document.getElementById("learnedSection").classList.add("hidden");
  cardIndex = 0;
  
  updateProgressDisplay();
  showNextCard();
}

// [Rest of your existing functions remain exactly the same...]
function showNextCard() {
  // Skip invalid cards
  while (cardIndex < sessionCards.length) {
    currentCard = sessionCards[cardIndex];
    
    if (currentCard && currentCard.question) {
      const flashcard = document.getElementById("flashcard");
      flashcard.textContent = currentCard.question;
      flashcard.className = "fade-in";
      updateProgressDisplay();
      setupInputSection();
      return;
    }
    
    console.warn("Skipping invalid card:", currentCard);
    cardIndex++;
  }

  // If no valid cards left
  endSession();
}

function setupInputSection() {
  const inputSection = document.getElementById("inputSection");
  inputSection.innerHTML = "";

  if (!currentCard) return;

  switch (currentCard.type) {
    case "fill":
      inputSection.innerHTML = '<input type="text" id="textAnswer" placeholder="Type your answer..." autofocus>';
      break;
      
    case "mcq":
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
      break;
      
    case "shuffled":
      const wordPool = document.createElement("div");
      wordPool.className = "word-pool";
      wordPool.innerHTML = '<div class="word-pool-title">Available Words</div>';
      
      const sentenceBuilder = document.createElement("div");
      sentenceBuilder.className = "sentence-builder";
      sentenceBuilder.innerHTML = '<div class="sentence-builder-title">Build Your Sentence Here</div>';
      const outputArea = document.createElement("div");
      outputArea.id = "shuffledOutput";
      sentenceBuilder.appendChild(outputArea);
      
      const shuffled = [...currentCard.parts].sort(() => 0.5 - Math.random());
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
      
      inputSection.appendChild(wordPool);
      inputSection.appendChild(sentenceBuilder);
      
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
      break;
  }
}

function submitAnswer() {
  if (!currentCard) {
    alert("No active card. Returning to home screen.");
    location.reload();
    return;
  }

  let userAnswer = "";
  const flashcard = document.getElementById("flashcard");

  try {
    switch (currentCard.type) {
      case "mcq":
        userAnswer = document.getElementById("answerInput")?.dataset.answer?.toLowerCase() || "";
        break;
      case "fill":
        userAnswer = document.getElementById("textAnswer")?.value.trim().toLowerCase() || "";
        break;
      case "shuffled":
        userAnswer = document.getElementById("shuffledOutput")?.innerText.trim().toLowerCase() || "";
        break;
    }

    if (userAnswer === "") throw new Error("No answer provided");

    const correct = userAnswer === currentCard.answer.toLowerCase();
    const cardProgress = progress[currentCard.id] || { box: 5, streak: 0 };

    if (correct) {
      flashcard.classList.add("correct");
      score += 10 * cardProgress.box;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
      cardProgress.box = Math.max(1, cardProgress.box - 1);
      cardProgress.streak++;
    } else {
      flashcard.classList.add("incorrect");
      streak = 0;
      cardProgress.box = Math.min(BOXES, cardProgress.box + 1);
      cardProgress.streak = 0;
    }

    progress[currentCard.id] = cardProgress;
    setTimeout(() => {
      flashcard.classList.remove(correct ? "correct" : "incorrect");
      showFeedback(correct, currentCard.answer);
    }, 500);

  } catch (error) {
    console.error("Submission error:", error);
    alert("Error processing your answer. Please try again.");
    flashcard.classList.add("incorrect");
    setTimeout(() => flashcard.classList.remove("incorrect"), 500);
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
  // Remove any feedback or mastery messages
  document.querySelector(".feedback")?.remove();
  document.querySelector(".mastery-message")?.remove();
  document.getElementById("submit").disabled = false;
  
  const cardProgress = progress[currentCard?.id];
  if (cardProgress?.box === 1 && cardProgress?.streak >= 5) {
    if (currentCard?.id && !learnedCards.includes(currentCard.id)) {
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
    <button onclick="closeMasteryMessage()">Continue</button>
  `;
  
  document.getElementById("flashcardSection").appendChild(mastery);
}

function closeMasteryMessage() {
  document.querySelector(".mastery-message")?.remove();
  cardIndex++;
  saveProgress();
  updateProgressDisplay();
  showNextCard();
}

function updateProgressDisplay() {
  const progressBar = document.querySelector(".progress-bar");
  const progressPercent = (cardIndex / sessionCards.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  const scoreDisplay = document.querySelector(".score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score} | Streak: ${streak} (Max: ${maxStreak})`;
  }
  
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
  // Search through all categories and subcategories
  for (const category in flashcards) {
    if (Array.isArray(flashcards[category])) {
      const found = flashcards[category].find(card => card.id === id);
      if (found) return found;
    } else if (typeof flashcards[category] === 'object') {
      for (const subcategory in flashcards[category]) {
        if (Array.isArray(flashcards[category][subcategory])) {
          const found = flashcards[category][subcategory].find(card => card.id === id);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

function saveProgress() {
  localStorage.setItem("leitnerProgress", JSON.stringify(progress));
  localStorage.setItem("learnedCards", JSON.stringify(learnedCards));
}

// Initialize the app with improved loading
document.addEventListener('DOMContentLoaded', async function() {
  console.log("DOM loaded, initializing app...");
  
  // Update the start button to be async
  document.querySelector('button[onclick="startSession()"]').onclick = async function() {
    await startSession();
  };
  
  // Load flashcards but don't block UI
  loadFlashcards().then(() => {
    console.log("App initialization complete");
  }).catch(error => {
    console.error("Initialization error:", error);
  });
});
