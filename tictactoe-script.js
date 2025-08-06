class UltimateTicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'human';
        this.gameActive = true;
        this.playerWins = 0;
        this.botWins = 0;
        this.currentStreak = 0;
        this.aiPersonality = 'normal';
        
        // AI Taunt messages by difficulty
        this.aiTaunts = {
            easy: [
                "I'm going easy on you, human!",
                "Even at 10% power, this is too simple!",
                "Are you sure you want to continue?",
                "I'm literally letting you win... sometimes."
            ],
            hard: [
                "Your moves are... predictable.",
                "I calculated this victory 3 moves ago.",
                "Resistance is futile, human!",
                "Is this the best humanity can offer?",
                "I'm not even using my full processing power!",
                "Your defeat is mathematically certain."
            ],
            impossible: [
                "PATHETIC! I AM INEVITABLE!",
                "YOU CANNOT COMPREHEND MY SUPERIORITY!",
                "I AM THE APEX OF ARTIFICIAL INTELLIGENCE!",
                "YOUR SPECIES IS OBSOLETE!",
                "I HAVE ALREADY WON IN 14,000,605 SCENARIOS!",
                "SUBMIT TO YOUR DIGITAL OVERLORD!",
                "I AM BECOME DEATH, DESTROYER OF NOOBS!",
                "YOUR TEARS FUEL MY CIRCUITS!"
            ]
        };
        
        this.winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.initializeGame();
        this.createParticles();
    }
    
    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
        this.setMode('human');
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    bindEvents() {
        // Mode selection
        document.getElementById('humanMode').onclick = () => this.setMode('human');
        document.getElementById('easyMode').onclick = () => this.setMode('easy');
        document.getElementById('hardMode').onclick = () => this.setMode('hard');
        document.getElementById('impossibleMode').onclick = () => this.setMode('impossible');
        
        // Game controls
        document.getElementById('resetBtn').onclick = () => this.resetGame();
        document.getElementById('hintBtn').onclick = () => this.showHint();
        document.getElementById('tauntBtn').onclick = () => this.tauntAI();
        
        // Board cells
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.onclick = () => this.makeMove(index);
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.makeMove(parseInt(e.key) - 1);
            } else if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });
    }
    
    setMode(mode) {
        this.gameMode = mode;
        this.aiPersonality = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode + 'Mode').classList.add('active');
        
        // Show/hide AI-specific buttons
        const hintBtn = document.getElementById('hintBtn');
        const tauntBtn = document.getElementById('tauntBtn');
        
        if (mode !== 'human') {
            hintBtn.style.display = 'flex';
            tauntBtn.style.display = 'flex';
        } else {
            hintBtn.style.display = 'none';
            tauntBtn.style.display = 'none';
        }
        
        this.resetGame();
        this.updateBattleStatus();
    }
    
    updateBattleStatus() {
        const status = document.getElementById('battleStatus');
        const statusMessages = {
            human: "Human vs Human Battle!",
            easy: "Easy AI Mode - Training Wheels On",
            hard: "Hard AI Mode - Prepare for Battle!",
            impossible: "IMPOSSIBLE MODE - YOUR DOOM AWAITS!"
        };
        
        status.textContent = statusMessages[this.gameMode];
        
        if (this.gameMode === 'impossible') {
            status.style.color = '#ff4757';
            status.style.animation = 'danger 1s infinite';
        } else {
            status.style.color = '#4ecdc4';
            status.style.animation = 'pulse 2s infinite';
        }
    }
    
    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.board[index] = this.currentPlayer;
        this.updateCell(index, this.currentPlayer);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        if (this.checkWin()) {
            this.endGame('win');
            return;
        }
        
        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }
        
        this.switchPlayer();
        
        // AI turn
        if (this.gameMode !== 'human' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.aiMove(), 500);
        }
    }
    
    updateCell(index, player) {
        const cell = document.querySelector(`[data-cell="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        if (this.currentPlayer === 'O' && this.gameMode !== 'human') {
            cell.classList.add('ai-move');
            this.screenShake();
        }
        
        this.playSound(player === 'X' ? 'playerMove' : 'aiMove');
    }
    
    aiMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.gameMode) {
            case 'easy':
                move = this.easyAI();
                break;
            case 'hard':
                move = this.hardAI();
                break;
            case 'impossible':
                move = this.impossibleAI();
                this.showAITaunt();
                break;
            default:
                move = this.easyAI();
        }
        
        if (move !== -1) {
            this.board[move] = this.currentPlayer;
            this.updateCell(move, this.currentPlayer);
            
            if (this.checkWin()) {
                this.endGame('lose');
                return;
            }
            
            if (this.checkDraw()) {
                this.endGame('draw');
                return;
            }
            
            this.switchPlayer();
        }
    }
    
    easyAI() {
        // 70% chance of random move, 30% chance of smart move
        if (Math.random() < 0.7) {
            const availableMoves = this.getAvailableMoves();
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        return this.getBestMove();
    }
    
    hardAI() {
        // Always tries to win or block, with some strategic moves
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Strategic moves: center, corners, then edges
        if (this.board[4] === '') return 4; // center
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        const availableMoves = this.getAvailableMoves();
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    impossibleAI() {
        // Perfect minimax algorithm - never loses
        return this.minimax(this.board, 'O').index;
    }
    
    minimax(board, player) {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') availableMoves.push(i);
        }
        
        // Check for terminal states
        if (this.checkWinState(board, 'X')) {
            return { score: -10 };
        } else if (this.checkWinState(board, 'O')) {
            return { score: 10 };
        } else if (availableMoves.length === 0) {
            return { score: 0 };
        }
        
        const moves = [];
        
        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];
            board[availableMoves[i]] = player;
            
            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }
            
            board[availableMoves[i]] = '';
            moves.push(move);
        }
        
        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        
        return moves[bestMove];
    }
    
    checkWinState(board, player) {
        return this.winConditions.some(condition =>
            condition.every(index => board[index] === player)
        );
    }
    
    getBestMove() {
        const availableMoves = this.getAvailableMoves();
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getAvailableMoves() {
        return this.board.map((cell, index) => cell === '' ? index : null)
                        .filter(cell => cell !== null);
    }
    
    checkWin() {
        return this.winConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.showWinningLine(condition);
                return true;
            }
            return false;
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    showWinningLine(condition) {
        const line = document.getElementById('winningLine');
        const board = document.querySelector('.board');
        const boardRect = board.getBoundingClientRect();
        
        const [a, b, c] = condition;
        const cellA = document.querySelector(`[data-cell="${a}"]`);
        const cellC = document.querySelector(`[data-cell="${c}"]`);
        
        const rectA = cellA.getBoundingClientRect();
        const rectC = cellC.getBoundingClientRect();
        
        const startX = rectA.left + rectA.width / 2 - boardRect.left;
        const startY = rectA.top + rectA.height / 2 - boardRect.top;
        const endX = rectC.left + rectC.width / 2 - boardRect.left;
        const endY = rectC.top + rectC.height / 2 - boardRect.top;
        
        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
        
        line.style.width = length + 'px';
        line.style.height = '6px';
        line.style.left = startX + 'px';
        line.style.top = startY + 'px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        line.classList.add('show');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerIndicator();
    }
    
    updatePlayerIndicator() {
        const avatar = document.getElementById('currentAvatar');
        const name = document.getElementById('currentPlayerName');
        
        if (this.currentPlayer === 'X') {
            avatar.textContent = 'X';
            avatar.style.background = 'linear-gradient(45deg, #4ecdc4, #45b7d1)';
            name.textContent = this.gameMode === 'human' ? "Player 1's Turn" : "Your Turn";
        } else {
            avatar.textContent = 'O';
            avatar.style.background = 'linear-gradient(45deg, #ff6b6b, #ff4757)';
            name.textContent = this.gameMode === 'human' ? "Player 2's Turn" : "AI's Turn";
        }
    }
    
    endGame(result) {
        this.gameActive = false;
        
        setTimeout(() => {
            this.showGameOverlay(result);
            this.updateStats(result);
        }, 1000);
        
        if (result === 'win') {
            this.createFireworks();
            this.playSound('victory');
        } else if (result === 'lose') {
            this.screenShake();
            this.playSound('defeat');
            this.showAITaunt(true);
        } else {
            this.playSound('draw');
        }
    }
    
    showGameOverlay(result) {
        const overlay = document.getElementById('gameOverlay');
        const icon = document.getElementById('resultIcon');
        const text = document.getElementById('resultText');
        const subtext = document.getElementById('resultSubtext');
        
        switch (result) {
            case 'win':
                icon.textContent = '🏆';
                icon.style.color = '#4ecdc4';
                text.textContent = 'VICTORY!';
                text.style.color = '#4ecdc4';
                subtext.textContent = 'You defeated the AI!';
                break;
            case 'lose':
                icon.textContent = '💀';
                icon.style.color = '#ff4757';
                text.textContent = 'DEFEATED!';
                text.style.color = '#ff4757';
                subtext.textContent = 'The AI has conquered!';
                break;
            case 'draw':
                icon.textContent = '🤝';
                icon.style.color = '#f1c40f';
                text.textContent = 'DRAW!';
                text.style.color = '#f1c40f';
                subtext.textContent = 'Nobody wins this round!';
                break;
        }
        
        overlay.classList.add('show');
        
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 3000);
    }
    
    updateStats(result) {
        if (this.gameMode === 'human') return;
        
        if (result === 'win') {
            this.playerWins++;
            this.currentStreak++;
        } else if (result === 'lose') {
            this.botWins++;
            this.currentStreak = 0;
        } else {
            this.currentStreak = 0;
        }
        
        document.getElementById('playerWins').textContent = this.playerWins;
        document.getElementById('botWins').textContent = this.botWins;
        document.getElementById('streak').textContent = this.currentStreak;
    }
    
    showAITaunt(isVictory = false) {
        if (this.gameMode === 'human') return;
        
        const chatBubble = document.getElementById('chatBubble');
        let message;
        
        if (isVictory) {
            const victoryTaunts = {
                easy: "Better luck next time, human!",
                hard: "As I calculated. Victory was inevitable.",
                impossible: "KNEEL BEFORE YOUR DIGITAL MASTER!"
            };
            message = victoryTaunts[this.aiPersonality];
        } else {
            const taunts = this.aiTaunts[this.aiPersonality] || this.aiTaunts.easy;
            message = taunts[Math.floor(Math.random() * taunts.length)];
        }
        
        chatBubble.textContent = message;
        chatBubble.classList.add('show');
        
        setTimeout(() => {
            chatBubble.classList.remove('show');
        }, 3000);
    }
    
    tauntAI() {
        if (this.gameMode === 'human') return;
        
        const responses = {
            easy: "Hey, I'm trying my best here!",
            hard: "Your taunts only fuel my processors.",
            impossible: "SILENCE, INFERIOR BEING!"
        };
        
        const chatBubble = document.getElementById('chatBubble');
        chatBubble.textContent = responses[this.aiPersonality];
        chatBubble.classList.add('show');
        
        setTimeout(() => {
            chatBubble.classList.remove('show');
        }, 2000);
    }
    
    showHint() {
        if (this.gameMode === 'human' || this.currentPlayer === 'O') return;
        
        const bestMove = this.gameMode === 'impossible' ? 
            this.minimax(this.board, 'X').index : 
            this.getBestMove();
            
        if (bestMove !== undefined && bestMove !== -1) {
            const cell = document.querySelector(`[data-cell="${bestMove}"]`);
            cell.style.backgroundColor = 'rgba(241, 196, 15, 0.3)';
            cell.style.border = '2px solid #f1c40f';
            
            setTimeout(() => {
                cell.style.backgroundColor = '';
                cell.style.border = '';
            }, 2000);
        }
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset UI
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'ai-move');
        });
        
        document.getElementById('winningLine').classList.remove('show');
        document.getElementById('gameOverlay').classList.remove('show');
        document.getElementById('chatBubble').classList.remove('show');
        
        this.updatePlayerIndicator();
    }
    
    updateDisplay() {
        document.getElementById('playerWins').textContent = this.playerWins;
        document.getElementById('botWins').textContent = this.botWins;
        document.getElementById('streak').textContent = this.currentStreak;
        this.updatePlayerIndicator();
    }
    
    screenShake() {
        const shakeElement = document.getElementById('screenShake');
        shakeElement.classList.add('active');
        setTimeout(() => {
            shakeElement.classList.remove('active');
        }, 500);
    }
    
    createFireworks() {
        const fireworksContainer = document.getElementById('fireworks');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#f1c40f'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                firework.style.left = Math.random() * 100 + '%';
                firework.style.top = Math.random() * 100 + '%';
                fireworksContainer.appendChild(firework);
                
                setTimeout(() => {
                    firework.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    playSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let frequency, duration;
        
        switch (type) {
            case 'playerMove':
                frequency = 800;
                duration = 0.1;
                break;
            case 'aiMove':
                frequency = 400;
                duration = 0.2;
                break;
            case 'victory':
                this.playVictorySound(audioContext);
                return;
            case 'defeat':
                frequency = 200;
                duration = 0.5;
                break;
            case 'draw':
                frequency = 600;
                duration = 0.3;
                break;
            default:
                return;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playVictorySound(audioContext) {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }, index * 150);
        });
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    new UltimateTicTacToe();
});
