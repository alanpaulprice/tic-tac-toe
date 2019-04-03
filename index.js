let human = ``,
  computer = ``,
  mainBoard = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`],
  humanScore = 0,
  computerScore = 0,
  humanFirstTurn = true,
  humanTurnReady = true;

const DOM = {
  questionSymbol: document.getElementById(`question-symbol`),
  questionSymbolButtonO: document.getElementById(`question-symbol__button--o`),
  questionSymbolButtonX: document.getElementById(`question-symbol__button--x`),
  scoreboard: document.getElementById(`scoreboard`),
  computerScore: document.getElementById(`scoreboard__computer-value`),
  game: document.getElementById(`game`),
  squares: document.querySelectorAll(`.game__square`),
  squareIcons: document.querySelectorAll(`.game__icon`),
  resultMessage: document.getElementById(`result-message`)
};

// ========== QUESTION

function questionSymbol(choice) {
  human = choice;
  computer = choice === `x` ? `o` : `x`;
  DOM.questionSymbol.classList.add(`question-symbol--hidden`);
  DOM.scoreboard.classList.remove(`scoreboard--hidden`);
  DOM.game.classList.remove(`game--hidden`);
}

// ========== GAME RESET

function resetGame() {
  mainBoard = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];
  DOM.squares.forEach(
    (el, ind) =>
      (el.className = `game__square game__square--empty game__square-${ind}`)
  );
  DOM.squareIcons.forEach(i => (i.className = `game__icon fa`));
  humanFirstTurn = !humanFirstTurn;
  humanFirstTurn ? (humanTurnReady = true) : computerTurn();
}

// ========== EMPTY SQUARES

function emptySquares(board) {
  return board.filter(sq => sq !== `x` && sq !== `o`);
}

// ========== WINNING COMBO FOUND

function gameHasEnded(board, player) {
  return (
    (board[0] == player && board[1] == player && board[2] == player) ||
    (board[3] == player && board[4] == player && board[5] == player) ||
    (board[6] == player && board[7] == player && board[8] == player) ||
    (board[0] == player && board[3] == player && board[6] == player) ||
    (board[1] == player && board[4] == player && board[7] == player) ||
    (board[2] == player && board[5] == player && board[8] == player) ||
    (board[0] == player && board[4] == player && board[8] == player) ||
    (board[2] == player && board[4] == player && board[6] == player)
  );
}

// ========== CHECK FOR WIN

function checkForWin(symbol) {
  if (gameHasEnded(mainBoard, symbol)) {
    humanTurnReady = false;
    computerScore++;
    DOM.computerScore.innerHTML = computerScore;
    displayResultMessage(`COMPUTER WINS!`);
    setTimeout(() => resetGame(), 2000);
    return true;
  }

  if (!emptySquares(mainBoard).length) {
    displayResultMessage(`IT'S A DRAW!`);
    humanTurnReady = false;
    setTimeout(() => resetGame(), 2000);
    return true;
  }
  return false;
}

// ========== MINIMAX

function minimax(newBoard, player) {
  const availSpots = emptySquares(newBoard);

  // if game has ended, return the appropriate score
  if (gameHasEnded(newBoard, human)) return { score: -10 };
  if (gameHasEnded(newBoard, computer)) return { score: 10 };
  if (!availSpots.length) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    // will contain an index and score
    const move = {};
    // sets the index of move to the available spots index/square number
    move.index = newBoard[availSpots[i]];
    // sets the current square to the current turn taker's symbol
    newBoard[availSpots[i]] = player;

    // recursively explores the opponents next optimal move
    // stores the resulting score
    // de-optimize computer score by decrement (-1 for each level of depth/move)
    // this ensures that the selected move that is the fastest path to winning
    move.score =
      player === computer
        ? (move.score = minimax(newBoard, human).score)
        : (move.score = minimax(newBoard, computer).score - 1);
    // sets move object index to square number.
    newBoard[availSpots[i]] = move.index;
    // passes move object to moves array.
    moves.push(move);
  }

  let bestMove;

  // if judging a computer move, find the highest scoring
  if (player === computer) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // if judging a human move, find the lowest scoring
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

// ========== COMPUTER TURN

function computerTurn() {
  const square = minimax(mainBoard, computer).index;
  setTimeout(() => {
    mainBoard[square] = computer;
    visuallySelectSquare(square, computer);
    if (!checkForWin(computer)) humanTurnReady = true;
  }, 750);
}

// ========== HUMAN TURN

function humanTurn(square) {
  if (mainBoard[square] !== square || !humanTurnReady) return;
  humanTurnReady = false;
  mainBoard[square] = human;
  visuallySelectSquare(square, human);
  if (!checkForWin(human)) computerTurn();
}

// ========== VISUALLY SELECT SQUARE

function visuallySelectSquare(square, symbol) {
  DOM.squares[square].classList.remove(`game__square--empty`);
  DOM.squareIcons[square].classList.add(
    symbol === `x` ? `fa-times` : `fa-circle-o`,
    `game__icon--show`
  );
}

// ========== DISPLAY RESULT MESSAGE

function displayResultMessage(msg) {
  DOM.resultMessage.innerHTML = ``;
  DOM.resultMessage.innerHTML = `
    <div class="result-message__box">
      <span class="result-message__text">${msg}</span>
    </div>
  `;
}

// ========== CLICK EVENTS

DOM.questionSymbolButtonO.addEventListener(`click`, () => questionSymbol(`o`));
DOM.questionSymbolButtonX.addEventListener(`click`, () => questionSymbol(`x`));

DOM.game.addEventListener(
  `click`,
  e => e.target.dataset.value && humanTurn(e.target.dataset.value)
);
