// ===============================================
// Game state
// ===============================================

let LEGAL_WORDS = [];
fetch("./valid-wordle-words.txt")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not read file");
      // Should probably show some UI to indicate this.
    }
    return response.text();
  })
  .then((text) => {
    LEGAL_WORDS = text.split("\n").map((x) => x.toUpperCase());
  });
const CORRECT_WORD = "WHISK";
let currentInput = "";
let isLocked = false;

// a 2D list of GuessCharObj objects.
// type GuessCharObj = {character: string, color: Color};
let guessCharHistory = [];
let guessStringHistory = [];

function createInputKeyPressCallback(char) {
  return () => {
    handleInput(char);
  };
}

function handleInput(char) {
  if (isLocked) {
    return;
  }
  addLetterToInput(char);
  triggerInputtingAnimation();
  updateUI();
}

function createBackspaceKeyPressCallback() {
  return handleBackspaceEvent;
}

function handleBackspaceEvent() {
  if (isLocked) {
    return;
  }
  isInputting = false;
  currentInput = currentInput.substring(0, currentInput.length - 1);
  updateUI();
}

function createEnterKeyPressCallback() {
  return handleEnterEvent;
}

function handleEnterEvent() {
  if (isLocked) {
    return;
  }
  isInputting = false;
  attemptSubmit();
  updateUI();
}

function showTooltip(string) {
  console.log(string);
}

function attemptSubmit() {
  // has the word been guessed before
  if (guessStringHistory.includes(currentInput)) {
    showTooltip("Guessed before");
    triggerShakeAnimation();
    return;
  }
  // are there 5 letters
  if (currentInput.length !== 5) {
    showTooltip("Not enough letters");
    triggerShakeAnimation();
    return;
  }
  // is the word legal?
  if (!LEGAL_WORDS.includes(currentInput)) {
    showTooltip("Not a word");
    triggerShakeAnimation();
    return;
  }
  const row = convertInputToGuess();
  guessCharHistory.push(row);
  guessStringHistory.push(currentInput);
  for (const obj of row) {
    updateKeyboardKeyState(obj);
  }
  currentInput = "";
}

function updateKeyboardKeyState(obj) {
  function getBestColor(c1, c2) {
    const colorOrder = ["grey", "yellow", "green"];
    const i1 = colorOrder.indexOf(c1);
    const i2 = colorOrder.indexOf(c2);
    if (i1 > i2) return c1;
    return c2;
  }
  let bestColor = getBestColor(obj.color, keyboardState[obj.character].color);
  if (bestColor === "grey") bestColor = "dgrey";
  keyboardState[obj.character].color = bestColor;
}

function addLetterToInput(char) {
  if (currentInput.length >= 5) return;
  if (guessCharHistory.length >= 6) return;
  currentInput += char;
}

function convertInputToGuess() {
  const result = [];
  const solutionCopy = CORRECT_WORD.split("");

  for (let i = 0; i < currentInput.length; i++) {
    const inputChar = currentInput[i];
    const correctChar = CORRECT_WORD[i];

    if (inputChar === correctChar) {
      result.push({ character: inputChar, color: "green" });
      solutionCopy[i] = null;
    } else {
      const solutionIndex = solutionCopy.indexOf(inputChar);
      if (solutionIndex !== -1) {
        result.push({ character: inputChar, color: "yellow" });
        solutionCopy[solutionIndex] = null;
      } else {
        result.push({ character: inputChar, color: "grey" });
      }
    }
  }

  return result;
}

// ===============================================
// UI logic
// ===============================================

let keyboardState = {};
let isShaking = false;
let isInputting = false;
let isFlipping = [false, false, false, false, false];
const SHAKE_ANIMATION_DURATION = 500;
const INPUT_ANIMATION_DURATION = 100;

"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((key) => {
  keyboardState[key] = { character: key, color: "lgrey" };
});

// Tile grid

function createBlankTile() {
  const tileElement = document.createElement("div");
  tileElement.classList.add("tile");
  return tileElement;
}

function convertGuessCharObjToTile(guessCharObj) {
  const tileElement = createBlankTile();
  tileElement.classList.add(guessCharObj.color);
  const text = document.createElement("p");
  text.innerHTML = guessCharObj.character;
  tileElement.appendChild(text);
  return tileElement;
}

function createEmptyTile() {
  const tileElement = createBlankTile();
  tileElement.classList.add("empty");
  return tileElement;
}

function convertInputToTile(characterStr) {
  const tileElement = createBlankTile();
  tileElement.classList.add("inputted");
  if (isShaking) {
    tileElement.classList.add("shaking");
  }
  const text = document.createElement("p");
  text.innerHTML = characterStr;
  tileElement.appendChild(text);
  return tileElement;
}

function renderTileGrid() {
  const tileElements = [];
  // 1. The guessed tiles
  for (const row of guessCharHistory) {
    for (const guessCharObj of row) {
      tileElements.push(convertGuessCharObjToTile(guessCharObj));
    }
  }
  // 2. The current input
  currentInput.split("").forEach((char, index) => {
    const tile = convertInputToTile(char);
    // the last tile
    if (index === currentInput.length - 1 && isInputting) {
      tile.classList.add("inputting");
    }
    // flipping
    if (isFlipping[index]) {
      tile.classList.add("flipping");
    }
    tileElements.push(tile);
  });
  // 2.a) plus what's necessary to fill that row
  for (let i = currentInput.length; i < 5; i++) {
    const tile = createEmptyTile();
    if (isShaking) {
      tile.classList.add("shaking");
    }
    tileElements.push(tile);
  }
  // 3. Those required to fill the grid
  while (tileElements.length < 5 * 6) {
    tileElements.push(createEmptyTile());
  }
  // if there's too many, trim them
  tileElements.splice(5 * 6);
  // Replace the tile grid with these tiles
  const TILEGRID = document.getElementById("tilegrid");
  TILEGRID.innerHTML = "";
  for (const tileElement of tileElements) {
    TILEGRID.appendChild(tileElement);
  }
}

function triggerShakeAnimation() {
  isShaking = true;
  updateUI();
  setTimeout(() => {
    isShaking = false;
    updateUI();
  }, SHAKE_ANIMATION_DURATION);
}

function triggerInputtingAnimation() {
  isInputting = false;
  updateUI();
  isInputting = true;
  updateUI();
  setTimeout(() => {
    isInputting = false;
    updateUI();
  }, INPUT_ANIMATION_DURATION);
}

function triggerFlippingAnimation() {
  const interval = 200;
  const duration = 201;
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      isFlipping[i] = true;
    }, interval * i);
    setTimeout(() => {
      isFlipping[i] = false;
    }, interval * i + duration);
  }
}

// The keyboard

function createNormalKeyboardKeyElement(keyboardKeyObj) {
  const keyElement = document.createElement("div");
  keyElement.classList.add("keyboard-key");
  keyElement.classList.add(keyboardKeyObj.color);
  const textElement = document.createElement("p");
  textElement.innerHTML = keyboardKeyObj.character;
  keyElement.appendChild(textElement);
  keyElement.addEventListener(
    "click",
    createInputKeyPressCallback(keyboardKeyObj.character)
  );
  return keyElement;
}

function createWideKeyboardKeyElement(name) {
  const keyElement = document.createElement("div");
  keyElement.classList.add("keyboard-key");
  keyElement.classList.add("wide");
  keyElement.classList.add(name.toLowerCase());
  const textElement = document.createElement("p");
  textElement.innerHTML = name === "ENTER" ? "ENTER" : "<";
  keyElement.appendChild(textElement);
  const callback =
    name === "ENTER"
      ? createEnterKeyPressCallback()
      : createBackspaceKeyPressCallback();
  keyElement.addEventListener("click", callback);
  return keyElement;
}

function renderKeyboard() {
  const KEYBOARD_ORDER = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
  ];
  const KEYBOARD_ELEMENT = document.getElementById("keyboard");
  KEYBOARD_ELEMENT.innerHTML = "";
  let i = 1;
  for (const charRow of KEYBOARD_ORDER) {
    const keyRowElement = document.createElement("div");
    keyRowElement.classList.add("keyboard-row");
    keyRowElement.classList.add("row-" + i);
    for (const char of charRow) {
      const keyboardKeyObj = keyboardState[char];
      let keyboardKeyElement;
      if (keyboardKeyObj === undefined) {
        keyboardKeyElement = createWideKeyboardKeyElement(char);
      } else {
        keyboardKeyElement = createNormalKeyboardKeyElement(keyboardKeyObj);
      }
      keyRowElement.appendChild(keyboardKeyElement);
    }
    KEYBOARD_ELEMENT.appendChild(keyRowElement);
  }
}

function updateUI() {
  renderTileGrid();
  renderKeyboard();
}

// ===============================================
// Game start
// ===============================================

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.code.toString() === "Enter") handleEnterEvent();
  if (e.code.toString() === "Backspace") handleBackspaceEvent();
  if (e.code.toString().startsWith("Key")) {
    const letter = e.code.toString().substring(3);
    handleInput(letter);
  }
});

updateUI();
