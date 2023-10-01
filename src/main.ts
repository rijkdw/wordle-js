// =======================================================================
// Types
// =======================================================================

type Letter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type LetterInGuessStatus = "green" | "yellow" | "grey";
type LetterInGuessData = {
  letter: Letter;
  status: LetterInGuessStatus;
};
type Guess = LetterInGuessData[];

type KeyboardKeyStatus = "green" | "yellow" | "grey" | "unused";
type KeyboardKeyLetter = Letter | "ENTER" | "BACKSPACE";
type KeyboardKeyData = {
  face: KeyboardKeyLetter;
  status: KeyboardKeyStatus;
};
type KeyboardStatusMap = Map<Letter, KeyboardKeyStatus>;

// =======================================================================
// Constants
// =======================================================================

// keep these in sync with CSS
const SHAKE_DURATION = 600;

const INPUTTING_DURATION = 100;

const FLIPPING_DURATION = 200;
const FLIPPING_INTERVAL = 250;

const BOUNCE_DURATION = 800;
const BOUNCE_INTERVAL = 250;

const TOOLTIP_FADE_DURATION = 500;
const TOOLTIP_SHOW_DURATION = 1500;

const UNKNOWN_WORD_MESSAGE = "Not in word list";
const NOT_ENOUGH_LETTERS_MESSAGE = "Not enough letters";
const WIN_MESSAGES = [
  "Genius",
  "Nice", // TODO
  "Nice", // TODO
  "Nice", // TODO
  "Nice", // TODO
  "Phew",
];
const CLOSE_CALL_MESSAGE = "Phew";
const ALREADY_GUESSED_MESSAGE = "Already guessed";

// =======================================================================
// Model
// * stores state
// * provides derivative data (e.g. number of guesses)
// * modifies self
// =======================================================================

class Model {
  correctWord: string;
  currentInput: string;
  legalWords: string[];
  guessHistory: Guess[];
  keyboardStatus: KeyboardStatusMap;
  onModelChanged: (model: Model) => void;
  // TODO (later): separate into:
  // 1. onInputChanged, for when the user types something
  // 2. onInputAccepted, for when the user successfully submits a guess

  constructor(correctWord: string, legalWords?: string[]) {
    this.correctWord = correctWord;
    this.currentInput = "";
    this.legalWords = [];
    if (legalWords === undefined) {
      this.loadLegalWordsForSelf();
    } else {
      this.legalWords = legalWords;
    }
    this.guessHistory = [];
    this.keyboardStatus = createKeyboardStatus();
    this.onModelChanged = () => {};
  }

  bindModelChanged(callback: (model: Model) => void) {
    this.onModelChanged = callback;
  }

  // derived data

  currentInputHasAlreadyBeenGuessed() {
    return this.getPastGuessesAsStrings().includes(this.currentInput);
  }

  currentInputHasNotYetBeenGuessed() {
    return !this.currentInputHasAlreadyBeenGuessed();
  }

  currentInputIsKnown() {
    return this.legalWords.includes(this.currentInput);
  }

  mayCurrentInputBeAccepted() {
    return (
      this.currentInputIsFull() &&
      this.currentInputIsKnown() &&
      this.currentInputHasNotYetBeenGuessed()
    );
  }

  currentInputNotFull() {
    return this.currentInput.length < 5;
  }

  currentInputIsFull() {
    return this.currentInput.length >= 5;
  }

  currentInputNotEmpty() {
    return this.currentInput.length > 0;
  }

  currentInputIsEmpty() {
    return this.currentInput.length === 0;
  }

  hasReachedGuessLimit() {
    return this.guessHistory.length >= 6;
  }

  hasNotReachedGuessLimit() {
    return this.guessHistory.length < 6;
  }

  hasWon() {
    return this.lastGuessMatchesCorrectWord();
  }

  lastGuessMatchesCorrectWord() {
    if (this.getLastGuessAsString() === undefined) {
      return false;
    }
    return this.correctWord === this.getLastGuessAsString();
  }

  hasLost() {
    return this.hasReachedGuessLimit() && !this.lastGuessMatchesCorrectWord();
  }

  isGameOver() {
    return this.hasWon() || this.hasLost();
  }

  getCurrentInputAsGuess(): Guess {
    return performWordleComparison(this.currentInput, this.correctWord);
  }

  getCurrentInputPadded(): string {
    return this.currentInput.padEnd(5, " ");
  }

  getLastGuessAsString(): string | undefined {
    if (this.guessHistory.length === 0) {
      return undefined;
    }
    return this.guessHistory[this.guessHistory.length - 1]
      .map((x) => x.letter)
      .join("");
  }

  getPastGuessesAsStrings(): string[] {
    return this.guessHistory.map((guess) =>
      guess.map((letter) => letter.letter).join("")
    );
  }

  // modify self

  acceptCurrentInput() {
    if (!this.mayCurrentInputBeAccepted()) {
      return; // TODO error?
    }
    const guess = this.getCurrentInputAsGuess();
    this.guessHistory.push(guess);
    this.clearInput();
    this.updateKeyboardStateWithLastGuess();
    this.onModelChanged(this);
  }

  clearInput() {
    this.currentInput = "";
    this.onModelChanged(this);
  }

  updateKeyboardStateWithLastGuess() {
    const guess = this.guessHistory[this.guessHistory.length - 1];
    guess.forEach((letterData) => {
      const pastStatus = this.keyboardStatus.get(letterData.letter);
      const newStatus = letterData.status;
      const better = chooseBetterLetterStatus(
        pastStatus as LetterInGuessStatus,
        newStatus
      );
      this.keyboardStatus.set(letterData.letter, better);
    });
    this.onModelChanged(this);
  }

  deleteLetter() {
    if (!this.currentInputNotEmpty()) {
      return; // TODO error?
    }
    this.currentInput = this.currentInput.slice(
      0,
      this.currentInput.length - 1
    );
    this.onModelChanged(this);
  }

  addLetter(letter: Letter) {
    if (!this.currentInputNotFull()) {
      return; // TODO error?
    }
    if (this.hasReachedGuessLimit()) {
      return; // TODO error?
    }
    this.currentInput += letter;
    this.onModelChanged(this);
  }

  async loadLegalWordsForSelf() {
    this.legalWords = await loadLegalWordsAsync();
  }
}

// -----------------------------------------------------------------------
// Model helpers
// -----------------------------------------------------------------------

function chooseBetterLetterStatus(
  a: LetterInGuessStatus,
  b: LetterInGuessStatus
): LetterInGuessStatus {
  const indexMap = ["green", "yellow", "grey", "unused"];
  const aIndex = indexMap.indexOf(a);
  const bIndex = indexMap.indexOf(b);
  if (aIndex < bIndex) {
    return a;
  }
  return b;
}

async function loadLegalWordsAsync() {
  const response = await fetch("./valid-wordle-words.txt");
  if (!response.ok) {
    throw new Error("Could not read legal words file.");
  }
  return (await response.text()).split("\n").map((x) => x.toUpperCase());
}

function createKeyboardStatus(): KeyboardStatusMap {
  const map: KeyboardStatusMap = new Map();
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    map.set(letter as Letter, "unused");
  }
  return map;
}

function performWordleComparison(
  inputWord: string,
  correctWord: string
): Guess {
  const guess: Guess = [];
  const inputLetters = inputWord.split("") as Letter[];
  const correctLetters = correctWord.split("") as (Letter | null)[];
  inputLetters.forEach((inputLetter, i) => {
    const correctChar = correctWord[i];
    const resultPart = { letter: inputLetter };
    if (inputLetter === correctChar) {
      guess.push({ ...resultPart, status: "green" });
      correctLetters[i] = null;
    } else {
      const solutionIndex = correctLetters.indexOf(inputLetter);
      if (solutionIndex !== -1) {
        guess.push({ ...resultPart, status: "yellow" });
        correctLetters[solutionIndex] = null;
      } else {
        guess.push({ ...resultPart, status: "grey" });
      }
    }
  });
  return guess;
}

// =======================================================================
// View
// =======================================================================

class View {
  tileGridRoot: HTMLElement;
  keyboardRoot: HTMLElement;
  tooltipAnchor: HTMLElement;

  constructor() {
    this.tileGridRoot = document.querySelector("div#tilegrid")!;
    this.keyboardRoot = document.querySelector("div#keyboard")!;
    this.tooltipAnchor = document.querySelector("div#tooltip-anchor")!;
  }

  bindKeyPressOnPhysicalKeyboard(
    callback: (letter: KeyboardKeyLetter) => void
  ) {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      if (event.code.toString() === "Enter") {
        callback("ENTER");
      }
      if (event.code.toString() === "Backspace") {
        callback("BACKSPACE");
      }
      if (event.code.toString().startsWith("Key")) {
        const letter = event.code
          .toString()
          .substring(3)
          .toUpperCase() as Letter;
        callback(letter);
      }
    });
  }

  bindClickVirtualKeyboard(callback: (letter: KeyboardKeyLetter) => void) {
    this.keyboardRoot.addEventListener("click", (event: MouseEvent) => {
      let target: HTMLDivElement;
      if (
        event.target instanceof HTMLDivElement &&
        event.target.matches("div.keyboard-key")
      ) {
        target = event.target;
      } else if (
        event.target instanceof HTMLParagraphElement &&
        event.target.parentElement?.matches("div.keyboard-key")
      ) {
        target = event.target.parentElement as HTMLDivElement;
      } else {
        return;
      }
      const letter = target.id.substring(4);
      callback(letter as KeyboardKeyLetter);
    });
  }

  render(model: Model) {
    this.renderTileGrid(model);
    this.renderKeyboard(model);
  }

  renderTileGrid(model: Model) {
    // clear the grid
    while (this.tileGridRoot.firstChild) {
      this.tileGridRoot.removeChild(this.tileGridRoot.firstChild);
    }
    // repopulate the grid
    // 1. the past guesses
    model.guessHistory.forEach((guess, guessIndex) => {
      guess.forEach((letterData, letterIndex) => {
        const element = letterDataToTileElement(letterData);
        const isLastGuess = model.guessHistory.length - 1 === guessIndex;
        if (isLastGuess) {
          element.classList.add("last-guess");
        }
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      });
    });
    // 1.a stop if six guesses
    if (model.hasReachedGuessLimit()) {
      return;
    }
    // 2. the current input
    model
      .getCurrentInputPadded()
      .split("")
      .forEach((letter, letterIndex) => {
        const guessIndex = model.guessHistory.length;
        const element = letterToTileElement(letter);
        element.classList.add("current-input");
        const isLastInput = model.currentInput.length - 1 === letterIndex;
        if (isLastInput) {
          element.classList.add("last-input");
        }
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      });
    // 3. the remaing empty rows
    const numEmptyRowsToFill = 5 - model.guessHistory.length;
    for (
      let emptyRowIndex = 0;
      emptyRowIndex < numEmptyRowsToFill;
      emptyRowIndex++
    ) {
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        const guessIndex = model.guessHistory.length + emptyRowIndex + 1;
        const element = letterToTileElement(" ");
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      }
    }
  }

  renderKeyboard(model: Model) {
    const createEmptyKeyboardRow = (rowNum: number) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("keyboard-row");
      rowElement.classList.add("row-" + (rowNum + 1));
      rowElement.id = "keyboard-row-" + (rowNum + 1);
      return rowElement;
    };

    const createKeyboardKey = (keyData: KeyboardKeyData) => {
      const keyElement = document.createElement("div");
      keyElement.id = "key-" + keyData.face;
      keyElement.classList.add("keyboard-key");
      keyElement.classList.add(keyData.status);
      if (keyData.face === "ENTER") {
        keyElement.classList.add("wide");
        keyElement.classList.add("enter");
      } else if (keyData.face === "BACKSPACE") {
        keyElement.classList.add("wide");
        keyElement.classList.add("backspace");
      } else {
        keyElement.classList.add("normal");
      }
      const p = document.createElement("p");
      p.innerHTML = keyData.face === "BACKSPACE" ? "<" : keyData.face;
      keyElement.appendChild(p);
      return keyElement;
    };

    while (this.keyboardRoot.firstChild) {
      this.keyboardRoot.removeChild(this.keyboardRoot.firstChild);
    }

    const keyboardLayout = createKeyboardLayout(model.keyboardStatus);

    keyboardLayout.forEach((row, rowNum) => {
      const rowElement = createEmptyKeyboardRow(rowNum);
      row.map(createKeyboardKey).forEach((keyElement) => {
        rowElement.appendChild(keyElement);
      });
      this.keyboardRoot.appendChild(rowElement);
    });
  }

  shake(durationInMs: number) {
    const inputtedTiles = document.querySelectorAll("div.tile.current-input");
    inputtedTiles.forEach((tile) => {
      tile.classList.add("shaking");
      setTimeout(() => {
        tile.classList.remove("shaking");
      }, durationInMs);
    });
  }

  pop(tile: HTMLElement, durationInMs: number) {
    tile.classList.add("inputting");
    setTimeout(() => {
      tile.classList.remove("inputting");
    }, durationInMs);
  }

  popLastTile() {
    const tile = document.querySelector("div.tile.last-input");
    if (tile !== null && tile instanceof HTMLElement) {
      this.pop(tile, INPUTTING_DURATION);
    }
  }

  flipCurrentInputAndApplyColors(guess: Guess) {
    const tiles = document.querySelectorAll("div.tile.current-input");
    guess.forEach((letterData, i) => {
      const tile = tiles[i];
      const effect = () => {
        tile.classList.add("flipping-down");
        setTimeout(() => {
          tile.classList.remove("flipping-down");
          tile.classList.remove("inputting");
          tile.classList.add(letterData.status);
          tile.classList.add("flipping-up");
        }, FLIPPING_DURATION);
        setTimeout(() => {
          tile.classList.remove("flipping-up");
        }, FLIPPING_DURATION * 2);
      };
      setTimeout(effect, FLIPPING_INTERVAL * i);
    });
  }

  bounceLastGuess() {
    const tiles = document.querySelectorAll("div.tile.last-guess");
    tiles.forEach((tile, i) => {
      const effect = () => {
        tile.classList.add("bouncing");
        setTimeout(() => {
          tile.classList.remove("bouncing");
        }, BOUNCE_DURATION);
      };
      setTimeout(effect, BOUNCE_INTERVAL * i);
    });
  }

  showTooltip(message: string) {
    document.querySelectorAll("div.tooltip").forEach((tooltip) => {
      tooltip.remove();
    });
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.classList.add("fade-in");
    const p = document.createElement("p");
    p.textContent = message;
    tooltip.appendChild(p);
    this.tooltipAnchor.appendChild(tooltip);

    setTimeout(() => {
      tooltip.classList.remove("fade-in");
      tooltip.classList.add("fade-out");
    }, TOOLTIP_FADE_DURATION + TOOLTIP_SHOW_DURATION);
    setTimeout(() => {
      try {
        this.tooltipAnchor.removeChild(tooltip);
      } catch (e) {}
    }, TOOLTIP_FADE_DURATION * 2 + TOOLTIP_SHOW_DURATION);
  }
}

// -----------------------------------------------------------------------
// View helpers
// -----------------------------------------------------------------------

const KEYBOARD_LAYOUT_TEMPLATE: KeyboardKeyLetter[][] = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
] as KeyboardKeyLetter[][];

function letterToTileElement(letter: string): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("tile");
  if (letter !== " ") {
    div.classList.add("inputted");
  } else {
    div.classList.add("empty");
  }
  const p = document.createElement("p");
  p.innerHTML = letter;
  div.appendChild(p);
  return div;
}

function letterDataToTileElement(letterData: LetterInGuessData): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("tile");
  div.classList.add(letterData.status);
  const p = document.createElement("p");
  p.innerHTML = letterData.letter;
  div.appendChild(p);
  return div;
}

function createKeyboardLayout(
  keyboardStatus: KeyboardStatusMap
): KeyboardKeyData[][] {
  return KEYBOARD_LAYOUT_TEMPLATE.map((row) =>
    row.map((letter) => {
      return {
        face: letter as KeyboardKeyLetter,
        status: keyboardStatus.get(letter as Letter) ?? "unused",
      };
    })
  );
}

// =======================================================================
// Controller
// =======================================================================

class Controller {
  model: Model;
  view: View;
  isLocked: boolean = false;

  constructor(model: Model, view: View) {
    this.model = model;
    this.model.bindModelChanged(this.onModelChanged);

    this.view = view;
    this.view.bindClickVirtualKeyboard(this.handleKeypress);
    this.view.bindKeyPressOnPhysicalKeyboard(this.handleKeypress);

    this.onModelChanged(this.model);
  }

  onModelChanged = (model: Model) => {
    this.view.render(model);
  };

  handleKeypress = (letter: KeyboardKeyLetter) => {
    if (this.isLocked) {
      return;
    }
    if (this.model.isGameOver()) {
      return;
    }
    if (letter === "ENTER") {
      this.handleSubmit();
    } else if (letter === "BACKSPACE") {
      this.handleDeleteLetter();
    } else {
      this.handleAddLetter(letter);
    }
  };

  handleAddLetter = (letter: Letter) => {
    if (this.model.currentInputIsFull()) {
      return;
    }
    if (this.model.hasReachedGuessLimit()) {
      return;
    }
    if (this.model.hasWon()) {
      return;
    }
    this.model.addLetter(letter);
    this.view.popLastTile();
  };

  handleDeleteLetter = () => {
    if (this.model.currentInputIsEmpty()) {
      return;
    }
    this.model.deleteLetter();
  };

  handleSubmit = () => {
    if (!this.model.mayCurrentInputBeAccepted() && !this.model.hasWon()) {
      this.view.shake(SHAKE_DURATION);
      this.lock(SHAKE_DURATION);
      if (!this.model.currentInputIsKnown()) {
        this.view.showTooltip(UNKNOWN_WORD_MESSAGE);
      }
      if (this.model.currentInputNotFull()) {
        this.view.showTooltip(NOT_ENOUGH_LETTERS_MESSAGE);
      }
      if (this.model.currentInputHasAlreadyBeenGuessed()) {
        this.view.showTooltip(ALREADY_GUESSED_MESSAGE);
      }
      return;
    }
    this.view.flipCurrentInputAndApplyColors(
      this.model.getCurrentInputAsGuess()
    );
    setTimeout(() => {
      this.model.acceptCurrentInput();
      if (this.model.hasWon()) {
        this.view.bounceLastGuess();
        this.view.showTooltip(WIN_MESSAGES[this.model.guessHistory.length - 1]);
      }
      if (this.model.hasLost()) {
        this.view.showTooltip(this.model.correctWord);
      }
    }, FLIPPING_INTERVAL * 4 + FLIPPING_DURATION * 2);
  };

  lock(durationInMs: number) {
    this.isLocked = true;
    setTimeout(() => {
      this.isLocked = false;
    }, durationInMs);
  }
}

// =======================================================================
// Startup
// =======================================================================

const searchParams = new URLSearchParams(window.location.search);
let word = searchParams.get("word");
if (word === null) {
  word = "HELLO";
}
const model = new Model(word);
const view = new View();
const controller = new Controller(model, view);
