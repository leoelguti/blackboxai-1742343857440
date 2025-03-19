// Variables globales
let calledNumbers = new Set();
const totalBalls = 75;
let currentNumber = null;
let isAnimating = false;
let gameMode = 'line'; // 'line' o 'bingo'
let winners = new Set(); // Almacena los cartones ganadores

// Inicializar la cuadrícula de bolas
function initializeBallsGrid() {
    const grid = document.getElementById('ballsGrid');
    for (let i = 1; i <= totalBalls; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.id = `ball-${i}`;
        ball.textContent = i;
        grid.appendChild(ball);
    }
}

// Generar número aleatorio
function generateRandomNumber() {
    if (isAnimating || calledNumbers.size >= totalBalls) return;
    
    isAnimating = true;
    const numberDisplay = document.getElementById('randomNumber');
    let counter = 0;
    
    // Animación de números aleatorios
    const animation = setInterval(() => {
        let randomNum;
        do {
            randomNum = Math.floor(Math.random() * totalBalls) + 1;
        } while (calledNumbers.has(randomNum));
        
        numberDisplay.textContent = randomNum;
        counter++;
        
        if (counter >= 20) {
            clearInterval(animation);
            finalizeNumberGeneration(randomNum);
        }
    }, 100);
}

// Finalizar la generación del número
function finalizeNumberGeneration(number) {
    currentNumber = number;
    calledNumbers.add(number);
    
    // Marcar la bola en la cuadrícula
    const ball = document.getElementById(`ball-${number}`);
    ball.classList.add('called');
    
    isAnimating = false;
    
    // Marcar el número en los cartones si coincide
    markNumberInCards(number);
    
    // Verificar ganadores después de marcar números
    checkWinners();
}

// Generar cartón de bingo
function generateBingoCard() {
    const card = {
        B: generateColumnNumbers(1, 15, 5),
        I: generateColumnNumbers(16, 30, 5),
        N: generateColumnNumbers(31, 45, 5),
        G: generateColumnNumbers(46, 60, 5),
        O: generateColumnNumbers(61, 75, 5)
    };
    
    // Establecer casilla central como libre
    card.N[2] = 'FREE';
    
    return card;
}

// Generar números para una columna
function generateColumnNumbers(min, max, count) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers);
}

// Crear elemento visual del cartón
function createBingoCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bingo-card';
    cardDiv.dataset.cardIndex = index;
    
    // Crear encabezado
    const header = document.createElement('div');
    header.className = 'bingo-header';
    'BINGO'.split('').forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.textContent = letter;
        header.appendChild(letterDiv);
    });
    cardDiv.appendChild(header);
    
    // Crear cuadrícula de números
    const grid = document.createElement('div');
    grid.className = 'bingo-grid';
    
    for (let row = 0; row < 5; row++) {
        'BINGO'.split('').forEach((letter, col) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            const number = card[letter][row];
            
            if (number === 'FREE') {
                cell.className += ' free marked';
                cell.textContent = 'FREE';
            } else {
                cell.textContent = number;
            }
            
            grid.appendChild(cell);
        });
    }
    cardDiv.appendChild(grid);
    
    // Agregar número de serie
    const serial = document.createElement('div');
    serial.className = 'text-white text-sm mt-2';
    serial.textContent = `Serial: ${index + 1}`;
    cardDiv.appendChild(serial);
    
    return cardDiv;
}

// Generar cartones
function generateCards() {
    const container = document.getElementById('bingoCards');
    container.innerHTML = '';
    
    // Obtener y validar la cantidad de cartones
    const input = document.getElementById('cardCount');
    const cardCount = parseInt(input.value) || 4;
    const validCardCount = Math.min(Math.max(cardCount, 1), 20);
    
    // Forzar la actualización del valor del input
    setTimeout(() => {
        input.value = validCardCount;
    }, 0);
    
    // Reiniciar el juego
    calledNumbers.clear();
    winners.clear();
    gameMode = 'line';
    document.getElementById('gameMode').textContent = 'Modo: Línea';
    document.getElementById('randomNumber').textContent = '?';
    
    // Limpiar las bolas marcadas
    document.querySelectorAll('.ball').forEach(ball => ball.classList.remove('called'));
    
    // Generar los cartones
    for (let i = 0; i < validCardCount; i++) {
        const card = generateBingoCard();
        const cardElement = createBingoCardElement(card, i);
        container.appendChild(cardElement);
    }
}

// Marcar número en los cartones
function markNumberInCards(number) {
    const cards = document.querySelectorAll('.bingo-card');
    cards.forEach(card => {
        const cells = card.querySelectorAll('.bingo-cell');
        cells.forEach(cell => {
            if (cell.textContent === number.toString()) {
                cell.classList.add('marked');
            }
        });
    });
}

// Verificar si hay línea completa en un cartón
function checkLine(card) {
    const rows = [0, 1, 2, 3, 4];
    return rows.some(row => {
        const cells = card.querySelectorAll(`.bingo-cell[data-row="${row}"]`);
        return Array.from(cells).every(cell => cell.classList.contains('marked'));
    });
}

// Verificar si hay cartón completo
function checkFullCard(card) {
    const cells = card.querySelectorAll('.bingo-cell');
    return Array.from(cells).every(cell => cell.classList.contains('marked'));
}

// Verificar ganadores
function checkWinners() {
    const cards = document.querySelectorAll('.bingo-card');
    
    cards.forEach(card => {
        const cardIndex = card.dataset.cardIndex;
        
        if (winners.has(cardIndex)) return; // Skip already won cards
        
        if (gameMode === 'line' && checkLine(card)) {
            winners.add(cardIndex);
            card.style.border = '4px solid gold';
            alert(`¡Línea! Cartón #${parseInt(cardIndex) + 1} ha ganado!`);
            
            // Si hay al menos un ganador en modo línea, cambiar a modo bingo
            if (winners.size > 0) {
                gameMode = 'bingo';
                document.getElementById('gameMode').textContent = 'Modo: Bingo Completo';
            }
        } else if (gameMode === 'bingo' && checkFullCard(card)) {
            winners.add(cardIndex);
            card.style.border = '4px solid gold';
            alert(`¡Bingo! Cartón #${parseInt(cardIndex) + 1} ha ganado!`);
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeBallsGrid();
    
    document.getElementById('generateNumber').addEventListener('click', generateRandomNumber);
    document.getElementById('generateCards').addEventListener('click', generateCards);
});
