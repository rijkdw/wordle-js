"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Model {
    constructor(correctWord, legalWords) {
        this.correctWord = correctWord;
        this.currentInput = "";
        this.legalWords = [];
        if (legalWords === "load") {
            this.loadLegalWordsForSelf();
        }
        else {
            this.legalWords = legalWords;
        }
        this.guessHistory = [];
        this.keyboardStatus = new Map();
        this.setupKeyboardStatus();
    }
    loadLegalWordsForSelf() {
        return __awaiter(this, void 0, void 0, function* () {
            this.legalWords = yield Model.loadLegalWords();
        });
    }
    setupKeyboardStatus() {
        for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
            this.keyboardStatus.set(letter, "grey");
        }
    }
    // checks
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
        if (!this.isGameOver()) {
            return false;
        }
        return this.correctWord !== this.getLastGuessAsString();
    }
    isGameOver() {
        return this.hasReachedGuessLimit();
    }
    // conversions
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
    // Domain-specific functions
    static loadLegalWords() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("./valid-wordle-words.txt");
            if (!response.ok) {
                throw new Error("Could not read legal words file");
            }
            return (yield response.text()).split("\n").map((x) => x.toUpperCase());
        });
    }
}
function betterLetterStatus(a, b) {
    const indexMap = ["green", "yellow", "grey"];
    const aIndex = indexMap.indexOf(a);
    const bIndex = indexMap.indexOf(b);
    if (aIndex < bIndex) {
        return a;
    }
    return b;
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
function setupPhysicalKeyboardListener(controller) {
    document.addEventListener("keydown", (event) => {
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
    });
}
class ConsoleView {
    setupListeners(controller) {
        setupPhysicalKeyboardListener(controller);
    }
    update(model) {
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
        console.log(ConsoleView.currentInputToStringRepr(model.getCurrentInputPadded()));
    }
    static guessToStringRepr(guess) {
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
    static currentInputToStringRepr(currentInput) {
        return currentInput
            .split("")
            .map((letter) => (letter === " " ? "   " : " " + letter + " "))
            .map((letter) => letter.toLowerCase())
            .join(" ");
    }
}
class HTMLView {
    update(model) {
        this.updateTileGrid(model);
        this.updateKeyboard(model);
    }
    updateTileGrid(model) {
        const TILE_GRID_ELEMENT = document.getElementById("tilegrid");
        // clear the grid
        TILE_GRID_ELEMENT.innerHTML = "";
        // repopulate the grid
        model.guessHistory.forEach((guess) => {
            guess.forEach((letterData) => {
                const element = HTMLView.letterInGuessDataToTileElement(letterData);
                TILE_GRID_ELEMENT.appendChild(element);
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
            TILE_GRID_ELEMENT.appendChild(element);
        });
        const emptyTilesToFill = 5 - model.guessHistory.length;
        for (let i = 0; i < emptyTilesToFill; i++) {
            "     ".split("").forEach((letter) => {
                const element = HTMLView.letterToTileElement(letter);
                TILE_GRID_ELEMENT.appendChild(element);
            });
        }
    }
    static createKeyboardLayout(model) {
        const KEYBOARD_LAYOUT_TEMPLATE = [
            "QWERTYUIOP".split(""),
            "ASDFGHJKL".split(""),
            ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
        ];
        return KEYBOARD_LAYOUT_TEMPLATE.map((row) => row.map((letter) => {
            var _a;
            return {
                face: letter,
                status: (_a = model.keyboardStatus.get(letter)) !== null && _a !== void 0 ? _a : "grey",
            };
        }));
    }
    updateKeyboard(model) {
        const KEYBOARD_ELEMENT = document.getElementById("keyboard");
        KEYBOARD_ELEMENT.innerHTML = "";
        const keyboardLayout = HTMLView.createKeyboardLayout(model);
        keyboardLayout.forEach((row, i) => {
            const rowElement = document.createElement("div");
            rowElement.classList.add("keyboard-row");
            rowElement.classList.add("row-" + (i + 1));
            rowElement.id = "keyboard-row-" + (i + 1);
            for (const keyData of row) {
                const keyElement = document.createElement("div");
                const p = document.createElement("p");
                p.innerHTML = keyData.face === "BACKSPACE" ? "<" : keyData.face;
                keyElement.classList.add("keyboard-key");
                keyElement.appendChild(p);
                if (keyData.face === "ENTER") {
                    keyElement.classList.add("wide");
                    keyElement.classList.add("enter");
                }
                else if (keyData.face === "BACKSPACE") {
                    keyElement.classList.add("wide");
                    keyElement.classList.add("backspace");
                }
                rowElement.appendChild(keyElement);
            }
            KEYBOARD_ELEMENT.appendChild(rowElement);
        });
    }
    static letterToTileElement(letter) {
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
    static letterInGuessDataToTileElement(letterData) {
        const div = document.createElement("div");
        div.classList.add("tile");
        div.classList.add(letterData.status);
        const p = document.createElement("p");
        p.innerHTML = letterData.letter;
        div.appendChild(p);
        return div;
    }
    setupListeners(controller) {
        setupPhysicalKeyboardListener(controller);
        // TODO virtual keyboard
    }
}
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }
    initialize() {
        this.view.setupListeners(this);
        this.view.update(this.model);
    }
    postModelUpdateRoutine() {
        this.view.update(this.model);
    }
    updateKeyboardStatus(guess) {
        guess.forEach((letterData) => {
            const pastStatus = this.model.keyboardStatus.get(letterData.letter);
            const newStatus = letterData.status;
            const better = betterLetterStatus(pastStatus, newStatus);
            this.model.keyboardStatus.set(letterData.letter, better);
        });
    }
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
    handleBackspaceEvent() {
        if (!this.model.mayDeleteLetter()) {
            return;
        }
        const c = this.model.currentInput;
        this.model.currentInput = c.slice(0, c.length - 1);
        this.postModelUpdateRoutine();
    }
}
function main() {
    const model = new Model("WHISK", "load");
    const view = new HTMLView();
    const controller = new Controller(model, view);
    controller.initialize();
}
main();
