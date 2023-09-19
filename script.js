const chessboard = document.getElementById('chessboard');
const scoreDisplay = document.getElementById('score');

const pieces = {
    'black': {
        'p': '⛀',
        'd': '⛁'
    },
    'white': {
        'p': '⛂',
        'd': '⛃'
    }
};

let scores = {
    'white': 0,
    'black': 0
};

let currentTurn = 'white';

function updateScoreDisplay() {
    scoreDisplay.innerText = `Blanc: ${scores.white} - Noir: ${scores.black}`;
}

function promoteToQueen(cell) {
    if (cell.innerText === pieces.black.p && cell.parentNode.rowIndex === 7) {
        cell.innerText = pieces.black.d;
    } else if (cell.innerText === pieces.white.p && cell.parentNode.rowIndex === 0) {
        cell.innerText = pieces.white.d;
    }
}

function canEatAgain(fromRow, fromCol, pieceType) {
    const directions = [
        { dx: 2, dy: 2 },
        { dx: 2, dy: -2 },
        { dx: -2, dy: 2 },
        { dx: -2, dy: -2 }
    ];

    for (const dir of directions) {
        let newRow = fromRow + dir.dy;
        let newCol = fromCol + dir.dx;

        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetCell = chessboard.rows[newRow].cells[newCol];
            if (targetCell.innerText) break;

            const middleCell = chessboard.rows[fromRow + dir.dy / 2].cells[fromCol + dir.dx / 2];
            if (middleCell.innerText && (middleCell.innerText !== pieces[currentTurn].p && middleCell.innerText !== pieces[currentTurn].d) && !targetCell.innerText) {
                return true;
            }

            if (pieceType !== 'd') break;
            newRow += dir.dy;
            newCol += dir.dx;
        }
    }
    return false;
}

function moveAndCapture(cell, dx, dy, isQueen) {
    const middleCell = chessboard.rows[selectedPiece.parentNode.rowIndex + dy / 2].cells[selectedPiece.cellIndex + dx / 2];
    if (!isQueen || (Math.abs(dx) === 2 && Math.abs(dy) === 2)) {
        if (middleCell.innerText && (middleCell.innerText !== pieces[currentTurn].p && middleCell.innerText !== pieces[currentTurn].d) && !cell.innerText) {
            cell.innerText = selectedPiece.innerText;
            promoteToQueen(cell);
            selectedPiece.innerText = '';
            middleCell.innerText = '';
            selectedPiece.classList.remove('selected');

            if (currentTurn === 'white') {
                scores.white += 1;
            } else {
                scores.black += 1;
            }
            updateScoreDisplay();

            if (canEatAgain(cell.parentNode.rowIndex, cell.cellIndex, selectedPiece.innerText.toLowerCase())) {
                selectedPiece = cell;
                selectedPiece.classList.add('selected');
            } else {
                selectedPiece = null;
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
            }
            return true;
        }
    } else {
        let captured = false;
        const stepX = dx > 0 ? 1 : -1;
        const stepY = dy > 0 ? 1 : -1;
        let checkX = selectedPiece.cellIndex + stepX;
        let checkY = selectedPiece.parentNode.rowIndex + stepY;
        let cellsToClear = [];

        while (checkX !== cell.cellIndex && checkY !== cell.parentNode.rowIndex) {
            const pathCell = chessboard.rows[checkY].cells[checkX];

            if (pathCell.innerText) {
                if (captured || (pathCell.innerText === pieces[currentTurn].p || pathCell.innerText === pieces[currentTurn].d)) {
                    return false;
                }

                captured = true;
                cellsToClear.push(pathCell);
            }

            checkX += stepX;
            checkY += stepY;
        }

        if (captured) {
            cell.innerText = selectedPiece.innerText;
            selectedPiece.innerText = '';
            cellsToClear.forEach(cell => cell.innerText = '');
            selectedPiece.classList.remove('selected');

            if (currentTurn === 'white') {
                scores.white += cellsToClear.length;
            } else {
                scores.black += cellsToClear.length;
            }
            updateScoreDisplay();

            if (canEatAgain(cell.parentNode.rowIndex, cell.cellIndex, selectedPiece.innerText.toLowerCase())) {
                selectedPiece = cell;
                selectedPiece.classList.add('selected');
            } else {
                selectedPiece = null;
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
            }
            return true;
        }
    }

    return false;
}

function checkGameOver() {
    let whiteCount = 0;
    let blackCount = 0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = chessboard.rows[i].cells[j];
            if (cell.innerText === pieces.white.p || cell.innerText === pieces.white.d) {
                whiteCount++;
            } else if (cell.innerText === pieces.black.p || cell.innerText === pieces.black.d) {
                blackCount++;
            }
        }
    }

    if (whiteCount === 0) {
        alert("Noir gagne la partie!");
        location.reload();
    } else if (blackCount === 0) {
        alert("Blanc gagne la partie!");
        location.reload();
    }
}

for (let i = 0; i < 8; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 8; j++) {
        const cell = document.createElement('td');
        if ((i + j) % 2 === 0) {
            cell.className = 'white';
        } else {
            cell.className = 'black';
            if (i < 3) {
                cell.innerText = pieces.black.p;
            } else if (i > 4) {
                cell.innerText = pieces.white.p;
            }
        }
        row.appendChild(cell);
    }
    chessboard.appendChild(row);
}

let selectedPiece = null;

chessboard.addEventListener('click', (event) => {
    const cell = event.target.closest('td');
    if (!cell) return;

    if (selectedPiece && cell.innerText === '') {
        const dx = cell.cellIndex - selectedPiece.cellIndex;
        const dy = cell.parentNode.rowIndex - selectedPiece.parentNode.rowIndex;
        const isQueen = [pieces[currentTurn].d, pieces[currentTurn === 'white' ? 'black' : 'white'].d].includes(selectedPiece.innerText);

        if (Math.abs(dx) === 1 && Math.abs(dy) === 1 && !isQueen) {
            cell.innerText = selectedPiece.innerText;
            promoteToQueen(cell);
            selectedPiece.innerText = '';
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
        } else if ((Math.abs(dx) === 2 && Math.abs(dy) === 2) || (isQueen && Math.abs(dx) === Math.abs(dy))) {
            if (moveAndCapture(cell, dx, dy, isQueen)) {
                return;
            }
        }
    } else if ((cell.innerText === pieces[currentTurn].p || cell.innerText === pieces[currentTurn].d) && !selectedPiece) {
        if (selectedPiece) {
            selectedPiece.classList.remove('selected');
        }
        selectedPiece = cell;
        selectedPiece.classList.add('selected');
    }
    checkGameOver();
});

updateScoreDisplay();