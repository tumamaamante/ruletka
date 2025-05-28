// Casino Game Logic
let balance = 10000;
let currentGame = null;
let currentBet = null;

// Slot Machine Variables
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

// Blackjack Variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameInProgress = false;

// Roulette Variables
let rouletteBet = null;
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Utility Functions
function updateBalance(amount) {
  balance += amount;
  document.getElementById('balance').textContent = balance.toLocaleString();
  
  if (balance <= 0) {
    alert('You\'re out of money! Resetting to $10,000');
    balance = 10000;
    document.getElementById('balance').textContent = balance.toLocaleString();
  }
}

function showGame(game) {
  // Hide all games
  document.querySelectorAll('.game-container').forEach(container => {
    container.classList.add('hidden');
  });
  
  // Show selected game
  document.getElementById(game + '-game').classList.remove('hidden');
  currentGame = game;
  
  // Reset game states
  if (game === 'blackjack') {
    resetBlackjack();
  }
  if (game === 'roulette') {
    resetRoulette();
  }
}

// SLOT MACHINE LOGIC
function spinSlots() {
  const betAmount = parseInt(document.getElementById('slot-bet').value);
  
  if (balance < betAmount) {
    alert('Insufficient funds!');
    return;
  }
  
  updateBalance(-betAmount);
  
  // Animate slots
  const slots = ['slot1', 'slot2', 'slot3'];
  const results = [];
  
  slots.forEach((slotId, index) => {
    const slot = document.getElementById(slotId);
    slot.classList.add('slot-reel');
    
    setTimeout(() => {
      const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      slot.textContent = symbol;
      results.push(symbol);
      slot.classList.remove('slot-reel');
      
      if (index === 2) {
        checkSlotWin(results, betAmount);
      }
    }, 500 + (index * 200));
  });
}

function checkSlotWin(results, betAmount) {
  const resultDiv = document.getElementById('slot-result');
  
  // Check for wins
  if (results[0] === results[1] && results[1] === results[2]) {
    // Three of a kind
    let multiplier = 5;
    if (results[0] === '💎') multiplier = 20;
    else if (results[0] === '7️⃣') multiplier = 15;
    else if (results[0] === '🔔') multiplier = 10;
    
    const winAmount = betAmount * multiplier;
    updateBalance(winAmount);
    resultDiv.innerHTML = `<span class="text-green-400">🎉 JACKPOT! Won $${winAmount}! 🎉</span>`;
  } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    // Two of a kind
    const winAmount = betAmount * 2;
    updateBalance(winAmount);
    resultDiv.innerHTML = `<span class="text-yellow-400">✨ Two of a kind! Won $${winAmount}! ✨</span>`;
  } else {
    resultDiv.innerHTML = `<span class="text-red-400">💸 No win this time. Try again! 💸</span>`;
  }
  
  setTimeout(() => {
    resultDiv.innerHTML = '';
  }, 3000);
}

// BLACKJACK LOGIC
function createDeck() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  deck = [];
  
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit, value: getCardValue(rank) });
    }
  }
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function getCardValue(rank) {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

function dealCard() {
  return deck.pop();
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  
  for (let card of hand) {
    score += card.value;
    if (card.rank === 'A') aces++;
  }
  
  // Adjust for aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

function displayCard(card, container) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'w-16 h-24 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center text-black font-bold card-flip';
  cardDiv.innerHTML = `
    <div class="text-xs">${card.rank}</div>
    <div class="text-lg">${card.suit}</div>
  `;
  container.appendChild(cardDiv);
}

function startBlackjack() {
  const betAmount = parseInt(document.getElementById('blackjack-bet').value);
  
  if (balance < betAmount) {
    alert('Insufficient funds!');
    return;
  }
  
  updateBalance(-betAmount);
  currentBet = betAmount;
  
  createDeck();
  playerHand = [];
  dealerHand = [];
  gameInProgress = true;
  
  // Clear previous cards
  document.getElementById('player-cards').innerHTML = '';
  document.getElementById('dealer-cards').innerHTML = '';
  document.getElementById('blackjack-result').innerHTML = '';
  
  // Deal initial cards
  playerHand.push(dealCard());
  dealerHand.push(dealCard());
  playerHand.push(dealCard());
  dealerHand.push(dealCard());
  
  updateBlackjackDisplay();
  
  // Enable/disable buttons
  document.getElementById('deal-btn').disabled = true;
  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;
  
  // Check for blackjack
  if (calculateScore(playerHand) === 21) {
    stand();
  }
}

function hit() {
  if (!gameInProgress) return;
  
  playerHand.push(dealCard());
  updateBlackjackDisplay();
  
  if (calculateScore(playerHand) > 21) {
    endBlackjack('bust');
  }
}

function stand() {
  if (!gameInProgress) return;
  
  // Dealer plays
  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(dealCard());
  }
  
  updateBlackjackDisplay();
  
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);
  
  if (dealerScore > 21) {
    endBlackjack('dealer-bust');
  } else if (playerScore > dealerScore) {
    endBlackjack('player-win');
  } else if (dealerScore > playerScore) {
    endBlackjack('dealer-win');
  } else {
    endBlackjack('tie');
  }
}

function updateBlackjackDisplay() {
  const playerContainer = document.getElementById('player-cards');
  const dealerContainer = document.getElementById('dealer-cards');
  
  // Clear and redisplay cards
  playerContainer.innerHTML = '';
  dealerContainer.innerHTML = '';
  
  playerHand.forEach(card => displayCard(card, playerContainer));
  dealerHand.forEach((card, index) => {
    if (gameInProgress && index === 1) {
      // Hide dealer's second card during game
      const hiddenCard = document.createElement('div');
      hiddenCard.className = 'w-16 h-24 bg-blue-600 rounded border-2 border-gray-300 flex items-center justify-center text-white font-bold';
      hiddenCard.innerHTML = '🂠';
      dealerContainer.appendChild(hiddenCard);
    } else {
      displayCard(card, dealerContainer);
    }
  });
  
  document.getElementById('player-score').textContent = calculateScore(playerHand);
  document.getElementById('dealer-score').textContent = gameInProgress ? calculateScore([dealerHand[0]]) : calculateScore(dealerHand);
}

function endBlackjack(result) {
  gameInProgress = false;
  updateBlackjackDisplay();
  
  const resultDiv = document.getElementById('blackjack-result');
  
  switch (result) {
    case 'bust':
      resultDiv.innerHTML = '<span class="text-red-400">💥 BUST! You lose! 💥</span>';
      break;
    case 'dealer-bust':
      updateBalance(currentBet * 2);
      resultDiv.innerHTML = '<span class="text-green-400">🎉 Dealer busts! You win! 🎉</span>';
      break;
    case 'player-win':
      updateBalance(currentBet * 2);
      resultDiv.innerHTML = '<span class="text-green-400">🎉 You win! 🎉</span>';
      break;
    case 'dealer-win':
      resultDiv.innerHTML = '<span class="text-red-400">😞 Dealer wins! 😞</span>';
      break;
    case 'tie':
      updateBalance(currentBet);
      resultDiv.innerHTML = '<span class="text-yellow-400">🤝 It\'s a tie! 🤝</span>';
      break;
  }
  
  resetBlackjack();
}

function resetBlackjack() {
  document.getElementById('deal-btn').disabled = false;
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
}

// ROULETTE LOGIC
function placeBet(betType) {
  rouletteBet = betType;
  document.getElementById('current-bet').textContent = betType.toUpperCase();
  document.getElementById('spin-roulette').disabled = false;
}

function spinRoulette() {
  const betAmount = parseInt(document.getElementById('roulette-bet').value);
  
  if (balance < betAmount) {
    alert('Insufficient funds!');
    return;
  }
  
  if (!rouletteBet) {
    alert('Please place a bet first!');
    return;
  }
  
  updateBalance(-betAmount);
  
  // Animate wheel
  const wheel = document.getElementById('roulette-wheel');
  wheel.classList.add('roulette-wheel');
  
  setTimeout(() => {
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    document.getElementById('roulette-number').textContent = winningNumber;
    
    checkRouletteWin(winningNumber, betAmount);
    wheel.classList.remove('roulette-wheel');
  }, 3000);
  
  document.getElementById('spin-roulette').disabled = true;
}

function checkRouletteWin(number, betAmount) {
  const resultDiv = document.getElementById('roulette-result');
  let won = false;
  let multiplier = 2;
  
  switch (rouletteBet) {
    case 'red':
      won = redNumbers.includes(number);
      break;
    case 'black':
      won = !redNumbers.includes(number) && number !== 0;
      break;
    case 'even':
      won = number % 2 === 0 && number !== 0;
      break;
    case 'odd':
      won = number % 2 === 1;
      break;
  }
  
  if (won) {
    const winAmount = betAmount * multiplier;
    updateBalance(winAmount);
    resultDiv.innerHTML = `<span class="text-green-400">🎉 Winner! Number ${number} - Won $${winAmount}! 🎉</span>`;
  } else {
    resultDiv.innerHTML = `<span class="text-red-400">💸 Number ${number} - Better luck next time! 💸</span>`;
  }
  
  setTimeout(() => {
    resultDiv.innerHTML = '';
    resetRoulette();
  }, 3000);
}

function resetRoulette() {
  rouletteBet = null;
  document.getElementById('current-bet').textContent = 'None';
  document.getElementById('spin-roulette').disabled = true;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  showGame('slots');
});
