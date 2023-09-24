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

// =======================================================================
// Model
// =======================================================================

class Model {
  correctWord: string;
  currentInput: string;
  legalWords: string[];
  guessHistory: Guess[];
  keyboardStatus: Map<Letter, KeyboardKeyStatus>;

  constructor(correctWord: string, legalWords: string[] | "load") {
    this.correctWord = correctWord;
    this.currentInput = "";
    this.legalWords = [];
    if (legalWords === "load") {
      this.loadLegalWordsForSelf();
    } else {
      this.legalWords = legalWords;
    }
    this.guessHistory = [];
    this.keyboardStatus = new Map<Letter, KeyboardKeyStatus>();
    this.setupKeyboardStatus();
  }

  async loadLegalWordsForSelf() {
    this.legalWords = await Model.loadLegalWords();
  }

  setupKeyboardStatus() {
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      this.keyboardStatus.set(letter as Letter, "unused");
    }
  }

  // checks

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
    if (!this.isGameOver()) {
      return false;
    }
    return this.correctWord !== this.getLastGuessAsString();
  }

  isGameOver() {
    return this.hasReachedGuessLimit();
  }

  // conversions

  getCurrentInputAsGuess(): Guess {
    return wordleComparisonAlgorithm(this.currentInput, this.correctWord);
  }

  getCurrentInputPadded(): string {
    return this.currentInput.padEnd(5, " ");
  }

  getLastGuessAsString(): string {
    return this.guessHistory[this.guessHistory.length - 1]
      .map((x) => x.letter)
      .join("");
  }

  // Domain-specific functions

  static async loadLegalWords() {
    const response = await fetch("./valid-wordle-words.txt");
    if (!response.ok) {
      throw new Error("Could not read legal words file");
    }
    return (await response.text()).split("\n").map((x) => x.toUpperCase());
  }
}

// -----------------------------------------------------------------------
// Model helpers
// -----------------------------------------------------------------------

function betterLetterStatus(
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

function wordleComparisonAlgorithm(
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

interface IView {
  update: (model: Model) => void;
  setupListeners: (controller: Controller) => void;
}

class ConsoleView implements IView {
  setupListeners(controller: Controller) {
    setupPhysicalKeyboardListener(controller);
  }

  update(model: Model) {
    console.clear();
    // past words
    model.guessHistory.forEach((x) => {
      const repr = ConsoleView.guessToStringRepr(x);
      console.log(repr);
    });
    // current input
    if (model.hasReachedGuessLimit()) {
      return;
    }
    console.log(
      ConsoleView.currentInputToStringRepr(model.getCurrentInputPadded())
    );
  }

  static guessToStringRepr(guess: Guess): string {
    return guess
      .map((letterData) => {
        switch (letterData.status) {
          case "green":
            return " " + letterData.letter + " ";
          case "grey":
            return "-" + letterData.letter.toLowerCase() + "-";
          case "yellow":
            return "[" + letterData.letter.toLowerCase() + "]";
        }
      })
      .join(" ");
  }

  static currentInputToStringRepr(currentInput: string): string {
    return currentInput
      .split("")
      .map((letter) => (letter === " " ? "   " : " " + letter + " "))
      .map((letter) => letter.toLowerCase())
      .join(" ");
  }
}

class HTMLView implements IView {
  update(model: Model) {
    this.updateTileGrid(model);
    this.updateKeyboard(model);
  }

  updateTileGrid(model: Model) {
    const TILE_GRID_ELEMENT = document.getElementById(
      "tilegrid"
    ) as HTMLElement;
    // clear the grid
    TILE_GRID_ELEMENT.innerHTML = "";
    // repopulate the grid
    model.guessHistory.forEach((guess) => {
      guess.forEach((letterData) => {
        const element = HTMLView.letterInGuessDataToTileElement(letterData);
        TILE_GRID_ELEMENT!.appendChild(element);
      });
    });
    if (model.hasReachedGuessLimit()) {
      return;
    }
    model
      .getCurrentInputPadded()
      .split("")
      .forEach((letter) => {
        const element = HTMLView.letterToTileElement(letter);
        TILE_GRID_ELEMENT!.appendChild(element);
      });
    const emptyTilesToFill = 5 - model.guessHistory.length;
    for (let i = 0; i < emptyTilesToFill; i++) {
      "     ".split("").forEach((letter) => {
        const element = HTMLView.letterToTileElement(letter);
        TILE_GRID_ELEMENT!.appendChild(element);
      });
    }
  }

  static createKeyboardLayout(model: Model): KeyboardKeyData[][] {
    return KEYBOARD_LAYOUT_TEMPLATE.map((row) =>
      row.map((letter) => {
        return {
          face: letter as KeyboardKeyLetter,
          status: model.keyboardStatus.get(letter as Letter) ?? "green",
        };
      })
    );
  }

  updateKeyboard(model: Model) {
    const KEYBOARD_ELEMENT = document.getElementById("keyboard") as HTMLElement;
    KEYBOARD_ELEMENT.innerHTML = "";
    const keyboardLayout = HTMLView.createKeyboardLayout(model);
    keyboardLayout.forEach((row, i) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("keyboard-row");
      rowElement.classList.add("row-" + (i + 1));
      rowElement.id = "keyboard-row-" + (i + 1);
      for (const keyData of row) {
        const keyElement = document.createElement("div");
        keyElement.id = "key-" + keyData.face;
        const p = document.createElement("p");
        p.innerHTML = keyData.face === "BACKSPACE" ? "<" : keyData.face;
        keyElement.classList.add("keyboard-key");
        keyElement.classList.add(keyData.status);
        keyElement.appendChild(p);
        if (keyData.face === "ENTER") {
          keyElement.classList.add("wide");
          keyElement.classList.add("enter");
        } else if (keyData.face === "BACKSPACE") {
          keyElement.classList.add("wide");
          keyElement.classList.add("backspace");
        }
        rowElement.appendChild(keyElement);
      }
      KEYBOARD_ELEMENT.appendChild(rowElement);
    });
  }

  static letterToTileElement(letter: string): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("tile");
    if (letter !== " ") {
      div.classList.add("inputted");
    }
    const p = document.createElement("p");
    p.innerHTML = letter;
    div.appendChild(p);
    return div;
  }

  static letterInGuessDataToTileElement(
    letterData: LetterInGuessData
  ): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("tile");
    div.classList.add(letterData.status);
    const p = document.createElement("p");
    p.innerHTML = letterData.letter;
    div.appendChild(p);
    return div;
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

function setupPhysicalKeyboardListener(
  controller: Controller
): (event: KeyboardEvent) => void {
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
  return callback;
}

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
  view: IView;

  constructor(model: Model, view: IView) {
    this.model = model;
    this.view = view;
    setupPhysicalKeyboardListener(this);
  }

  initialize() {
    this.view.update(this.model);
    this.view.setupListeners(this);
  }

  postModelUpdateRoutine() {
    this.view.update(this.model);
    this.view.setupListeners(this);
  }

  updateKeyboardStatus(guess: Guess) {
    guess.forEach((letterData) => {
      const pastStatus = this.model.keyboardStatus.get(letterData.letter);
      const newStatus = letterData.status;
      const better = betterLetterStatus(
        pastStatus as LetterInGuessStatus,
        newStatus
      );
      this.model.keyboardStatus.set(letterData.letter, better);
    });
  }

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
  const model = new Model("WHISK", "load");
  const view = new HTMLView();
  const controller = new Controller(model, view);
  controller.initialize();
}

main();
