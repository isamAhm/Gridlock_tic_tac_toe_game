document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const restartButton = document.getElementById("restart");
  const playerVsPlayerButton = document.getElementById("player-vs-player");
  const playerVsAiButton = document.getElementById("player-vs-ai");
  const resultDisplay = document.getElementById("result");
  const turnBoxes = document.querySelectorAll(".turn-box");
  const trainingMessage = document.getElementById("training-message");

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

  let qTable = {};
  const alpha = 0.2;
  const gamma = 0.9;
  let epsilon = 0.4;

  function getStateKey(state) {
    return state.join("");
  }

  function getBestMove(state, player) {
    const stateKey = getStateKey(state);
    if (!qTable[stateKey]) {
      qTable[stateKey] = Array(9).fill(0);
    }

    if (Math.random() < epsilon) {
      let availableMoves = [];
      state.forEach((cell, idx) => {
        if (cell === "") availableMoves.push(idx);
      });
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      let maxQValue = -Infinity;
      let bestMove = 0;
      for (let i = 0; i < 9; i++) {
        if (state[i] === "" && qTable[stateKey][i] > maxQValue) {
          maxQValue = qTable[stateKey][i];
          bestMove = i;
        }
      }
      return bestMove;
    }
  }

  function updateQTable(prevState, action, reward, nextState) {
    const prevStateKey = getStateKey(prevState);
    const nextStateKey = getStateKey(nextState);

    if (!qTable[prevStateKey]) {
      qTable[prevStateKey] = Array(9).fill(0);
    }
    if (!qTable[nextStateKey]) {
      qTable[nextStateKey] = Array(9).fill(0);
    }

    const maxNextQValue = Math.max(...qTable[nextStateKey]);
    qTable[prevStateKey][action] =
      qTable[prevStateKey][action] +
      alpha * (reward + gamma * maxNextQValue - qTable[prevStateKey][action]);
  }

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

  function aiMove() {
    const prevState = [...boardState];
    const bestSpot = getBestMove(boardState, "o");
    handleCellClick(
      document.querySelector(`.cell[data-index="${bestSpot}"]`),
      bestSpot
    );
    const reward = resultDisplay.innerText.includes("wins")
      ? currentPlayer === "x"
        ? -10
        : 10
      : 0;
    updateQTable(prevState, bestSpot, reward, boardState);
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

  function trainAI(epochs) {
    let trainingCount = 0;
    function playGame() {
      let state = ["", "", "", "", "", "", "", "", ""];
      let player = "x";
      while (true) {
        const availableMoves = state
          .map((s, i) => (s === "" ? i : null))
          .filter((i) => i !== null);
        if (availableMoves.length === 0) break;

        let move;
        if (player === "x") {
          move =
            availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random move
        } else {
          move = getBestMove(state, player);
        }

        state[move] = player;
        if (checkWin(state, player)) {
          updateQTable(state, move, player === "x" ? -10 : 10, state);
          break;
        }
        player = player === "x" ? "o" : "x";
      }
      trainingCount++;
      if (trainingCount < epochs) {
        setTimeout(playGame, 10);
      } else {
        trainingMessage.innerText = "Training Complete! You can now play.";
        epsilon = 0.1;
      }
    }
    trainingMessage.innerText = "Training AI... Please wait.";
    playGame();
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
    trainAI(1000);
  });

  updateTurnBox();
});
