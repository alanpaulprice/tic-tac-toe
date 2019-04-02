let human = ``;
let computer = ``;
let mainBoard = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];
let humanScore = 0;
let computerScore = 0;
let humanFirstTurn = true;
let humanTurnReady = true;

const DOM = {
  questionSymbol: document.getElementById(`question-symbol`),
  questionSymbolButtonO: document.getElementById(`question-symbol__button--o`),
  questionSymbolButtonX: document.getElementById(`question-symbol__button--x`),
  scoreboard: document.getElementById(`scoreboard`),
  scoreboardPlayerValue: document.getElementById(`scoreboard__player-value`),
  scoreboardComputerValue: document.getElementById(
    `scoreboard__computer-value`
  ),
  game: document.getElementById(`game`),
  squareIcons: document.querySelectorAll(`.game__square i`),
  resultMessage: document.getElementById(`result-message`)
};

// ===== QUESTION =====

function questionSymbol(choice) {
  if (choice === `x`) {
    human = `x`;
    computer = `o`;
  } else {
    human = `o`;
    computer = `x`;
  }

  DOM.questionSymbol.classList.add(`question-symbol--hidden`);
  DOM.game.classList.remove(`game--hidden`);
  DOM.scoreboard.classList.remove(`scoreboard--hidden`);
}

// ===== GAME RESET =====

function resetGame() {
  mainBoard = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`];
  DOM.squareIcons.forEach(i => (i.className = `fa`));
  humanFirstTurn = !humanFirstTurn;

  if (!humanFirstTurn) {
    computerTurn();
  } else {
    humanTurnReady = true;
  }
}

// ===== EMPTY SQUARES =====

function emptySquares(board) {
  return board.filter(sq => sq !== `x` && sq !== `o`);
}

// ===== WINNING COMBO FOUND =====

function winningComboFound(board, player) {
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

// ===== CHECK FOR WIN =====

function checkForWin(symbol, who) {
  if (winningComboFound(mainBoard, symbol)) {
    if (who === `human`) {
      humanScore++;
      DOM.scoreboardPlayerValue.innerHTML = humanScore;
      displayResultMessage(`PLAYER WINS!`);
    } else if (who === `computer`) {
      computerScore++;
      DOM.scoreboardComputerValue.innerHTML = computerScore;
      displayResultMessage(`COMPUTER WINS!`);
    }

    humanTurnReady = false;
    setTimeout(() => {
      resetGame();
    }, 2000);
    return true;
  }

  if (emptySquares(mainBoard).length === 0) {
    displayResultMessage(`IT'S A DRAW!`);
    humanTurnReady = false;
    setTimeout(() => {
      resetGame();
    }, 2000);
    return true;
  }
  return false;
}

// ===== MINIMAX =====

function minimax(newBoard, player) {
  let availSpots = emptySquares(newBoard);

  // Ends recursion and returns score if game has reached conclusion
  if (winningComboFound(newBoard, human)) {
    return { score: -10 };
  } else if (winningComboFound(newBoard, computer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  // Collects scores
  let moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    // Will contain move info, later pushed to moves array
    let move = {};
    // Sets the index of move to the available spots index/square number
    move.index = newBoard[availSpots[i]];
    // Sets the current square to the current turn taker's symbol
    newBoard[availSpots[i]] = player;
    // If the current turn taker is the computer, run algo on other player
    // Then pushes returned score to move object.
    if (player === computer) {
      let result = minimax(newBoard, human);
      move.score = result.score;
    } else {
      let result = minimax(newBoard, computer);
      move.score = result.score - 1; // remove '- 1' to de-optimise (deducts 1 for each level of depth)
    }
    // Sets move object index to square number.
    newBoard[availSpots[i]] = move.index;
    // Passes move object to moves array.
    moves.push(move);
  }

  // Identifies the best move
  let bestMove;
  // Iterate through the array of moves and, if the current move is
  // higher than the current high score, replace it.
  // Update bestMove variable to the index of that new best move.
  if (player === computer) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // Same as as above, just looking for lowest score instead of highest.
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

// ===== COMPUTER TURN =====

function computerTurn() {
  let bestSpot = minimax(mainBoard, computer).index;

  setTimeout(() => {
    mainBoard[bestSpot] = computer;

    if (computer === `o`) {
      $(`#game__square-${bestSpot} i`)
        .addClass(`fa-circle-o`)
        .fadeOut(0)
        .fadeIn(500);
    } else {
      $(`#game__square-${bestSpot} i`)
        .addClass(`fa-times`)
        .fadeOut(0)
        .fadeIn(500);
    }

    if (!checkForWin(computer, `computer`)) {
      humanTurnReady = true;
    }
  }, 1000);
}

// ===== HUMAN TURN =====

function humanTurn(square) {
  if (mainBoard[square] !== square.toString() || !humanTurnReady) {
    return;
  }

  mainBoard[square] = human;

  humanTurnReady = false;

  if (human === `o`) {
    $(`#game__square-${square} i`)
      .addClass(`fa-circle-o`)
      .fadeOut(0)
      .fadeIn(500);
  } else {
    $(`#game__square-${square} i`)
      .addClass(`fa-times`)
      .fadeOut(0)
      .fadeIn(500);
  }

  if (!checkForWin(human, `human`)) {
    computerTurn();
  }
}

// ===== DISPLAY RESULT MESSAGE =====

function displayResultMessage(msg) {
  DOM.resultMessage.innerHTML = ``;
  DOM.resultMessage.innerHTML = `
    <div class="result-message__box">
      <span class="result-message__text">${msg}</span>
    </div>
  `;
}

// ===== CLICK EVENTS =====

DOM.questionSymbolButtonO.addEventListener(`click`, () => questionSymbol(`o`));
DOM.questionSymbolButtonX.addEventListener(`click`, () => questionSymbol(`x`));
DOM.game.addEventListener(`click`, e => {
  if (e.target.dataset.value) humanTurn(e.target.dataset.value);
});
