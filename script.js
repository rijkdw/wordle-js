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
    "Nice",
    "Nice",
    "Nice",
    "Nice",
    "Phew",
];
const CLOSE_CALL_MESSAGE = "Phew";
const ALREADY_GUESSED_MESSAGE = "Already guessed";
class Model {
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
        return (this.currentInputIsFull() &&
            this.currentInputIsKnown() &&
            this.currentInputHasNotYetBeenGuessed());
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
    getCurrentInputAsGuess() {
        return performWordleComparison(this.currentInput, this.correctWord);
    }
    getCurrentInputPadded() {
        return this.currentInput.padEnd(5, " ");
    }
    getLastGuessAsString() {
        if (this.guessHistory.length === 0) {
            return undefined;
        }
        return this.guessHistory[this.guessHistory.length - 1]
            .map((x) => x.letter)
            .join("");
    }
    getPastGuessesAsStrings() {
        return this.guessHistory.map((guess) => guess.map((letter) => letter.letter).join(""));
    }
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
            const better = chooseBetterLetterStatus(pastStatus, newStatus);
            this.keyboardStatus.set(letterData.letter, better);
        });
        this.onModelChanged(this);
    }
    deleteLetter() {
        if (!this.currentInputNotEmpty()) {
            return;
        }
        this.currentInput = this.currentInput.slice(0, this.currentInput.length - 1);
        this.onModelChanged(this);
    }
    addLetter(letter) {
        if (!this.currentInputNotFull()) {
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
            this.legalWords = yield loadLegalWordsAsync();
        });
    }
}
function chooseBetterLetterStatus(a, b) {
    const indexMap = ["green", "yellow", "grey", "unused"];
    const aIndex = indexMap.indexOf(a);
    const bIndex = indexMap.indexOf(b);
    if (aIndex < bIndex) {
        return a;
    }
    return b;
}
function loadLegalWordsAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("./valid-wordle-words.txt");
        if (!response.ok) {
            throw new Error("Could not read legal words file.");
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
function performWordleComparison(inputWord, correctWord) {
    const guess = [];
    const inputLetters = inputWord.split("");
    const correctLetters = correctWord.split("");
    inputLetters.forEach((inputLetter, i) => {
        const correctChar = correctWord[i];
        const resultPart = { letter: inputLetter };
        if (inputLetter === correctChar) {
            guess.push(Object.assign(Object.assign({}, resultPart), { status: "green" }));
            correctLetters[i] = null;
        }
        else {
            const solutionIndex = correctLetters.indexOf(inputLetter);
            if (solutionIndex !== -1) {
                guess.push(Object.assign(Object.assign({}, resultPart), { status: "yellow" }));
                correctLetters[solutionIndex] = null;
            }
            else {
                guess.push(Object.assign(Object.assign({}, resultPart), { status: "grey" }));
            }
        }
    });
    return guess;
}
class View {
    constructor() {
        this.tileGridRoot = document.querySelector("div#tilegrid");
        this.keyboardRoot = document.querySelector("div#keyboard");
        this.tooltipAnchor = document.querySelector("div#tooltip-anchor");
    }
    bindKeyPressOnPhysicalKeyboard(callback) {
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
    render(model) {
        this.renderTileGrid(model);
        this.renderKeyboard(model);
    }
    renderTileGrid(model) {
        while (this.tileGridRoot.firstChild) {
            this.tileGridRoot.removeChild(this.tileGridRoot.firstChild);
        }
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
        if (model.hasReachedGuessLimit()) {
            return;
        }
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
        const numEmptyRowsToFill = 5 - model.guessHistory.length;
        for (let emptyRowIndex = 0; emptyRowIndex < numEmptyRowsToFill; emptyRowIndex++) {
            for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
                const guessIndex = model.guessHistory.length + emptyRowIndex + 1;
                const element = letterToTileElement(" ");
                element.id = "tile-" + guessIndex + "-" + letterIndex;
                this.tileGridRoot.appendChild(element);
            }
        }
    }
    renderKeyboard(model) {
        const createEmptyKeyboardRow = (rowNum) => {
            const rowElement = document.createElement("div");
            rowElement.classList.add("keyboard-row");
            rowElement.classList.add("row-" + (rowNum + 1));
            rowElement.id = "keyboard-row-" + (rowNum + 1);
            return rowElement;
        };
        const createKeyboardKey = (keyData) => {
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
            else {
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
    shake(durationInMs) {
        const inputtedTiles = document.querySelectorAll("div.tile.current-input");
        inputtedTiles.forEach((tile) => {
            tile.classList.add("shaking");
            setTimeout(() => {
                tile.classList.remove("shaking");
            }, durationInMs);
        });
    }
    pop(tile, durationInMs) {
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
    flipCurrentInputAndApplyColors(guess) {
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
    showTooltip(message) {
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
            }
            catch (e) { }
        }, TOOLTIP_FADE_DURATION * 2 + TOOLTIP_SHOW_DURATION);
    }
}
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
function createKeyboardLayout(keyboardStatus) {
    return KEYBOARD_LAYOUT_TEMPLATE.map((row) => row.map((letter) => {
        var _a;
        return {
            face: letter,
            status: (_a = keyboardStatus.get(letter)) !== null && _a !== void 0 ? _a : "unused",
        };
    }));
}
class Controller {
    constructor(model, view) {
        this.isLocked = false;
        this.onModelChanged = (model) => {
            this.view.render(model);
        };
        this.handleKeypress = (letter) => {
            if (this.isLocked) {
                return;
            }
            if (this.model.isGameOver()) {
                return;
            }
            if (letter === "ENTER") {
                this.handleSubmit();
            }
            else if (letter === "BACKSPACE") {
                this.handleDeleteLetter();
            }
            else {
                this.handleAddLetter(letter);
            }
        };
        this.handleAddLetter = (letter) => {
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
        this.handleDeleteLetter = () => {
            if (this.model.currentInputIsEmpty()) {
                return;
            }
            this.model.deleteLetter();
        };
        this.handleSubmit = () => {
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
            this.view.flipCurrentInputAndApplyColors(this.model.getCurrentInputAsGuess());
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
        this.model = model;
        this.model.bindModelChanged(this.onModelChanged);
        this.view = view;
        this.view.bindClickVirtualKeyboard(this.handleKeypress);
        this.view.bindKeyPressOnPhysicalKeyboard(this.handleKeypress);
        this.onModelChanged(this.model);
    }
    lock(durationInMs) {
        this.isLocked = true;
        setTimeout(() => {
            this.isLocked = false;
        }, durationInMs);
    }
}
const searchParams = new URLSearchParams(window.location.search);
let word = searchParams.get("word");
if (word === null) {
    word = "HELLO";
}
const model = new Model(word);
const view = new View();
const controller = new Controller(model, view);
