/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function() {


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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/main.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7VUU5aEJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3MvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3Mvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3Mvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNvbnN0IFNIQUtFX0RVUkFUSU9OID0gNjAwO1xuY29uc3QgSU5QVVRUSU5HX0RVUkFUSU9OID0gMTAwO1xuY29uc3QgRkxJUFBJTkdfRFVSQVRJT04gPSAyMDA7XG5jb25zdCBGTElQUElOR19JTlRFUlZBTCA9IDI1MDtcbmNvbnN0IEJPVU5DRV9EVVJBVElPTiA9IDgwMDtcbmNvbnN0IEJPVU5DRV9JTlRFUlZBTCA9IDI1MDtcbmNvbnN0IFRPT0xUSVBfRkFERV9EVVJBVElPTiA9IDUwMDtcbmNvbnN0IFRPT0xUSVBfU0hPV19EVVJBVElPTiA9IDE1MDA7XG5jb25zdCBVTktOT1dOX1dPUkRfTUVTU0FHRSA9IFwiTm90IGluIHdvcmQgbGlzdFwiO1xuY29uc3QgTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UgPSBcIk5vdCBlbm91Z2ggbGV0dGVyc1wiO1xuY29uc3QgV0lOX01FU1NBR0VTID0gW1xuICAgIFwiR2VuaXVzXCIsXG4gICAgXCJOaWNlXCIsXG4gICAgXCJOaWNlXCIsXG4gICAgXCJOaWNlXCIsXG4gICAgXCJOaWNlXCIsXG4gICAgXCJQaGV3XCIsXG5dO1xuY29uc3QgQ0xPU0VfQ0FMTF9NRVNTQUdFID0gXCJQaGV3XCI7XG5jb25zdCBBTFJFQURZX0dVRVNTRURfTUVTU0FHRSA9IFwiQWxyZWFkeSBndWVzc2VkXCI7XG5jbGFzcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IoY29ycmVjdFdvcmQsIGxlZ2FsV29yZHMpIHtcbiAgICAgICAgdGhpcy5jb3JyZWN0V29yZCA9IGNvcnJlY3RXb3JkO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCA9IFwiXCI7XG4gICAgICAgIHRoaXMubGVnYWxXb3JkcyA9IFtdO1xuICAgICAgICBpZiAobGVnYWxXb3JkcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRMZWdhbFdvcmRzRm9yU2VsZigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sZWdhbFdvcmRzID0gbGVnYWxXb3JkcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmd1ZXNzSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmtleWJvYXJkU3RhdHVzID0gY3JlYXRlS2V5Ym9hcmRTdGF0dXMoKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCA9ICgpID0+IHsgfTtcbiAgICB9XG4gICAgYmluZE1vZGVsQ2hhbmdlZChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dEhhc0FscmVhZHlCZWVuR3Vlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFzdEd1ZXNzZXNBc1N0cmluZ3MoKS5pbmNsdWRlcyh0aGlzLmN1cnJlbnRJbnB1dCk7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dEhhc05vdFlldEJlZW5HdWVzc2VkKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuY3VycmVudElucHV0SGFzQWxyZWFkeUJlZW5HdWVzc2VkKCk7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dElzS25vd24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlZ2FsV29yZHMuaW5jbHVkZXModGhpcy5jdXJyZW50SW5wdXQpO1xuICAgIH1cbiAgICBtYXlDdXJyZW50SW5wdXRCZUFjY2VwdGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudElucHV0SXNGdWxsKCkgJiZcbiAgICAgICAgICAgIHRoaXMuY3VycmVudElucHV0SXNLbm93bigpICYmXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dEhhc05vdFlldEJlZW5HdWVzc2VkKCkpO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXROb3RGdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoIDwgNTtcbiAgICB9XG4gICAgY3VycmVudElucHV0SXNGdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoID49IDU7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dE5vdEVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgY3VycmVudElucHV0SXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggPj0gNjtcbiAgICB9XG4gICAgaGFzTm90UmVhY2hlZEd1ZXNzTGltaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggPCA2O1xuICAgIH1cbiAgICBoYXNXb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RHdWVzc01hdGNoZXNDb3JyZWN0V29yZCgpO1xuICAgIH1cbiAgICBsYXN0R3Vlc3NNYXRjaGVzQ29ycmVjdFdvcmQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdldExhc3RHdWVzc0FzU3RyaW5nKCkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvcnJlY3RXb3JkID09PSB0aGlzLmdldExhc3RHdWVzc0FzU3RyaW5nKCk7XG4gICAgfVxuICAgIGhhc0xvc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1JlYWNoZWRHdWVzc0xpbWl0KCkgJiYgIXRoaXMubGFzdEd1ZXNzTWF0Y2hlc0NvcnJlY3RXb3JkKCk7XG4gICAgfVxuICAgIGlzR2FtZU92ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1dvbigpIHx8IHRoaXMuaGFzTG9zdCgpO1xuICAgIH1cbiAgICBnZXRDdXJyZW50SW5wdXRBc0d1ZXNzKCkge1xuICAgICAgICByZXR1cm4gcGVyZm9ybVdvcmRsZUNvbXBhcmlzb24odGhpcy5jdXJyZW50SW5wdXQsIHRoaXMuY29ycmVjdFdvcmQpO1xuICAgIH1cbiAgICBnZXRDdXJyZW50SW5wdXRQYWRkZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5wYWRFbmQoNSwgXCIgXCIpO1xuICAgIH1cbiAgICBnZXRMYXN0R3Vlc3NBc1N0cmluZygpIHtcbiAgICAgICAgaWYgKHRoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnlbdGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgIC5tYXAoKHgpID0+IHgubGV0dGVyKVxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIGdldFBhc3RHdWVzc2VzQXNTdHJpbmdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnkubWFwKChndWVzcykgPT4gZ3Vlc3MubWFwKChsZXR0ZXIpID0+IGxldHRlci5sZXR0ZXIpLmpvaW4oXCJcIikpO1xuICAgIH1cbiAgICBhY2NlcHRDdXJyZW50SW5wdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5tYXlDdXJyZW50SW5wdXRCZUFjY2VwdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBndWVzcyA9IHRoaXMuZ2V0Q3VycmVudElucHV0QXNHdWVzcygpO1xuICAgICAgICB0aGlzLmd1ZXNzSGlzdG9yeS5wdXNoKGd1ZXNzKTtcbiAgICAgICAgdGhpcy5jbGVhcklucHV0KCk7XG4gICAgICAgIHRoaXMudXBkYXRlS2V5Ym9hcmRTdGF0ZVdpdGhMYXN0R3Vlc3MoKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgY2xlYXJJbnB1dCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgPSBcIlwiO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICB1cGRhdGVLZXlib2FyZFN0YXRlV2l0aExhc3RHdWVzcygpIHtcbiAgICAgICAgY29uc3QgZ3Vlc3MgPSB0aGlzLmd1ZXNzSGlzdG9yeVt0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgICAgZ3Vlc3MuZm9yRWFjaCgobGV0dGVyRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFzdFN0YXR1cyA9IHRoaXMua2V5Ym9hcmRTdGF0dXMuZ2V0KGxldHRlckRhdGEubGV0dGVyKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IGxldHRlckRhdGEuc3RhdHVzO1xuICAgICAgICAgICAgY29uc3QgYmV0dGVyID0gY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzKHBhc3RTdGF0dXMsIG5ld1N0YXR1cyk7XG4gICAgICAgICAgICB0aGlzLmtleWJvYXJkU3RhdHVzLnNldChsZXR0ZXJEYXRhLmxldHRlciwgYmV0dGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIGRlbGV0ZUxldHRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRJbnB1dE5vdEVtcHR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCA9IHRoaXMuY3VycmVudElucHV0LnNsaWNlKDAsIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBhZGRMZXR0ZXIobGV0dGVyKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50SW5wdXROb3RGdWxsKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgKz0gbGV0dGVyO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBsb2FkTGVnYWxXb3Jkc0ZvclNlbGYoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0aGlzLmxlZ2FsV29yZHMgPSB5aWVsZCBsb2FkTGVnYWxXb3Jkc0FzeW5jKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNob29zZUJldHRlckxldHRlclN0YXR1cyhhLCBiKSB7XG4gICAgY29uc3QgaW5kZXhNYXAgPSBbXCJncmVlblwiLCBcInllbGxvd1wiLCBcImdyZXlcIiwgXCJ1bnVzZWRcIl07XG4gICAgY29uc3QgYUluZGV4ID0gaW5kZXhNYXAuaW5kZXhPZihhKTtcbiAgICBjb25zdCBiSW5kZXggPSBpbmRleE1hcC5pbmRleE9mKGIpO1xuICAgIGlmIChhSW5kZXggPCBiSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIHJldHVybiBiO1xufVxuZnVuY3Rpb24gbG9hZExlZ2FsV29yZHNBc3luYygpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGZldGNoKFwiLi92YWxpZC13b3JkbGUtd29yZHMudHh0XCIpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVhZCBsZWdhbCB3b3JkcyBmaWxlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHlpZWxkIHJlc3BvbnNlLnRleHQoKSkuc3BsaXQoXCJcXG5cIikubWFwKCh4KSA9PiB4LnRvVXBwZXJDYXNlKCkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5Ym9hcmRTdGF0dXMoKSB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgbGV0dGVyIG9mIFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIikge1xuICAgICAgICBtYXAuc2V0KGxldHRlciwgXCJ1bnVzZWRcIik7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBwZXJmb3JtV29yZGxlQ29tcGFyaXNvbihpbnB1dFdvcmQsIGNvcnJlY3RXb3JkKSB7XG4gICAgY29uc3QgZ3Vlc3MgPSBbXTtcbiAgICBjb25zdCBpbnB1dExldHRlcnMgPSBpbnB1dFdvcmQuc3BsaXQoXCJcIik7XG4gICAgY29uc3QgY29ycmVjdExldHRlcnMgPSBjb3JyZWN0V29yZC5zcGxpdChcIlwiKTtcbiAgICBpbnB1dExldHRlcnMuZm9yRWFjaCgoaW5wdXRMZXR0ZXIsIGkpID0+IHtcbiAgICAgICAgY29uc3QgY29ycmVjdENoYXIgPSBjb3JyZWN0V29yZFtpXTtcbiAgICAgICAgY29uc3QgcmVzdWx0UGFydCA9IHsgbGV0dGVyOiBpbnB1dExldHRlciB9O1xuICAgICAgICBpZiAoaW5wdXRMZXR0ZXIgPT09IGNvcnJlY3RDaGFyKSB7XG4gICAgICAgICAgICBndWVzcy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0UGFydCksIHsgc3RhdHVzOiBcImdyZWVuXCIgfSkpO1xuICAgICAgICAgICAgY29ycmVjdExldHRlcnNbaV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc29sdXRpb25JbmRleCA9IGNvcnJlY3RMZXR0ZXJzLmluZGV4T2YoaW5wdXRMZXR0ZXIpO1xuICAgICAgICAgICAgaWYgKHNvbHV0aW9uSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3MucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdFBhcnQpLCB7IHN0YXR1czogXCJ5ZWxsb3dcIiB9KSk7XG4gICAgICAgICAgICAgICAgY29ycmVjdExldHRlcnNbc29sdXRpb25JbmRleF0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3MucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdFBhcnQpLCB7IHN0YXR1czogXCJncmV5XCIgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGd1ZXNzO1xufVxuY2xhc3MgVmlldyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudGlsZUdyaWRSb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aWxlZ3JpZFwiKTtcbiAgICAgICAgdGhpcy5rZXlib2FyZFJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I2tleWJvYXJkXCIpO1xuICAgICAgICB0aGlzLnRvb2x0aXBBbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3Rvb2x0aXAtYW5jaG9yXCIpO1xuICAgIH1cbiAgICBiaW5kS2V5UHJlc3NPblBoeXNpY2FsS2V5Ym9hcmQoY2FsbGJhY2spIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQucmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUudG9TdHJpbmcoKSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soXCJFTlRFUlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlLnRvU3RyaW5nKCkgPT09IFwiQmFja3NwYWNlXCIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhcIkJBQ0tTUEFDRVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlLnRvU3RyaW5nKCkuc3RhcnRzV2l0aChcIktleVwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxldHRlciA9IGV2ZW50LmNvZGVcbiAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgLnN1YnN0cmluZygzKVxuICAgICAgICAgICAgICAgICAgICAudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhsZXR0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYmluZENsaWNrVmlydHVhbEtleWJvYXJkKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRSb290LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGxldCB0YXJnZXQ7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQubWF0Y2hlcyhcImRpdi5rZXlib2FyZC1rZXlcIikpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MUGFyYWdyYXBoRWxlbWVudCAmJlxuICAgICAgICAgICAgICAgICgoX2EgPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm1hdGNoZXMoXCJkaXYua2V5Ym9hcmQta2V5XCIpKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGFyZ2V0LmlkLnN1YnN0cmluZyg0KTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxldHRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobW9kZWwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJUaWxlR3JpZChtb2RlbCk7XG4gICAgICAgIHRoaXMucmVuZGVyS2V5Ym9hcmQobW9kZWwpO1xuICAgIH1cbiAgICByZW5kZXJUaWxlR3JpZChtb2RlbCkge1xuICAgICAgICB3aGlsZSAodGhpcy50aWxlR3JpZFJvb3QuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QucmVtb3ZlQ2hpbGQodGhpcy50aWxlR3JpZFJvb3QuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWwuZ3Vlc3NIaXN0b3J5LmZvckVhY2goKGd1ZXNzLCBndWVzc0luZGV4KSA9PiB7XG4gICAgICAgICAgICBndWVzcy5mb3JFYWNoKChsZXR0ZXJEYXRhLCBsZXR0ZXJJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBsZXR0ZXJEYXRhVG9UaWxlRWxlbWVudChsZXR0ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0xhc3RHdWVzcyA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxID09PSBndWVzc0luZGV4O1xuICAgICAgICAgICAgICAgIGlmIChpc0xhc3RHdWVzcykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJsYXN0LWd1ZXNzXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gXCJ0aWxlLVwiICsgZ3Vlc3NJbmRleCArIFwiLVwiICsgbGV0dGVySW5kZXg7XG4gICAgICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtb2RlbC5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWxcbiAgICAgICAgICAgIC5nZXRDdXJyZW50SW5wdXRQYWRkZWQoKVxuICAgICAgICAgICAgLnNwbGl0KFwiXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgobGV0dGVyLCBsZXR0ZXJJbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3NJbmRleCA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gbGV0dGVyVG9UaWxlRWxlbWVudChsZXR0ZXIpO1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY3VycmVudC1pbnB1dFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGlzTGFzdElucHV0ID0gbW9kZWwuY3VycmVudElucHV0Lmxlbmd0aCAtIDEgPT09IGxldHRlckluZGV4O1xuICAgICAgICAgICAgaWYgKGlzTGFzdElucHV0KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibGFzdC1pbnB1dFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQuaWQgPSBcInRpbGUtXCIgKyBndWVzc0luZGV4ICsgXCItXCIgKyBsZXR0ZXJJbmRleDtcbiAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbnVtRW1wdHlSb3dzVG9GaWxsID0gNSAtIG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGVtcHR5Um93SW5kZXggPSAwOyBlbXB0eVJvd0luZGV4IDwgbnVtRW1wdHlSb3dzVG9GaWxsOyBlbXB0eVJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxldHRlckluZGV4ID0gMDsgbGV0dGVySW5kZXggPCA1OyBsZXR0ZXJJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3Vlc3NJbmRleCA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGggKyBlbXB0eVJvd0luZGV4ICsgMTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gbGV0dGVyVG9UaWxlRWxlbWVudChcIiBcIik7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9IFwidGlsZS1cIiArIGd1ZXNzSW5kZXggKyBcIi1cIiArIGxldHRlckluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlbmRlcktleWJvYXJkKG1vZGVsKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUVtcHR5S2V5Ym9hcmRSb3cgPSAocm93TnVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIHJvd0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImtleWJvYXJkLXJvd1wiKTtcbiAgICAgICAgICAgIHJvd0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJvdy1cIiArIChyb3dOdW0gKyAxKSk7XG4gICAgICAgICAgICByb3dFbGVtZW50LmlkID0gXCJrZXlib2FyZC1yb3ctXCIgKyAocm93TnVtICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gcm93RWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY3JlYXRlS2V5Ym9hcmRLZXkgPSAoa2V5RGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmlkID0gXCJrZXktXCIgKyBrZXlEYXRhLmZhY2U7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJrZXlib2FyZC1rZXlcIik7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoa2V5RGF0YS5zdGF0dXMpO1xuICAgICAgICAgICAgaWYgKGtleURhdGEuZmFjZSA9PT0gXCJFTlRFUlwiKSB7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2lkZVwiKTtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJlbnRlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleURhdGEuZmFjZSA9PT0gXCJCQUNLU1BBQ0VcIikge1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpZGVcIik7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYmFja3NwYWNlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibm9ybWFsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgcC5pbm5lckhUTUwgPSBrZXlEYXRhLmZhY2UgPT09IFwiQkFDS1NQQUNFXCIgPyBcIjxcIiA6IGtleURhdGEuZmFjZTtcbiAgICAgICAgICAgIGtleUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XG4gICAgICAgICAgICByZXR1cm4ga2V5RWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgd2hpbGUgKHRoaXMua2V5Ym9hcmRSb290LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMua2V5Ym9hcmRSb290LnJlbW92ZUNoaWxkKHRoaXMua2V5Ym9hcmRSb290LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleWJvYXJkTGF5b3V0ID0gY3JlYXRlS2V5Ym9hcmRMYXlvdXQobW9kZWwua2V5Ym9hcmRTdGF0dXMpO1xuICAgICAgICBrZXlib2FyZExheW91dC5mb3JFYWNoKChyb3csIHJvd051bSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93RWxlbWVudCA9IGNyZWF0ZUVtcHR5S2V5Ym9hcmRSb3cocm93TnVtKTtcbiAgICAgICAgICAgIHJvdy5tYXAoY3JlYXRlS2V5Ym9hcmRLZXkpLmZvckVhY2goKGtleUVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICByb3dFbGVtZW50LmFwcGVuZENoaWxkKGtleUVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmtleWJvYXJkUm9vdC5hcHBlbmRDaGlsZChyb3dFbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNoYWtlKGR1cmF0aW9uSW5Ncykge1xuICAgICAgICBjb25zdCBpbnB1dHRlZFRpbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50aWxlLmN1cnJlbnQtaW5wdXRcIik7XG4gICAgICAgIGlucHV0dGVkVGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwic2hha2luZ1wiKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcInNoYWtpbmdcIik7XG4gICAgICAgICAgICB9LCBkdXJhdGlvbkluTXMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9wKHRpbGUsIGR1cmF0aW9uSW5Ncykge1xuICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJpbnB1dHRpbmdcIik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiaW5wdXR0aW5nXCIpO1xuICAgICAgICB9LCBkdXJhdGlvbkluTXMpO1xuICAgIH1cbiAgICBwb3BMYXN0VGlsZSgpIHtcbiAgICAgICAgY29uc3QgdGlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYudGlsZS5sYXN0LWlucHV0XCIpO1xuICAgICAgICBpZiAodGlsZSAhPT0gbnVsbCAmJiB0aWxlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMucG9wKHRpbGUsIElOUFVUVElOR19EVVJBVElPTik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmxpcEN1cnJlbnRJbnB1dEFuZEFwcGx5Q29sb3JzKGd1ZXNzKSB7XG4gICAgICAgIGNvbnN0IHRpbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50aWxlLmN1cnJlbnQtaW5wdXRcIik7XG4gICAgICAgIGd1ZXNzLmZvckVhY2goKGxldHRlckRhdGEsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aWxlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJmbGlwcGluZy1kb3duXCIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlwcGluZy1kb3duXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJpbnB1dHRpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChsZXR0ZXJEYXRhLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImZsaXBwaW5nLXVwXCIpO1xuICAgICAgICAgICAgICAgIH0sIEZMSVBQSU5HX0RVUkFUSU9OKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpcHBpbmctdXBcIik7XG4gICAgICAgICAgICAgICAgfSwgRkxJUFBJTkdfRFVSQVRJT04gKiAyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGVmZmVjdCwgRkxJUFBJTkdfSU5URVJWQUwgKiBpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJvdW5jZUxhc3RHdWVzcygpIHtcbiAgICAgICAgY29uc3QgdGlsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2LnRpbGUubGFzdC1ndWVzc1wiKTtcbiAgICAgICAgdGlsZXMuZm9yRWFjaCgodGlsZSwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWZmZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImJvdW5jaW5nXCIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJib3VuY2luZ1wiKTtcbiAgICAgICAgICAgICAgICB9LCBCT1VOQ0VfRFVSQVRJT04pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZWZmZWN0LCBCT1VOQ0VfSU5URVJWQUwgKiBpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNob3dUb29sdGlwKG1lc3NhZ2UpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50b29sdGlwXCIpLmZvckVhY2goKHRvb2x0aXApID0+IHtcbiAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKFwidG9vbHRpcFwiKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKFwiZmFkZS1pblwiKTtcbiAgICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBwLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZChwKTtcbiAgICAgICAgdGhpcy50b29sdGlwQW5jaG9yLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZShcImZhZGUtaW5cIik7XG4gICAgICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5hZGQoXCJmYWRlLW91dFwiKTtcbiAgICAgICAgfSwgVE9PTFRJUF9GQURFX0RVUkFUSU9OICsgVE9PTFRJUF9TSE9XX0RVUkFUSU9OKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudG9vbHRpcEFuY2hvci5yZW1vdmVDaGlsZCh0b29sdGlwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cbiAgICAgICAgfSwgVE9PTFRJUF9GQURFX0RVUkFUSU9OICogMiArIFRPT0xUSVBfU0hPV19EVVJBVElPTik7XG4gICAgfVxufVxuY29uc3QgS0VZQk9BUkRfTEFZT1VUX1RFTVBMQVRFID0gW1xuICAgIFwiUVdFUlRZVUlPUFwiLnNwbGl0KFwiXCIpLFxuICAgIFwiQVNERkdISktMXCIuc3BsaXQoXCJcIiksXG4gICAgW1wiRU5URVJcIiwgLi4uXCJaWENWQk5NXCIuc3BsaXQoXCJcIiksIFwiQkFDS1NQQUNFXCJdLFxuXTtcbmZ1bmN0aW9uIGxldHRlclRvVGlsZUVsZW1lbnQobGV0dGVyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChcInRpbGVcIik7XG4gICAgaWYgKGxldHRlciAhPT0gXCIgXCIpIHtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJpbnB1dHRlZFwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG4gICAgfVxuICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwLmlubmVySFRNTCA9IGxldHRlcjtcbiAgICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gICAgcmV0dXJuIGRpdjtcbn1cbmZ1bmN0aW9uIGxldHRlckRhdGFUb1RpbGVFbGVtZW50KGxldHRlckRhdGEpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwidGlsZVwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChsZXR0ZXJEYXRhLnN0YXR1cyk7XG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHAuaW5uZXJIVE1MID0gbGV0dGVyRGF0YS5sZXR0ZXI7XG4gICAgZGl2LmFwcGVuZENoaWxkKHApO1xuICAgIHJldHVybiBkaXY7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlib2FyZExheW91dChrZXlib2FyZFN0YXR1cykge1xuICAgIHJldHVybiBLRVlCT0FSRF9MQVlPVVRfVEVNUExBVEUubWFwKChyb3cpID0+IHJvdy5tYXAoKGxldHRlcikgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmYWNlOiBsZXR0ZXIsXG4gICAgICAgICAgICBzdGF0dXM6IChfYSA9IGtleWJvYXJkU3RhdHVzLmdldChsZXR0ZXIpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcInVudXNlZFwiLFxuICAgICAgICB9O1xuICAgIH0pKTtcbn1cbmNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG1vZGVsLCB2aWV3KSB7XG4gICAgICAgIHRoaXMuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCA9IChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52aWV3LnJlbmRlcihtb2RlbCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlS2V5cHJlc3MgPSAobGV0dGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0xvY2tlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmlzR2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09IFwiRU5URVJcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3VibWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsZXR0ZXIgPT09IFwiQkFDS1NQQUNFXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZURlbGV0ZUxldHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBZGRMZXR0ZXIobGV0dGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVBZGRMZXR0ZXIgPSAobGV0dGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50SW5wdXRJc0Z1bGwoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmhhc1JlYWNoZWRHdWVzc0xpbWl0KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNXb24oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkTGV0dGVyKGxldHRlcik7XG4gICAgICAgICAgICB0aGlzLnZpZXcucG9wTGFzdFRpbGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVEZWxldGVMZXR0ZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50SW5wdXRJc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRlbGV0ZUxldHRlcigpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tb2RlbC5tYXlDdXJyZW50SW5wdXRCZUFjY2VwdGVkKCkgJiYgIXRoaXMubW9kZWwuaGFzV29uKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hha2UoU0hBS0VfRFVSQVRJT04pO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jayhTSEFLRV9EVVJBVElPTik7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dElzS25vd24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoVU5LTk9XTl9XT1JEX01FU1NBR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50SW5wdXROb3RGdWxsKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnNob3dUb29sdGlwKE5PVF9FTk9VR0hfTEVUVEVSU19NRVNTQUdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudElucHV0SGFzQWxyZWFkeUJlZW5HdWVzc2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnNob3dUb29sdGlwKEFMUkVBRFlfR1VFU1NFRF9NRVNTQUdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52aWV3LmZsaXBDdXJyZW50SW5wdXRBbmRBcHBseUNvbG9ycyh0aGlzLm1vZGVsLmdldEN1cnJlbnRJbnB1dEFzR3Vlc3MoKSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmFjY2VwdEN1cnJlbnRJbnB1dCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmhhc1dvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5ib3VuY2VMYXN0R3Vlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnNob3dUb29sdGlwKFdJTl9NRVNTQUdFU1t0aGlzLm1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmhhc0xvc3QoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAodGhpcy5tb2RlbC5jb3JyZWN0V29yZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgRkxJUFBJTkdfSU5URVJWQUwgKiA0ICsgRkxJUFBJTkdfRFVSQVRJT04gKiAyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICB0aGlzLm1vZGVsLmJpbmRNb2RlbENoYW5nZWQodGhpcy5vbk1vZGVsQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgICAgIHRoaXMudmlldy5iaW5kQ2xpY2tWaXJ0dWFsS2V5Ym9hcmQodGhpcy5oYW5kbGVLZXlwcmVzcyk7XG4gICAgICAgIHRoaXMudmlldy5iaW5kS2V5UHJlc3NPblBoeXNpY2FsS2V5Ym9hcmQodGhpcy5oYW5kbGVLZXlwcmVzcyk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcy5tb2RlbCk7XG4gICAgfVxuICAgIGxvY2soZHVyYXRpb25Jbk1zKSB7XG4gICAgICAgIHRoaXMuaXNMb2NrZWQgPSB0cnVlO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgfSwgZHVyYXRpb25Jbk1zKTtcbiAgICB9XG59XG5jb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xubGV0IHdvcmQgPSBzZWFyY2hQYXJhbXMuZ2V0KFwid29yZFwiKTtcbmlmICh3b3JkID09PSBudWxsKSB7XG4gICAgd29yZCA9IFwiSEVMTE9cIjtcbn1cbmNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKHdvcmQpO1xuY29uc3QgdmlldyA9IG5ldyBWaWV3KCk7XG5jb25zdCBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIobW9kZWwsIHZpZXcpO1xuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSB7fTtcbl9fd2VicGFja19tb2R1bGVzX19bXCIuL3NyYy9tYWluLnRzXCJdKCk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=