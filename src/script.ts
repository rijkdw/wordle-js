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
// Model
// * stores state
// * provides data derived from state
// * does not modify self
// =======================================================================

class Model {
  correctWord: string;
  currentInput: string;
  legalWords: string[];
  guessHistory: Guess[];
  keyboardStatus: KeyboardStatusMap;
  onModelChanged: (model: Model) => void;
  // TODO separate into:
  // 1. onInputChanged, for when the user types something
  // 2. onInputAccepted, for when the user successfully submits a guess
  //   2.a) tiles
  //   2.b) keyboard

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

  mayCurrentInputBeAccepted(): boolean {
    return (
      this.currentInput.length === 5 &&
      this.legalWords.includes(this.currentInput)
    );
  }

  mayAddLetter(): boolean {
    return this.currentInput.length < 5;
  }

  mayDeleteLetter(): boolean {
    return this.currentInput.length > 0;
  }

  hasReachedGuessLimit(): boolean {
    return this.guessHistory.length >= 6;
  }

  hasWon(): boolean {
    return this.correctWord === this.getLastGuessAsString();
  }

  hasLost(): boolean {
    return (
      this.hasReachedGuessLimit() &&
      this.correctWord !== this.getLastGuessAsString()
    );
  }

  isGameOver() {
    return this.hasReachedGuessLimit();
  }

  getCurrentInputAsGuess(): Guess {
    return performWordleComparison(this.currentInput, this.correctWord);
  }

  getCurrentInputPadded(): string {
    return this.currentInput.padEnd(5, " ");
  }

  getLastGuessAsString(): string {
    return this.guessHistory[this.guessHistory.length - 1]
      .map((x) => x.letter)
      .join("");
  }

  // changes to model

  acceptCurrentInput() {
    if (!this.mayCurrentInputBeAccepted()) {
      return;
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
    if (!this.mayDeleteLetter()) {
      return;
    }
    this.currentInput = this.currentInput.slice(
      0,
      this.currentInput.length - 1
    );
    this.onModelChanged(this);
  }

  addLetter(letter: Letter) {
    if (!this.mayAddLetter()) {
      return;
    }
    if (this.hasReachedGuessLimit()) {
      return;
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
    throw new Error("Could not read legal words file");
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
  const result: Guess = [];
  const inputLetters = inputWord.split("") as Letter[];
  const correctLetters = correctWord.split("") as (Letter | null)[];
  for (let i = 0; i < inputLetters.length; i++) {
    const inputLetter = inputLetters[i] as Letter;
    const correctChar = correctWord[i];
    if (inputLetter === correctChar) {
      result.push({ letter: inputLetter, status: "green" });
      correctLetters[i] = null;
    } else {
      const solutionIndex = correctLetters.indexOf(inputLetter);
      if (solutionIndex !== -1) {
        result.push({ letter: inputLetter, status: "yellow" });
        correctLetters[solutionIndex] = null;
      } else {
        result.push({ letter: inputLetter, status: "grey" });
      }
    }
  }
  return result;
}

// =======================================================================
// View
// =======================================================================

class View {
  tileGridRoot: HTMLElement;
  keyboardRoot: HTMLElement;

  constructor() {
    this.tileGridRoot = document.querySelector("div#tilegrid")!;
    this.keyboardRoot = document.querySelector("div#keyboard")!;
  }

  bindKeyPressOnVirtualKeyboard(callback: (letter: KeyboardKeyLetter) => void) {
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

  update(model: Model) {
    this.updateTileGrid(model);
    this.updateKeyboard(model);
  }

  updateTileGrid(model: Model) {
    // clear the grid
    while (this.tileGridRoot.firstChild) {
      this.tileGridRoot.removeChild(this.tileGridRoot.firstChild);
    }
    // repopulate the grid
    model.guessHistory.forEach((guess, guessIndex) => {
      guess.forEach((letterData, letterIndex) => {
        const element = letterDataToTileElement(letterData);
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      });
    });
    if (model.hasReachedGuessLimit()) {
      return;
    }
    model
      .getCurrentInputPadded()
      .split("")
      .forEach((letter, letterIndex) => {
        const guessIndex = model.guessHistory.length;
        const element = letterToTileElement(letter);
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      });
    const emptyTilesToFill = 5 - model.guessHistory.length;
    for (let i = 0; i < emptyTilesToFill; i++) {
      "     ".split("").forEach((letter, letterIndex) => {
        const guessIndex = model.guessHistory.length + 1;
        const element = letterToTileElement(letter);
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      });
    }
  }

  updateKeyboard(model: Model) {
    while (this.keyboardRoot.firstChild) {
      this.keyboardRoot.removeChild(this.keyboardRoot.firstChild);
    }
    const keyboardLayout = createKeyboardLayout(model);
    keyboardLayout.forEach((row, i) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("keyboard-row");
      rowElement.classList.add("row-" + (i + 1));
      rowElement.id = "keyboard-row-" + (i + 1);
      for (const keyData of row) {
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
        }
        const p = document.createElement("p");
        p.innerHTML = keyData.face === "BACKSPACE" ? "<" : keyData.face;
        keyElement.appendChild(p);
        rowElement.appendChild(keyElement);
      }
      this.keyboardRoot.appendChild(rowElement);
    });
  }

  setupListeners(controller: Controller) {
    setupVirtualKeyboadListeners(controller);
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

// TODO rely on keyboard status and not whole model
function createKeyboardLayout(model: Model): KeyboardKeyData[][] {
  return KEYBOARD_LAYOUT_TEMPLATE.map((row) =>
    row.map((letter) => {
      return {
        face: letter as KeyboardKeyLetter,
        status: model.keyboardStatus.get(letter as Letter) ?? "green",
      };
    })
  );
}

// TODO remove
function setupPhysicalKeyboardListener(controller: Controller) {
  const callback = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    if (event.code.toString() === "Enter") {
      controller.handleSubmitEvent();
    }
    if (event.code.toString() === "Backspace") {
      controller.handleBackspaceEvent();
    }
    if (event.code.toString().startsWith("Key")) {
      const letter = event.code.toString().substring(3).toUpperCase();
      controller.handleLetterInputEvent(letter as Letter);
    }
  };
  document.addEventListener("keydown", callback);
}

// TODO remove
function setupVirtualKeyboadListeners(controller: Controller) {
  KEYBOARD_LAYOUT_TEMPLATE.forEach((row) => {
    row.forEach((key) => {
      const id = "key-" + key;
      const keyElement = document.getElementById(id);
      if (keyElement === null) {
        return;
      }
      if (key === "ENTER") {
        keyElement.addEventListener("click", () =>
          controller.handleSubmitEvent()
        );
      } else if (key === "BACKSPACE") {
        keyElement.addEventListener("click", () =>
          controller.handleBackspaceEvent()
        );
      } else {
        keyElement.addEventListener("click", () =>
          controller.handleLetterInputEvent(key.repeat(1) as Letter)
        );
      }
    });
  });
}

// =======================================================================
// Controller
// =======================================================================

class Controller {
  model: Model;
  view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    setupPhysicalKeyboardListener(this); // TODO remove
    this.view.update(this.model);
    this.view.setupListeners(this);

    // TODO bindings on
    // model
    // view
  }

  // TODO remove
  postModelUpdateRoutine() {
    this.view.update(this.model);
    this.view.setupListeners(this);
  }

  // TODO remove
  updateKeyboardStatus(guess: Guess) {
    guess.forEach((letterData) => {
      const pastStatus = this.model.keyboardStatus.get(letterData.letter);
      const newStatus = letterData.status;
      const better = chooseBetterLetterStatus(
        pastStatus as LetterInGuessStatus,
        newStatus
      );
      this.model.keyboardStatus.set(letterData.letter, better);
    });
  }

  // TODO remove
  handleLetterInputEvent(letter: Letter) {
    if (!this.model.mayAddLetter()) {
      return;
    }
    if (this.model.hasReachedGuessLimit()) {
      return;
    }
    this.model.currentInput += letter;
    this.postModelUpdateRoutine();
  }

  // TODO remove
  handleSubmitEvent() {
    if (!this.model.mayCurrentInputBeAccepted()) {
      return;
    }
    const guess: Guess = this.model.getCurrentInputAsGuess();
    this.model.guessHistory.push(guess);
    this.model.currentInput = "";
    this.updateKeyboardStatus(guess);
    this.postModelUpdateRoutine();
  }

  // TODO remove
  handleBackspaceEvent() {
    if (!this.model.mayDeleteLetter()) {
      return;
    }
    const c = this.model.currentInput;
    this.model.currentInput = c.slice(0, c.length - 1);
    this.postModelUpdateRoutine();
  }
}

// =======================================================================
// Startup
// =======================================================================

function main() {
  const model = new Model("WHISK");
  const view = new View();
  new Controller(model, view);
}

main();
