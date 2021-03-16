document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const maxscoreboard = document.querySelector("#max-score");
  const scoreboard = document.querySelector("#score");
  const levelboard = document.querySelector("#level");
  const buttonPause = document.querySelector("#btn-pause");
  const buttonReset = document.querySelector("#btn-reset");
  const buttonUp = document.querySelector("#btn-up");
  const buttonDown = document.querySelector("#btn-down");
  const buttonLeft = document.querySelector("#btn-left");
  const buttonRight = document.querySelector("#btn-right");
  const buttonMute = document.querySelector("#btn-mute");
  const h1Title = document.querySelector("#title");

  var sndBackground = new Audio("../audio/background.mp3");
  sndBackground.volume = 0.1;
  sndBackground.loop = true;

  var sndScore = new Audio("../audio/score.mp3");
  sndScore.volume = 0.8;
  sndScore.loop = false;

  var sndMove = new Audio("../audio/move.wav");
  sndMove.volume = 0.2;
  sndMove.loop = false;

  var sndGameOver = new Audio("../audio/gameover.wav");
  sndGameOver.volume = 0.5;
  sndGameOver.loop = false;

  const width = 10;

  let timerId;
  let score = 0;
  let maxscore = 0;
  let level = 1;

  let position;
  let form;
  let rotation;
  let current;

  let nextForm;

  // Sprites
  const L = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];
  const Z = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];
  const T = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];
  const O = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];
  const I = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const tetrominoes = [L, Z, T, O, I];
  //   const colors = ["#9b59b6", "#2980b9", "#27ae60", "#f1c40f", "#e74c3c"];
  const colors = [
    "radial-gradient(circle, rgba(155,89,182,1) 0%, rgba(142,68,173,1) 100%)",
    "radial-gradient(circle, rgba(52,152,219,1) 0%, rgba(41,128,185,1) 100%)",
    "radial-gradient(circle, rgba(46,204,113,1) 0%, rgba(39,174,96,1) 100%)",
    "radial-gradient(circle, rgba(241,196,15,1) 0%, rgba(243,156,18,1) 100%)",
    "radial-gradient(circle, rgba(231,76,60,1) 0%, rgba(192,57,43,1) 100%)",
  ];

  // Generate new tetromino
  function genTetromino() {
    position = 4;
    form =
      nextForm != null
        ? nextForm
        : Math.floor(Math.random() * tetrominoes.length);
    nextForm = Math.floor(Math.random() * tetrominoes.length);
    rotation = Math.floor(Math.random() * 4);
    current = tetrominoes[form][rotation];
    draw();
  }

  // Draw the tetromino
  function draw() {
    current.forEach((index) => {
      squares[position + index].classList.add("tetromino");
      squares[position + index].style.background = colors[form];
    });
  }

  // Undraw the tetromino
  function undraw() {
    current.forEach((index) => {
      squares[position + index].classList.remove("tetromino");
      squares[position + index].style.background = "";
    });
  }

  // Key mapping
  function control(e) {
    sndMove.play();
    const keyAction = {
      37: moveLeft,
      38: rotate,
      39: moveRight,
      40: moveDown,
    };
    if (e.keyCode in keyAction && timerId) keyAction[e.keyCode]();
  }
  document.addEventListener("keydown", control);

  // Moves
  function moveLeft() {
    const isLeftEdge = current.some(
      (index) => (position + index) % width === 0
    );
    const colision = current.some((index) =>
      squares[position - 1 + index].classList.contains("taken")
    );
    if (!isLeftEdge && !colision) {
      undraw();
      position -= 1;
      draw();
    }
  }

  function rotate() {
    undraw();
    rotation = rotation + 1 < current.length ? rotation + 1 : 0;
    current = tetrominoes[form][rotation];
    draw();

    const isLeftEdge = current.some(
      (index) => (position + index) % width === 0
    );
    const isRightEdge = current.some(
      (index) => (position + index) % width === width - 1
    );
    const colision = current.some((index) =>
      squares[position + 1 + index].classList.contains("taken")
    );
    if ((isLeftEdge && isRightEdge) || colision) {
      undraw();
      rotation = rotation - 1 > -1 ? rotation - 1 : current.length - 1;
      current = tetrominoes[form][rotation];
      draw();
    }
  }

  function moveRight() {
    const isRightEdge = current.some(
      (index) => (position + index) % width === width - 1
    );
    const colision = current.some((index) =>
      squares[position + 1 + index].classList.contains("taken")
    );
    if (!isRightEdge && !colision) {
      undraw();
      position += 1;
      draw();
    }
  }

  function moveDown() {
    const colision = current.some((index) =>
      squares[position + index + width].classList.contains("taken")
    );
    if (!colision) {
      undraw();
      position += width;
      draw();
    }
    freeze();
  }

  function freeze() {
    const colision = current.some((index) =>
      squares[position + index + width].classList.contains("taken")
    );
    if (colision) {
      current.forEach((index) =>
        squares[position + index].classList.add("taken")
      );
      // Create a new tetromino
      genTetromino();
      previewShape();
      // Verify score and gameover
      addScore();
      gameOver();
    }
  }

  // Preview
  function previewShape() {
    const previewSquares = document.querySelectorAll(".mini-grid div");
    const previewWidth = 4;
    const previewPosition = 0;

    const previewTetrominoes = [
      [1, previewWidth + 1, previewWidth * 2 + 1, 2], // L
      [0, previewWidth, previewWidth + 1, previewWidth * 2 + 1], // Z
      [1, previewWidth, previewWidth + 1, previewWidth + 2], // T
      [0, 1, previewWidth, previewWidth + 1], // O
      [1, previewWidth + 1, previewWidth * 2 + 1, previewWidth * 3 + 1], // I
    ];
    // Clear preview grid
    previewSquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.background = "";
    });
    // Draw nextForm in preview grid
    const previewCurrent = previewTetrominoes[nextForm];
    previewCurrent.forEach((index) => {
      previewSquares[previewPosition + index].classList.add("tetromino");
      previewSquares[previewPosition + index].style.background =
        colors[nextForm];
    });
  }

  // Score
  function addScore() {
    for (let i = 0; i < squares.length - width; i += width) {
      const row = Array.from({ length: width }, (v, k) => i + k);
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        sndScore.play();
        score += 10;
        scoreboard.innerHTML = score;
        if (score > maxscore) {
          maxscore = score;
          maxscoreboard.innerHTML = maxscore;
        }
        if (score % 100 == 0) {
          level += 1;
          levelboard.innerHTML = level;
          pauseGame();
          resumeGame();
        }
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.background = "";
        });
        const removedSquares = squares.splice(i, width);
        squares = removedSquares.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }

  // Game functions
  function pauseGame() {
    if (timerId) {
      sndBackground.pause();
      clearInterval(timerId);
      timerId = null;
    }
  }

  function resumeGame() {
    sndBackground.play();
    timerId = setInterval(moveDown, Math.max(1, 1000 / level));
  }

  function playGame() {
    pauseGame();
    // Clear preview
    squares.forEach((square, index) => {
      square.classList.remove("tetromino");
      squares[index].style.background = "";
      if (index < squares.length - width) {
        square.classList.remove("taken");
      }
    });
    // Clear score
    score = 0;
    level = 1;
    scoreboard.innerHTML = score;
    h1Title.innerHTML = "Tetris";
    // Start new Game
    genTetromino();
    draw();
    previewShape();
    resumeGame();
  }

  // Game Over
  function gameOver() {
    if (
      current.some((index) =>
        squares[position + index].classList.contains("taken")
      )
    ) {
      pauseGame();
      sndBackground.pause();
      sndGameOver.play();
      h1Title.innerHTML = "Game Over!";
      buttonPause.setAttribute("hidden", true);
      buttonReset.innerHTML = "Play again";
      buttonReset.style.width = "160px";
      buttonUp.setAttribute("hidden", true);
      buttonLeft.setAttribute("hidden", true);
      buttonRight.setAttribute("hidden", true);
      buttonDown.setAttribute("hidden", true);
      buttonMute.setAttribute("hidden", true);
    }
  }

  // Buttons
  buttonPause.addEventListener("click", () => {
    if (timerId) {
      pauseGame();
      buttonPause.innerHTML = "Resume";
    } else {
      resumeGame();
      buttonPause.innerHTML = "Pause";
    }
    buttonReset.removeAttribute("hidden");
  });

  buttonReset.addEventListener("click", () => {
    // Pause game
    playGame();
    buttonReset.style.width = "40px";
    buttonReset.innerHTML = "Reset";
    buttonPause.innerHTML = "Pause";
    buttonPause.removeAttribute("hidden");
    buttonUp.removeAttribute("hidden");
    buttonLeft.removeAttribute("hidden");
    buttonRight.removeAttribute("hidden");
    buttonDown.removeAttribute("hidden");
    buttonMute.removeAttribute("hidden");
  });

  buttonUp.addEventListener("click", () => {
    sndMove.play();
    if (timerId) rotate();
  });

  buttonLeft.addEventListener("click", () => {
    sndMove.play();
    if (timerId) moveLeft();
  });

  buttonRight.addEventListener("click", () => {
    sndMove.play();
    if (timerId) moveRight();
  });

  buttonDown.addEventListener("click", () => {
    sndMove.play();
    if (timerId) moveDown();
  });

  buttonMute.addEventListener("click", () => {
    if (sndBackground.volume !== 0) {
      sndBackground.pause();
      sndBackground.volume = 0;
      sndGameOver.volume = 0;
      sndMove.volume = 0;
      sndScore.volume = 0;
      buttonMute.innerHTML = "Unmute";
    } else {
      sndBackground.play();
      sndBackground.volume = 0.1;
      sndGameOver.volume = 0.5;
      sndMove.volume = 0.2;
      sndScore.volume = 0.8;
      buttonMute.innerHTML = "Mute";
    }
  });
});
