import React, { useEffect, useRef, useState } from 'react';
import './App.css';

// Enhanced Game Variables
let playerName = "";
let highScore = parseInt(localStorage.getItem("wordleHighScore")) || 0;
let height = 6;
let width = 5;
let row = 0;
let col = 0;
let gameOver = false;
let word = "";
let startTime;
let isDailyMode = false;
let isTimedMode = false;
let currentTheme = 'dark';

const wordList = [];
const guessList = [].concat(wordList);

// Game Statistics
const stats = JSON.parse(localStorage.getItem('wordleStats')) || {
  gamesPlayed: 0,
  wins: 0,
  streak: 0,
  maxStreak: 0,
  guessDistribution: [0,0,0,0,0,0]
};

const themes = {
  dark: { 
    bg: '#121213',
    tile: '#3a3a3c',
    text: '#ffffff',
    correct: '#538d4e',
    present: '#b59f3b',
    absent: '#3a3a3c',
    key: '#818384',
    tileBorder: '#565758',
    buttonPrimary: '#538d4e',
    buttonPrimaryHover: '#4a7d45'
  },
  light: { 
    bg: '#ffffff',
    tile: '#d3d6da',
    text: '#000000',
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    key: '#d3d6da',
    tileBorder: '#878a8c',
    buttonPrimary: '#6aaa64',
    buttonPrimaryHover: '#5b995b'
  },
  colorblind: { 
    bg: '#121213',
    tile: '#3a3a3c',
    text: '#ffffff',
    correct: '#f5793a',
    present: '#85c0f9',
    absent: '#3a3a3c',
    key: '#818384',
    tileBorder: '#565758',
    buttonPrimary: '#f5793a',
    buttonPrimaryHover: '#e5692a'
  }
};

function App() {
  const [initialized, setInitialized] = useState(false);
  const gameRef = useRef();
  
  useEffect(() => {
    if (!initialized) {
      initWordLists();
      initializeApp();
      setInitialized(true);
    }
  }, [initialized]);

  const initWordLists = () => {
    // Basic word list
    const basicWords = [
      'apple', 'brave', 'crane', 'dwarf', 'eagle', 'fable', 'grape', 'happy', 
      'igloo', 'jolly', 'koala', 'lemon', 'mango', 'noble', 'olive', 'peach',
      'quiet', 'river', 'sunny', 'tiger', 'umbra', 'vivid', 'whale', 'xenon',
      'yacht', 'zebra', 'about', 'above', 'admit', 'adopt', 'after', 'again', 
      'agent', 'agree', 'alarm', 'album', 'alert', 'allow', 'alone', 'along', 
      'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apply', 'arena', 
      'argue', 'arise', 'array', 'aside', 'asset', 'avoid', 'awake', 'aware',
      'badge', 'badly', 'basic', 'beach', 'began', 'begin', 'being', 'below',
      'bench', 'billy', 'birth', 'black', 'blame', 'blank', 'blind', 'block',
      'blood', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'bread',
      'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build',
      'built', 'buyer', 'cable', 'calif', 'carry', 'catch', 'cause', 'chain',
      'chair', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'chest',
      'chief', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean',
      'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast',
      'could', 'count', 'court', 'cover', 'craft', 'crash', 'crazy', 'cream',
      'crime', 'cross', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily',
      'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'depth', 'doing',
      'doubt', 'dozen', 'draft', 'drama', 'drank', 'dream', 'dress', 'drill',
      'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight',
      'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error',
      'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fault',
      'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed',
      'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty',
      'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit',
      'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace',
      'grade', 'grand', 'grant', 'grass', 'grave', 'great', 'green', 'gross',
      'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harry',
      'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel', 'house', 'human',
      'ideal', 'image', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy',
      'joint', 'jones', 'judge', 'known', 'label', 'large', 'laser', 'later',
      'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'level',
      'lewis', 'light', 'limit', 'links', 'lives', 'local', 'loose', 'lower',
      'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'maria',
      'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor',
      'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount',
      'mouse', 'mouth', 'moved', 'movie', 'music', 'needs', 'never', 'newly',
      'night', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur', 'ocean',
      'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel', 'paper',
      'party', 'peace', 'peter', 'phase', 'phone', 'photo', 'piano', 'picked',
      'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate',
      'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print',
      'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet',
      'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready',
      'realm', 'rebel', 'refer', 'relax', 'repay', 'reply', 'right', 'rigid',
      'rival', 'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route',
      'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve',
      'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell',
      'shift', 'shine', 'shirt', 'shock', 'shoot', 'short', 'shown', 'sides',
      'sight', 'silly', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep',
      'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve',
      'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend',
      'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand',
      'start', 'state', 'steam', 'steel', 'steep', 'steer', 'steve', 'stick',
      'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip',
      'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet',
      'table', 'taken', 'taste', 'taxes', 'teach', 'teens', 'teeth', 'terry',
      'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick',
      'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'thumb',
      'tiger', 'tight', 'timer', 'tired', 'title', 'today', 'topic', 'total',
      'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat', 'trend',
      'trial', 'tribe', 'trick', 'tried', 'tries', 'truck', 'truly', 'trust',
      'truth', 'twice', 'uncle', 'under', 'undue', 'union', 'unity', 'until',
      'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video',
      'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'water',
      'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'woman',
      'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'write',
      'wrong', 'wrote', 'young', 'youth'
    ];
    
    // Add words to wordList and guessList
    wordList.push(...basicWords);
    guessList.push(...basicWords);
  };

  const initializeApp = () => {
    // Initialize theme
    applyTheme(currentTheme);
    
    // Load player name if exists
    const savedName = localStorage.getItem("wordlePlayerName");
    if (savedName) {
      playerName = savedName;
      const playerNameElement = document.querySelector(".player-name");
      if (playerNameElement) {
        playerNameElement.textContent = savedName;
      }
    }
    
    // Set high score display
    updateStatsDisplay();
    
    // Start game if player name exists
    if (savedName) {
      initializeGame();
    }
  };

  const applyTheme = (theme) => {
    const style = themes[theme];
    document.documentElement.style.setProperty('--bg-color', style.bg);
    document.documentElement.style.setProperty('--tile-color', style.tile);
    document.documentElement.style.setProperty('--text-color', style.text);
    document.documentElement.style.setProperty('--correct-color', style.correct);
    document.documentElement.style.setProperty('--present-color', style.present);
    document.documentElement.style.setProperty('--absent-color', style.absent);
    document.documentElement.style.setProperty('--key-color', style.key);
    document.documentElement.style.setProperty('--tile-border-color', style.tileBorder);
    document.documentElement.style.setProperty('--button-primary', style.buttonPrimary);
    document.documentElement.style.setProperty('--button-primary-hover', style.buttonPrimaryHover);
    
    // Remove all theme classes first
    document.body.classList.remove('dark-theme', 'light-theme', 'colorblind-theme');
    // Add the current theme class
    document.body.classList.add(`${theme}-theme`);
  };

  const initializeGame = () => {
    // Reset game state
    row = 0;
    col = 0;
    gameOver = false;
    
    // Set word based on mode
    if (isDailyMode) {
      word = getDailyWord();
    } else {
      word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    }
    
    console.log("Target word:", word);
    
    // Start timer if timed mode
    if (isTimedMode) {
      startTimer();
    }
    
    // Clear the board
    const board = document.getElementById("board");
    if (board) {
      board.innerHTML = "";
      board.className = "board";
    }
    
    // Clear answer message
    const answerElement = document.getElementById("answer");
    if (answerElement) {
      answerElement.textContent = "";
      answerElement.className = "message";
    }
    
    // Clear keyboard
    const keyboardContainer = document.querySelector(".keyboard-container");
    if (keyboardContainer) {
      keyboardContainer.innerHTML = "";
    }
    
    // Create the game board
    for (let r = 0; r < height; r++) {
      const rowElement = document.createElement("div");
      rowElement.className = "row";
      
      for (let c = 0; c < width; c++) {
        const tile = document.createElement("div");
        tile.id = `${r}-${c}`;
        tile.className = "tile";
        tile.textContent = "";
        rowElement.appendChild(tile);
      }
      
      if (board) {
        board.appendChild(rowElement);
      }
    }
    
    // Create the keyboard
    createKeyboard();
    
    // Add keyboard event listener
    document.addEventListener("keydown", handlePhysicalKeyboard);
  };

  const createKeyboard = () => {
    const keyboard = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];
    
    const keyboardContainer = document.querySelector(".keyboard-container");
    if (!keyboardContainer) return;
    
    keyboard.forEach(rowKeys => {
      const rowElement = document.createElement("div");
      rowElement.className = "keyboard-row";
      
      rowKeys.forEach(key => {
        const keyElement = document.createElement("button");
        keyElement.className = "key";
        keyElement.textContent = key;
        
        if (key === "Enter" || key === "⌫") {
          keyElement.classList.add("key-wide");
          keyElement.id = key === "Enter" ? "Enter" : "Backspace";
        } else {
          keyElement.id = `Key${key}`;
        }
        
        keyElement.addEventListener("click", () => {
          handleKeyPress(key);
          // Add click animation
          keyElement.classList.add("pop");
          setTimeout(() => keyElement.classList.remove("pop"), 100);
        });
        
        rowElement.appendChild(keyElement);
      });
      
      keyboardContainer.appendChild(rowElement);
    });
  };

  const getDailyWord = () => {
    const today = new Date().toISOString().slice(0, 10);
    const hash = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return wordList[hash % wordList.length].toUpperCase();
  };

  const startTimer = () => {
    clearInterval(window.timerInterval);
    
    // Remove existing timer if it exists
    const existingTimer = document.getElementById("timer");
    if (existingTimer) existingTimer.remove();
    
    startTime = Date.now();
    const timerDisplay = document.createElement("div");
    timerDisplay.id = "timer";
    timerDisplay.className = "timer";
    const header = document.querySelector(".header");
    if (header) {
      header.appendChild(timerDisplay);
    }
    
    window.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timerEl = document.getElementById("timer");
      if (timerEl) {
        timerEl.textContent = `Time: ${elapsed}s`;
      }
    }, 1000);
  };

  const handlePhysicalKeyboard = (e) => {
    if (gameOver) return;
    
    if (e.code.startsWith("Key") && e.code.length === 4) {
      const key = e.code.replace("Key", "");
      handleKeyPress(key);
      playSound('keyPress');
    } else if (e.code === "Backspace") {
      handleKeyPress("⌫");
      playSound('delete');
    } else if (e.code === "Enter") {
      handleKeyPress("Enter");
      playSound('submit');
    }
  };

  const handleKeyPress = (key) => {
    if (gameOver) return;
    
    if (key === "⌫") {
      if (col > 0) {
        col--;
        const tile = document.getElementById(`${row}-${col}`);
        if (tile) {
          tile.textContent = "";
          tile.classList.add("pop");
          setTimeout(() => tile.classList.remove("pop"), 100);
        }
      }
    } else if (key === "Enter") {
      submitGuess();
    } else if (key.length === 1 && /^[A-Z]$/.test(key) && col < width) {
      const tile = document.getElementById(`${row}-${col}`);
      if (tile) {
        tile.textContent = key;
        tile.classList.add("pop");
        setTimeout(() => tile.classList.remove("pop"), 100);
        col++;
      }
    }
  };

  const submitGuess = () => {
    if (col !== width) {
      showMessage("Not enough letters");
      playSound('error');
      return;
    }
    
    let guess = "";
    for (let c = 0; c < width; c++) {
      const tile = document.getElementById(`${row}-${c}`);
      if (tile) {
        guess += tile.textContent;
      }
    }
    
    if (!guessList.includes(guess.toLowerCase())) {
      showMessage("Not in word list");
      playSound('error');
      return;
    }
    
    // Process the guess
    processGuess(guess);
  };

  const processGuess = (guess) => {
    const letterCount = {};
    const answer = word.split("");
    const tiles = [];
    let correct = 0;
    
    // Count letters in the target word
    for (const letter of answer) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    // First pass: mark correct letters
    for (let i = 0; i < width; i++) {
      const tile = document.getElementById(`${row}-${i}`);
      if (tile) {
        tiles.push(tile);
        const letter = tile.textContent;
        
        if (letter === answer[i]) {
          tile.classList.add("correct");
          markKeyboardKey(letter, "correct");
          correct++;
          letterCount[letter]--;
        }
      }
    }
    
    // Second pass: mark present and absent letters
    for (let i = 0; i < width; i++) {
      const tile = tiles[i];
      if (!tile) continue;
      const letter = tile.textContent;
      
      if (!tile.classList.contains("correct")) {
        if (answer.includes(letter) && letterCount[letter] > 0) {
          tile.classList.add("present");
          markKeyboardKey(letter, "present");
          letterCount[letter]--;
        } else {
          tile.classList.add("absent");
          markKeyboardKey(letter, "absent");
        }
      }
      
      // Add flip animation
      tile.classList.add("flip");
      tile.style.animationDelay = `${i * 0.1}s`;
    }
    
    // Play sound based on result
    playSound(correct === width ? 'win' : 'flip');
    
    // Check for win
    if (correct === width) {
      gameOver = true;
      const currentScore = 6 - row;
      if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("wordleHighScore", highScore);
        const highScoreEl = document.querySelector(".high-score span");
        if (highScoreEl) {
          highScoreEl.textContent = highScore;
        }
      }
      updateStats(true);
      showMessage(`You Win! Score: ${currentScore}`, true);
      
      // Show confetti on win
      if (currentScore >= 3) {
        showConfetti();
      }
    } else {
      row++;
      col = 0;
      
      if (row >= height) {
        gameOver = true;
        updateStats(false);
        showMessage(`Game Over! The word was: ${word}`, true);
      }
    }
  };

  const markKeyboardKey = (letter, className) => {
    const key = document.getElementById(`Key${letter}`);
    if (key && !key.classList.contains("correct")) {
      key.classList.remove("present", "absent");
      key.classList.add(className);
    }
  };

  const showMessage = (text, isPersistent = false) => {
    const message = document.getElementById("answer");
    if (message) {
      message.textContent = text;
      message.classList.add("show");
      
      if (!isPersistent) {
        setTimeout(() => {
          message.classList.remove("show");
        }, 2000);
      }
    }
  };

  const giveHint = () => {
    if (gameOver || row >= height) return;
    
    const hiddenLetters = Array.from(document.querySelectorAll('.tile:not(.correct)'))
      .filter(tile => !tile.textContent && tile.id.startsWith(`${row}-`));
    
    if (hiddenLetters.length > 0) {
      const randomTile = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
      const position = randomTile.id.split('-')[1];
      randomTile.textContent = word[position];
      randomTile.classList.add('hint');
      randomTile.classList.add('flip');
      playSound('hint');
    } else {
      showMessage("No hints available");
    }
  };

  const updateStats = (won) => {
    stats.gamesPlayed++;
    if (won) {
      stats.wins++;
      stats.streak++;
      stats.guessDistribution[row]++;
      if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
    } else {
      stats.streak = 0;
    }
    localStorage.setItem('wordleStats', JSON.stringify(stats));
    updateStatsDisplay();
  };

  const updateStatsDisplay = () => {
    const highScoreEl = document.querySelector(".high-score span");
    if (highScoreEl) {
      highScoreEl.textContent = highScore;
    }
  };

  const showStats = () => {
    const statsModal = document.createElement("div");
    statsModal.className = "stats-modal";
    statsModal.innerHTML = `
      <div class="stats-content">
        <h2>Game Statistics</h2>
        <div class="stats-grid">
          <div>Games Played</div><div>${stats.gamesPlayed}</div>
          <div>Win %</div><div>${stats.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}</div>
          <div>Current Streak</div><div>${stats.streak}</div>
          <div>Max Streak</div><div>${stats.maxStreak}</div>
        </div>
        <h3>Guess Distribution</h3>
        <div class="distribution">
          ${stats.guessDistribution.map((count, i) => `
            <div class="dist-row">
              <div>${i+1}</div>
              <div class="dist-bar" style="width: ${stats.wins ? (count / stats.wins * 100) : 0}%">${count}</div>
            </div>
          `).join('')}
        </div>
        <button class="close-btn">Close</button>
      </div>
    `;
    
    statsModal.querySelector(".close-btn").addEventListener("click", () => {
      document.body.removeChild(statsModal);
    });
    
    document.body.appendChild(statsModal);
  };

  const shareResult = () => {
    if (!gameOver) {
      showMessage("Finish the game first!");
      return;
    }
    
    const emojiMap = { correct: '🟩', present: '🟨', absent: '⬛' };
    let shareText = `Wordle ${row + 1}/6\n`;
    
    for (let r = 0; r <= row; r++) {
      for (let c = 0; c < width; c++) {
        const tile = document.getElementById(`${r}-${c}`);
        if (tile) {
          shareText += emojiMap[Array.from(tile.classList)
            .find(c => ['correct','present','absent'].includes(c))] || '⬜';
        }
      }
      shareText += '\n';
    }
    
    // Try Web Share API first
    if (navigator.share) {
      navigator.share({
        title: 'My Wordle Result',
        text: shareText
      }).catch(() => {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showMessage("Result copied to clipboard!");
  };

  const playSound = (type) => {
    if (!window.audioContext) {
      try {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return; // Audio not supported
      }
    }
    
    const freqMap = {
      keyPress: 440,
      delete: 220,
      submit: 880,
      win: [659, 783, 1046],
      error: 329,
      flip: 523,
      hint: 392
    };
    
    const durationMap = {
      keyPress: 0.1,
      delete: 0.1,
      submit: 0.2,
      win: 0.3,
      error: 0.5,
      flip: 0.1,
      hint: 0.2
    };
    
    const frequencies = Array.isArray(freqMap[type]) ? freqMap[type] : [freqMap[type]];
    const duration = durationMap[type] || 0.1;
    
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        try {
          const oscillator = window.audioContext.createOscillator();
          const gainNode = window.audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = freq;
          oscillator.connect(gainNode);
          gainNode.connect(window.audioContext.destination);
          
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(
            0.00001, 
            window.audioContext.currentTime + duration
          );
          oscillator.stop(window.audioContext.currentTime + duration);
        } catch (e) {
          // Audio playback failed
        }
      }, i * 100);
    });
  };

  const showConfetti = () => {
    const confettiSettings = {
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    };
    
    // Create confetti elements
    for (let i = 0; i < confettiSettings.particleCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = confettiSettings.colors[
        Math.floor(Math.random() * confettiSettings.colors.length)
      ];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.opacity = Math.random();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      document.body.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, 5000);
    }
  };

  const handleStartGame = () => {
    const playerInput = document.querySelector(".player-input");
    const playerModal = document.querySelector(".player-modal");
    
    if (playerInput && playerInput.value.trim() !== "") {
      playerName = playerInput.value.trim();
      localStorage.setItem("wordlePlayerName", playerName);
      const playerNameEl = document.querySelector(".player-name");
      if (playerNameEl) {
        playerNameEl.textContent = playerName;
      }
      if (playerModal) {
        playerModal.classList.remove("active");
      }
      initializeGame();
    } else {
      showMessage("Please enter your name to continue");
    }
  };

  const handleModeChange = (mode) => {
    // Clear any existing timer
    clearInterval(window.timerInterval);
    const timerDisplay = document.getElementById("timer");
    if (timerDisplay) timerDisplay.remove();

    isDailyMode = (mode === "daily");
    isTimedMode = (mode === "timed");
    
    initializeGame();
    
    // If timed mode, start new timer
    if (isTimedMode) {
      startTimer();
    }
  };

  const handleThemeChange = (theme) => {
    currentTheme = theme;
    applyTheme(currentTheme);
  };

  const handleHowToPlay = () => {
    const howToPlayModal = document.querySelector(".how-to-play-modal");
    if (howToPlayModal) {
      howToPlayModal.classList.add("active");
    }
  };

  const closeHowToPlay = () => {
    const howToPlayModal = document.querySelector(".how-to-play-modal");
    if (howToPlayModal) {
      howToPlayModal.classList.remove("active");
    }
  };

  // Add event listeners when component mounts
  useEffect(() => {
    // Handle form submission
    const startBtn = document.querySelector(".start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", handleStartGame);
    }
    
    // How to Play button
    const howToPlayBtn = document.querySelector(".how-to-play-btn");
    if (howToPlayBtn) {
      howToPlayBtn.addEventListener("click", handleHowToPlay);
    }

    const closeHowToPlayBtn = document.querySelector(".close-how-to-play");
    if (closeHowToPlayBtn) {
      closeHowToPlayBtn.addEventListener("click", closeHowToPlay);
    }
    
    return () => {
      // Cleanup event listeners
      if (startBtn) {
        startBtn.removeEventListener("click", handleStartGame);
      }
      if (howToPlayBtn) {
        howToPlayBtn.removeEventListener("click", handleHowToPlay);
      }
      if (closeHowToPlayBtn) {
        closeHowToPlayBtn.removeEventListener("click", closeHowToPlay);
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1>Enhanced Wordle</h1>
        <div className="high-score">
          High Score: <span>{highScore}</span>
        </div>
        <div className="player-name">{playerName}</div>
        
        <div className="mode-selector">
          <button className="mode-btn active" onClick={() => handleModeChange("random")}>Random</button>
          <button className="mode-btn" onClick={() => handleModeChange("daily")}>Daily</button>
          <button className="mode-btn" onClick={() => handleModeChange("timed")}>Timed</button>
        </div>
        
        <div className="theme-selector">
          <button className="theme-btn active" onClick={() => handleThemeChange("dark")}>Dark</button>
          <button className="theme-btn" onClick={() => handleThemeChange("light")}>Light</button>
          <button className="theme-btn" onClick={() => handleThemeChange("colorblind")}>Colorblind</button>
        </div>
        
        <button className="hint-btn" onClick={giveHint}>Hint</button>
        <button className="stats-btn" onClick={showStats}>Stats</button>
        <button className="share-btn" onClick={shareResult}>Share</button>
        <button className="how-to-play-btn">How to Play</button>
      </div>

      <div className="container">
        <div id="board" className="board"></div>
        <div id="answer" className="message"></div>
        <div className="keyboard-container"></div>
      </div>

      {/* Player Modal */}
      <div className={`player-modal ${!playerName ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Welcome to Enhanced Wordle!</h2>
          <p>Enter your name to start playing:</p>
          <form onSubmit={(e) => {e.preventDefault(); handleStartGame();}}>
            <input 
              type="text" 
              className="player-input" 
              placeholder="Your name"
              maxLength="20"
            />
            <button type="submit" className="start-btn">Start Game</button>
          </form>
        </div>
      </div>

      {/* How to Play Modal */}
      <div className="how-to-play-modal">
        <div className="modal-content">
          <h2>How to Play</h2>
          <p>Guess the WORDLE in 6 tries.</p>
          <ul>
            <li>Each guess must be a valid 5-letter word.</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
            <li><strong>Green</strong>: Letter is in the word and in the correct spot.</li>
            <li><strong>Yellow</strong>: Letter is in the word but in the wrong spot.</li>
            <li><strong>Gray</strong>: Letter is not in the word in any spot.</li>
          </ul>
          <h3>Game Modes:</h3>
          <ul>
            <li><strong>Random</strong>: New random word each game</li>
            <li><strong>Daily</strong>: Same word for everyone each day</li>
            <li><strong>Timed</strong>: Race against the clock</li>
          </ul>
          <h3>Features:</h3>
          <ul>
            <li>Hint system to reveal letters</li>
            <li>Statistics tracking</li>
            <li>Multiple themes</li>
            <li>Share your results</li>
          </ul>
          <button className="close-how-to-play">Close</button>
        </div>
      </div>
    </div>
  );
}

export default App;