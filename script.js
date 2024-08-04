document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const restartButton = document.getElementById("restart");
  const playerVsPlayerButton = document.getElementById("player-vs-player");
  const playerVsAiButton = document.getElementById("player-vs-ai");
  const resultDisplay = document.getElementById("result");
  const turnBoxes = document.querySelectorAll(".turn-box");

  let isPlayerVsAI = false;
  let currentPlayer = "x";
  let boardState = ["", "", "", "", "", "", "", "", ""];
  let isGameActive = true;

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
      const winCondition = winningConditions[i];
      let a = boardState[winCondition[0]];
      let b = boardState[winCondition[1]];
      let c = boardState[winCondition[2]];
      if (a === "" || b === "" || c === "") {
        continue;
      }
      if (a === b && b === c) {
        roundWon = true;
        winCondition.forEach((index) => {
          cells[index].classList.add("bg");
        });
        break;
      }
    }

    if (roundWon) {
      isGameActive = false;
      resultDisplay.innerText = `Player ${currentPlayer.toUpperCase()} wins!`;
      return;
    }

    if (!boardState.includes("")) {
      isGameActive = false;
      resultDisplay.innerText = "It's a draw!";
    }
  }

  function minimax(newBoard, player) {
    const availSpots = newBoard.filter((s) => s === "");

    if (checkWin(newBoard, "x")) {
      return { score: -10 };
    } else if (checkWin(newBoard, "o")) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = newBoard.indexOf("");
      newBoard[move.index] = player;

      if (player === "o") {
        const result = minimax(newBoard, "x");
        move.score = result.score;
      } else {
        const result = minimax(newBoard, "o");
        move.score = result.score;
      }

      newBoard[move.index] = "";
      moves.push(move);
    }

    let bestMove;
    if (player === "o") {
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

  function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
      const winCondition = winningConditions[i];
      let a = board[winCondition[0]];
      let b = board[winCondition[1]];
      let c = board[winCondition[2]];
      if (a === player && b === player && c === player) {
        return true;
      }
    }
    return false;
  }

  function aiMove() {
    const bestSpot = minimax(boardState, "o").index;
    handleCellClick(
      document.querySelector(`.cell[data-index="${bestSpot}"]`),
      bestSpot
    );
  }

  function handleCellClick(clickedCell, index) {
    if (boardState[index] !== "" || !isGameActive) {
      return;
    }

    boardState[index] = currentPlayer;
    clickedCell.classList.add(
      currentPlayer === "x" ? "text-red-500" : "text-blue-500"
    );
    clickedCell.innerText = currentPlayer;

    handleResultValidation();

    currentPlayer = currentPlayer === "x" ? "o" : "x";
    updateTurnBox();

    if (isPlayerVsAI && isGameActive && currentPlayer === "o") {
      aiMove();
    }
  }

  function updateTurnBox() {
    turnBoxes.forEach((box) => {
      box.classList.remove("turn");
      if (box.innerText.toLowerCase() === currentPlayer) {
        box.classList.add("turn");
      }
    });
  }

  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => handleCellClick(cell, index));
  });

  restartButton.addEventListener("click", () => {
    isGameActive = true;
    currentPlayer = "x";
    boardState = ["", "", "", "", "", "", "", "", ""];
    resultDisplay.innerText = "";
    cells.forEach((cell) => {
      cell.classList.remove("text-red-500", "text-blue-500", "bg");
      cell.innerText = "";
    });
    updateTurnBox();
  });

  playerVsPlayerButton.addEventListener("click", () => {
    isPlayerVsAI = false;
    restartButton.click();
  });

  playerVsAiButton.addEventListener("click", () => {
    isPlayerVsAI = true;
    restartButton.click();
  });

  updateTurnBox();
});
