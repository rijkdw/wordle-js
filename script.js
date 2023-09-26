"use strict";
// =======================================================================
// Types
// =======================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// =======================================================================
// Model
// * stores state
// * provides data derived from state
// * does not modify self
// =======================================================================
class Model {
    // TODO separate into:
    // 1. onInputChanged, for when the user types something
    // 2. onInputAccepted, for when the user successfully submits a guess
    //   2.a) tiles
    //   2.b) keyboard
    constructor(correctWord, legalWords) {
        this.correctWord = correctWord;
        this.currentInput = "";
        this.legalWords = [];
        if (legalWords === undefined) {
            this.loadLegalWordsForSelf();
        }
        else {
            this.legalWords = legalWords;
        }
        this.guessHistory = [];
        this.keyboardStatus = createKeyboardStatus();
        this.onModelChanged = () => { };
    }
    bindModelChanged(callback) {
        this.onModelChanged = callback;
    }
    // derived data
    mayCurrentInputBeAccepted() {
        return (this.currentInput.length === 5 &&
            this.legalWords.includes(this.currentInput));
    }
    mayAddLetter() {
        return this.currentInput.length < 5;
    }
    mayDeleteLetter() {
        return this.currentInput.length > 0;
    }
    hasReachedGuessLimit() {
        return this.guessHistory.length >= 6;
    }
    hasWon() {
        return this.correctWord === this.getLastGuessAsString();
    }
    hasLost() {
        return (this.hasReachedGuessLimit() &&
            this.correctWord !== this.getLastGuessAsString());
    }
    isGameOver() {
        return this.hasReachedGuessLimit();
    }
    getCurrentInputAsGuess() {
        return wordleComparisonAlgorithm(this.currentInput, this.correctWord);
    }
    getCurrentInputPadded() {
        return this.currentInput.padEnd(5, " ");
    }
    getLastGuessAsString() {
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
            const better = betterLetterStatus(pastStatus, newStatus);
            this.keyboardStatus.set(letterData.letter, better);
        });
        this.onModelChanged(this);
    }
    deleteLetter() {
        if (!this.mayDeleteLetter()) {
            return;
        }
        this.currentInput = this.currentInput.slice(0, this.currentInput.length - 1);
        this.onModelChanged(this);
    }
    addLetter(letter) {
        if (!this.mayAddLetter()) {
            return;
        }
        if (this.hasReachedGuessLimit()) {
            return;
        }
        this.currentInput += letter;
        this.onModelChanged(this);
    }
    loadLegalWordsForSelf() {
        return __awaiter(this, void 0, void 0, function* () {
            this.legalWords = yield loadLegalWords();
        });
    }
}
// -----------------------------------------------------------------------
// Model helpers
// -----------------------------------------------------------------------
function betterLetterStatus(a, b) {
    const indexMap = ["green", "yellow", "grey", "unused"];
    const aIndex = indexMap.indexOf(a);
    const bIndex = indexMap.indexOf(b);
    if (aIndex < bIndex) {
        return a;
    }
    return b;
}
function loadLegalWords() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("./valid-wordle-words.txt");
        if (!response.ok) {
            throw new Error("Could not read legal words file");
        }
        return (yield response.text()).split("\n").map((x) => x.toUpperCase());
    });
}
function createKeyboardStatus() {
    const map = new Map();
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        map.set(letter, "unused");
    }
    return map;
}
function wordleComparisonAlgorithm(inputWord, correctWord) {
    const result = [];
    const inputLetters = inputWord.split("");
    const correctLetters = correctWord.split("");
    for (let i = 0; i < inputLetters.length; i++) {
        const inputLetter = inputLetters[i];
        const correctChar = correctWord[i];
        if (inputLetter === correctChar) {
            result.push({ letter: inputLetter, status: "green" });
            correctLetters[i] = null;
        }
        else {
            const solutionIndex = correctLetters.indexOf(inputLetter);
            if (solutionIndex !== -1) {
                result.push({ letter: inputLetter, status: "yellow" });
                correctLetters[solutionIndex] = null;
            }
            else {
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
    constructor() {
        this.tileGridRoot = document.querySelector("div#tilegrid");
        this.keyboardRoot = document.querySelector("div#keyboard");
    }
    bindKeyPressOnVirtualKeyboard(callback) {
        document.addEventListener("keydown", (event) => {
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
                    .toUpperCase();
                callback(letter);
            }
        });
    }
    bindClickVirtualKeyboard(callback) {
        this.keyboardRoot.addEventListener("click", (event) => {
            var _a;
            let target;
            if (event.target instanceof HTMLDivElement &&
                event.target.matches("div.keyboard-key")) {
                target = event.target;
            }
            else if (event.target instanceof HTMLParagraphElement &&
                ((_a = event.target.parentElement) === null || _a === void 0 ? void 0 : _a.matches("div.keyboard-key"))) {
                target = event.target.parentElement;
            }
            else {
                return;
            }
            const letter = target.id.substring(4);
            callback(letter);
        });
    }
    update(model) {
        this.updateTileGrid(model);
        this.updateKeyboard(model);
    }
    updateTileGrid(model) {
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
    updateKeyboard(model) {
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
                }
                else if (keyData.face === "BACKSPACE") {
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
    setupListeners(controller) {
        setupVirtualKeyboadListeners(controller);
    }
}
// -----------------------------------------------------------------------
// View helpers
// -----------------------------------------------------------------------
const KEYBOARD_LAYOUT_TEMPLATE = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
];
function letterToTileElement(letter) {
    const div = document.createElement("div");
    div.classList.add("tile");
    if (letter !== " ") {
        div.classList.add("inputted");
    }
    else {
        div.classList.add("empty");
    }
    const p = document.createElement("p");
    p.innerHTML = letter;
    div.appendChild(p);
    return div;
}
function letterDataToTileElement(letterData) {
    const div = document.createElement("div");
    div.classList.add("tile");
    div.classList.add(letterData.status);
    const p = document.createElement("p");
    p.innerHTML = letterData.letter;
    div.appendChild(p);
    return div;
}
// TODO rely on keyboard status and not whole model
function createKeyboardLayout(model) {
    return KEYBOARD_LAYOUT_TEMPLATE.map((row) => row.map((letter) => {
        var _a;
        return {
            face: letter,
            status: (_a = model.keyboardStatus.get(letter)) !== null && _a !== void 0 ? _a : "green",
        };
    }));
}
// TODO remove
function setupPhysicalKeyboardListener(controller) {
    const callback = (event) => {
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
            controller.handleLetterInputEvent(letter);
        }
    };
    document.addEventListener("keydown", callback);
}
// TODO remove
function setupVirtualKeyboadListeners(controller) {
    KEYBOARD_LAYOUT_TEMPLATE.forEach((row) => {
        row.forEach((key) => {
            const id = "key-" + key;
            const keyElement = document.getElementById(id);
            if (keyElement === null) {
                return;
            }
            if (key === "ENTER") {
                keyElement.addEventListener("click", () => controller.handleSubmitEvent());
            }
            else if (key === "BACKSPACE") {
                keyElement.addEventListener("click", () => controller.handleBackspaceEvent());
            }
            else {
                keyElement.addEventListener("click", () => controller.handleLetterInputEvent(key.repeat(1)));
            }
        });
    });
}
// =======================================================================
// Controller
// =======================================================================
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        setupPhysicalKeyboardListener(this); // TODO remove
        this.view.update(this.model);
        this.view.setupListeners(this);
    }
    postModelUpdateRoutine() {
        this.view.update(this.model);
        this.view.setupListeners(this);
    }
    // TODO remove
    updateKeyboardStatus(guess) {
        guess.forEach((letterData) => {
            const pastStatus = this.model.keyboardStatus.get(letterData.letter);
            const newStatus = letterData.status;
            const better = betterLetterStatus(pastStatus, newStatus);
            this.model.keyboardStatus.set(letterData.letter, better);
        });
    }
    // TODO remove
    handleLetterInputEvent(letter) {
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
        const guess = this.model.getCurrentInputAsGuess();
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
