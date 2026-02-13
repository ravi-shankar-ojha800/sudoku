/* ============================================
   SUDOKU PREMIUM GAME - Rs_ojha
   Full Game Logic & Interactions
   ============================================ */

// Game State
const gameState = {
    currentScreen: 'home',
    difficulty: 'easy',
    selectedCell: null,
    selectedNumber: null,
    board: [],
    solution: [],
    timer: null,
    seconds: 0,
    isPaused: false,
    hintsUsed: 0,
    isGameWon: false
};

// Difficulty Settings
const difficultySettings = {
    easy: { name: 'EASY', cellsToRemove: 35, easy: true },
    medium: { name: 'MEDIUM', cellsToRemove: 45, easy: false },
    hard: { name: 'HARD', cellsToRemove: 55, easy: false }
};

// DOM Elements
const screens = {
    home: document.getElementById('home-screen'),
    difficulty: document.getElementById('difficulty-screen'),
    game: document.getElementById('game-screen')
};

const elements = {
    enterBtn: document.getElementById('enter-btn'),
    confirmBtn: document.getElementById('confirm-btn'),
    difficultyCards: document.querySelectorAll('.difficulty-card'),
    sudokuGrid: document.getElementById('sudoku-grid'),
    timerDisplay: document.getElementById('timer'),
    difficultyBadge: document.getElementById('difficulty-badge'),
    numberPad: document.querySelectorAll('.num-btn'),
    hintBtn: document.getElementById('hint-btn'),
    restartBtn: document.getElementById('restart-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    pauseModal: document.getElementById('pause-modal'),
    winModal: document.getElementById('win-modal'),
    resumeBtn: document.getElementById('resume-btn'),
    quitBtn: document.getElementById('quit-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    finalTime: document.getElementById('final-time'),
    confettiCanvas: document.getElementById('confetti-canvas')
};

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// Home Screen -> Difficulty Screen
elements.enterBtn.addEventListener('click', () => {
    showScreen('difficulty');
});

// Difficulty Selection
elements.difficultyCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove active class from all cards
        elements.difficultyCards.forEach(c => c.classList.remove('active'));
        // Add active class to clicked card
        card.classList.add('active');
        
        // Get difficulty level
        const level = card.dataset.level;
        gameState.difficulty = level;
        
        // Update background color
        const difficultyScreen = document.getElementById('difficulty-screen');
        difficultyScreen.classList.remove('easy', 'medium', 'hard');
        difficultyScreen.classList.add(level);
    });
});

// Difficulty Screen -> Game Screen
elements.confirmBtn.addEventListener('click', () => {
    if (gameState.difficulty) {
        startGame();
        showScreen('game');
    }
});

// ============================================
// SUDOKU GENERATION ALGORITHM
// ============================================

function generateSudoku() {
    // Generate a complete valid Sudoku board
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    fillBoard(board);
    
    // Create a copy for the solution
    const solution = board.map(row => [...row]);
    
    // Remove cells based on difficulty
    const cellsToRemove = difficultySettings[gameState.difficulty].cellsToRemove;
    removeCells(board, cellsToRemove);
    
    return { board, solution };
}

function fillBoard(board) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Fill diagonal 3x3 boxes first (they are independent)
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
    
    // Fill remaining cells using backtracking
    solveSudoku(board);
}

function fillBox(board, row, col) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = nums[index++];
        }
    }
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function solveSudoku(board) {
    const emptyCell = findEmpty(board);
    if (!emptyCell) return true;
    
    const [row, col] = emptyCell;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    for (const num of nums) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            
            if (solveSudoku(board)) {
                return true;
            }
            
            board[row][col] = 0;
        }
    }
    
    return false;
}

function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return null;
}

function isValid(board, row, col, num) {
    // Check row
    for (let j = 0; j < 9; j++) {
        if (board[row][j] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

function removeCells(board, count) {
    let removed = 0;
    const positions = [];
    
    // Create list of all positions
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            positions.push([i, j]);
        }
    }
    
    // Shuffle positions
    const shuffled = shuffle(positions);
    
    // Remove cells
    for (const [row, col] of shuffled) {
        if (removed >= count) break;
        
        const backup = board[row][col];
        board[row][col] = 0;
        
        // For harder difficulties, check for unique solution
        if (!difficultySettings[gameState.difficulty].easy) {
            // Simply remove for now - could add unique solution check for more complex generation
        }
        
        removed++;
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

function startGame() {
    // Reset game state
    gameState.seconds = 0;
    gameState.hintsUsed = 0;
    gameState.isGameWon = false;
    gameState.isPaused = false;
    gameState.selectedCell = null;
    gameState.selectedNumber = null;
    
    // Generate new puzzle
    const { board, solution } = generateSudoku();
    gameState.board = board;
    gameState.solution = solution;
    
    // Update UI
    updateDifficultyBadge();
    renderBoard();
    renderNumberPad();
    startTimer();
    
    // Hide modals
    elements.pauseModal.classList.remove('active');
    elements.winModal.classList.remove('active');
}

function updateDifficultyBadge() {
    const badge = elements.difficultyBadge;
    const settings = difficultySettings[gameState.difficulty];
    
    badge.textContent = settings.name;
    badge.classList.remove('medium', 'hard');
    
    if (gameState.difficulty === 'medium') {
        badge.classList.add('medium');
    } else if (gameState.difficulty === 'hard') {
        badge.classList.add('hard');
    }
}

// ============================================
// BOARD RENDERING
// ============================================

function renderBoard() {
    elements.sudokuGrid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const value = gameState.board[i][j];
            
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('fixed');
            }
            
            cell.addEventListener('click', () => selectCell(i, j));
            elements.sudokuGrid.appendChild(cell);
        }
    }
}

function renderNumberPad() {
    elements.numberPad.forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ============================================
// CELL SELECTION & INPUT
// ============================================

function selectCell(row, col) {
    if (gameState.isPaused || gameState.isGameWon) return;
    
    const cells = document.querySelectorAll('.cell');
    const index = row * 9 + col;
    const clickedCell = cells[index];
    
    // Don't allow selecting fixed cells for editing, but allow viewing
    gameState.selectedCell = { row, col };
    
    // Update visual selection
    cells.forEach(cell => {
        cell.classList.remove('selected', 'highlighted', 'same-number', 'row-highlight', 'col-highlight', 'box-highlight');
    });
    
    // Highlight selected cell
    clickedCell.classList.add('selected');
    
    // Highlight row, column, and box
    const value = gameState.board[row][col];
    
    for (let i = 0; i < 9; i++) {
        // Row
        cells[row * 9 + i].classList.add('row-highlight');
        // Column
        cells[i * 9 + col].classList.add('col-highlight');
    }
    
    // Box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            cells[(boxRow + i) * 9 + (boxCol + j)].classList.add('box-highlight');
        }
    }
    
    // Highlight same numbers
    if (value !== 0) {
        cells.forEach((cell, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            if (gameState.board[r][c] === value && (r !== row || c !== col)) {
                cell.classList.add('same-number');
            }
        });
    }
}

// Number pad input
elements.numberPad.forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.isPaused || gameState.isGameWon) return;
        
        const num = parseInt(btn.dataset.num);
        gameState.selectedNumber = num;
        
        // Update number pad visual
        elements.numberPad.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Place number if cell is selected
        if (gameState.selectedCell && !isFixedCell(gameState.selectedCell.row, gameState.selectedCell.col)) {
            placeNumber(num);
        }
    });
});

function isFixedCell(row, col) {
    // In the initial board, cells with values are fixed
    const originalBoard = gameState.board;
    return originalBoard[row][col] !== 0;
}

function placeNumber(num) {
    if (!gameState.selectedCell) return;
    
    const { row, col } = gameState.selectedCell;
    const cells = document.querySelectorAll('.cell');
    const index = row * 9 + col;
    const cell = cells[index];
    
    // Clear previous animation classes
    cell.classList.remove('correct', 'wrong', 'hint');
    
    if (num === 0) {
        // Erase
        gameState.board[row][col] = 0;
        cell.textContent = '';
        cell.classList.remove('fixed');
    } else {
        // Check if correct
        const isCorrect = num === gameState.solution[row][col];
        
        gameState.board[row][col] = num;
        cell.textContent = num;
        
        if (isCorrect) {
            cell.classList.add('correct');
            setTimeout(() => cell.classList.remove('correct'), 400);
        } else {
            cell.classList.add('wrong');
            setTimeout(() => cell.classList.remove('wrong'), 400);
        }
        
        // Check win condition
        checkWin();
    }
    
    // Update highlights
    selectCell(row, col);
}

// ============================================
// TIMER
// ============================================

function startTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && !gameState.isGameWon) {
            gameState.seconds++;
            updateTimerDisplay();
        }
    }, 1000);
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.seconds / 60);
    const seconds = gameState.seconds % 60;
    elements.timerDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
}

// ============================================
// HINT SYSTEM
// ============================================

elements.hintBtn.addEventListener('click', () => {
    if (gameState.isPaused || gameState.isGameWon) return;
    
    // Find an empty cell or wrong cell
    const cells = document.querySelectorAll('.cell');
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j;
            const cell = cells[index];
            
            // Skip fixed cells
            if (cell.classList.contains('fixed')) continue;
            
            // Find cell that's either empty or wrong
            const currentValue = gameState.board[i][j];
            const correctValue = gameState.solution[i][j];
            
            if (currentValue !== correctValue) {
                // Give hint
                gameState.board[i][j] = correctValue;
                cell.textContent = correctValue;
                cell.classList.add('hint', 'fixed');
                cell.classList.remove('wrong');
                
                setTimeout(() => cell.classList.remove('hint'), 1000);
                
                gameState.hintsUsed++;
                checkWin();
                return;
            }
        }
    }
});

// ============================================
// RESTART
// ============================================

elements.restartBtn.addEventListener('click', () => {
    if (gameState.isPaused || gameState.isGameWon) return;
    startGame();
});

// ============================================
// PAUSE/RESUME
// ============================================

elements.pauseBtn.addEventListener('click', () => {
    gameState.isPaused = true;
    elements.pauseModal.classList.add('active');
});

elements.resumeBtn.addEventListener('click', () => {
    gameState.isPaused = false;
    elements.pauseModal.classList.remove('active');
});

elements.quitBtn.addEventListener('click', () => {
    stopTimer();
    showScreen('difficulty');
    elements.pauseModal.classList.remove('active');
});

// ============================================
// WIN CONDITION
// ============================================

function checkWin() {
    // Check if board is complete and correct
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (gameState.board[i][j] !== gameState.solution[i][j]) {
                return false;
            }
        }
    }
    
    // Game won!
    gameState.isGameWon = true;
    stopTimer();
    
    // Show win time
    elements.finalTime.textContent = elements.timerDisplay.textContent;
    
    // Show win modal
    setTimeout(() => {
        elements.winModal.classList.add('active');
        startConfetti();
    }, 500);
    
    return true;
}

elements.playAgainBtn.addEventListener('click', () => {
    stopConfetti();
    startGame();
});

// ============================================
// CONFETTI ANIMATION
// ============================================

let confettiAnimation = null;

function startConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#ff6b35', '#e63946', '#ffd700', '#4ade80', '#8b5cf6', '#00ffff'];
    
    // Create confetti particles
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            wobble: Math.random() * 10
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.angle);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size / 2);
            ctx.restore();
            
            c.y += c.speed;
            c.angle += c.spin;
            c.x += Math.sin(c.angle) * 0.5;
            
            // Reset when off screen
            if (c.y > canvas.height) {
                c.y = -20;
                c.x = Math.random() * canvas.width;
            }
        });
        
        if (gameState.isGameWon) {
            confettiAnimation = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function stopConfetti() {
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
    }
    
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ============================================
// KEYBOARD SUPPORT
// ============================================

document.addEventListener('keydown', (e) => {
    if (gameState.currentScreen !== 'game' || gameState.isPaused || gameState.isGameWon) return;
    
    const key = e.key;
    
    if (key >= '1' && key <= '9') {
        const num = parseInt(key);
        gameState.selectedNumber = num;
        
        // Update number pad visual
        elements.numberPad.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.num) === num) {
                btn.classList.add('selected');
            }
        });
        
        // Place number if cell is selected
        if (gameState.selectedCell && !isFixedCell(gameState.selectedCell.row, gameState.selectedCell.col)) {
            placeNumber(num);
        }
    } else if (key === '0' || key === 'Backspace' || key === 'Delete') {
        if (gameState.selectedCell && !isFixedCell(gameState.selectedCell.row, gameState.selectedCell.col)) {
            placeNumber(0);
        }
    } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        
        if (!gameState.selectedCell) {
            selectCell(0, 0);
            return;
        }
        
        let { row, col } = gameState.selectedCell;
        
        switch(key) {
            case 'ArrowUp': row = Math.max(0, row - 1); break;
            case 'ArrowDown': row = Math.min(8, row + 1); break;
            case 'ArrowLeft': col = Math.max(0, col - 1); break;
            case 'ArrowRight': col = Math.min(8, col + 1); break;
        }
        
        selectCell(row, col);
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Set default difficulty
document.querySelector('[data-level="easy"]').classList.add('active');
document.getElementById('difficulty-screen').classList.add('easy');

// Handle window resize for confetti canvas
window.addEventListener('resize', () => {
    elements.confettiCanvas.width = window.innerWidth;
    elements.confettiCanvas.height = window.innerHeight;
});

// Initialize
console.log('Sudoku Premium Game - Rs_ojha');
console.log('Ready to play!');
