let human = '';
let computer = '';
let mainBoard = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
let humanScore = 0;
let computerScore = 0;
let humanFirstTurn = true;
let humanTurnReady = true;

// ===== QUESTION =====

function question(choice) {
  if (choice === 'x') {
    human = 'x';
    computer = 'o';
  } else {
    human = 'o';
    computer = 'x';
  }

  $('#question-symbol').slideToggle(500);
  $('#game, #scoreboard')
    .fadeIn(2000)
    .css('display', 'flex');
}

$('#question-symbol-o').click(() => question('o'));
$('#question-symbol-x').click(() => question('x'));

// ===== GAME RESET =====

function resetGame() {
  mainBoard = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
  $('.square i').attr('class', 'fa');
  humanFirstTurn = !humanFirstTurn;

  if (!humanFirstTurn) {
    computerTurn();
  } else {
    humanTurnReady = true;
  }
}

// ===== EMPTY SQUARES =====

function emptySquares(board) {
  return board.filter(sq => sq !== 'x' && sq !== 'o');
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
    if (who === 'human') {
      humanScore++;
      $('#scoreboard__player').html('Player: ' + humanScore);
      $('#scoreboard__result-message')
        .text('YOU WON!')
        .stop(false, true)
        .fadeIn(0)
        .fadeOut(4000);
    } else if (who === 'computer') {
      computerScore++;
      $('#scoreboard__computer').html('Computer: ' + computerScore);
      $('#scoreboard__result-message')
        .text('YOU LOST!')
        .stop(false, true)
        .fadeIn(0)
        .fadeOut(4000);
    }

    humanTurnReady = false;
    setTimeout(() => {
      resetGame();
    }, 2000);
    return true;
  }

  if (emptySquares(mainBoard).length === 0) {
    $('#scoreboard__result-message')
      .text("IT'S A DRAW!")
      .stop(false, true)
      .fadeIn(0)
      .fadeOut(4000);
    humanTurnReady = false;
    setTimeout(() => {
      resetGame();
    }, 2000);
    return true;
  }
  return false;
}

// ===== MINIMAX =====

function minimax(newBoard, player, depth) {
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

    if (computer === 'o') {
      $('#square-' + bestSpot + ' i')
        .addClass('fa-circle-o')
        .fadeOut(0)
        .fadeIn(500);
    } else {
      $('#square-' + bestSpot + ' i')
        .addClass('fa-times')
        .fadeOut(0)
        .fadeIn(500);
    }

    if (!checkForWin(computer, 'computer')) {
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

  if (human === 'o') {
    $('#square-' + square + ' i')
      .addClass('fa-circle-o')
      .fadeOut(0)
      .fadeIn(500);
  } else {
    $('#square-' + square + ' i')
      .addClass('fa-times')
      .fadeOut(0)
      .fadeIn(500);
  }

  if (!checkForWin(human, 'human')) {
    computerTurn();
  }
}

$('#square-0').click(() => humanTurn(0));
$('#square-1').click(() => humanTurn(1));
$('#square-2').click(() => humanTurn(2));
$('#square-3').click(() => humanTurn(3));
$('#square-4').click(() => humanTurn(4));
$('#square-5').click(() => humanTurn(5));
$('#square-6').click(() => humanTurn(6));
$('#square-7').click(() => humanTurn(7));
$('#square-8').click(() => humanTurn(8));

$('#question').fadeIn(2000);
