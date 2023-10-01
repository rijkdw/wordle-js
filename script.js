/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ALREADY_GUESSED_MESSAGE = exports.CLOSE_CALL_MESSAGE = exports.WIN_MESSAGES = exports.NOT_ENOUGH_LETTERS_MESSAGE = exports.UNKNOWN_WORD_MESSAGE = exports.TOOLTIP_SHOW_DURATION = exports.TOOLTIP_FADE_DURATION = exports.BOUNCE_INTERVAL = exports.BOUNCE_DURATION = exports.FLIPPING_INTERVAL = exports.FLIPPING_DURATION = exports.INPUTTING_DURATION = exports.SHAKE_DURATION = void 0;
exports.SHAKE_DURATION = 600;
exports.INPUTTING_DURATION = 100;
exports.FLIPPING_DURATION = 200;
exports.FLIPPING_INTERVAL = 250;
exports.BOUNCE_DURATION = 800;
exports.BOUNCE_INTERVAL = 250;
exports.TOOLTIP_FADE_DURATION = 500;
exports.TOOLTIP_SHOW_DURATION = 1500;
exports.UNKNOWN_WORD_MESSAGE = "Not in word list";
exports.NOT_ENOUGH_LETTERS_MESSAGE = "Not enough letters";
exports.WIN_MESSAGES = [
    "Genius",
    "Nice",
    "Nice",
    "Nice",
    "Nice",
    "Phew",
];
exports.CLOSE_CALL_MESSAGE = "Phew";
exports.ALREADY_GUESSED_MESSAGE = "Already guessed";


/***/ }),

/***/ "./src/controller.ts":
/*!***************************!*\
  !*** ./src/controller.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Controller = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
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
                this.view.shake(constants_1.SHAKE_DURATION);
                this.lock(constants_1.SHAKE_DURATION);
                if (!this.model.currentInputIsKnown()) {
                    this.view.showTooltip(constants_1.UNKNOWN_WORD_MESSAGE);
                }
                if (this.model.currentInputNotFull()) {
                    this.view.showTooltip(constants_1.NOT_ENOUGH_LETTERS_MESSAGE);
                }
                if (this.model.currentInputHasAlreadyBeenGuessed()) {
                    this.view.showTooltip(constants_1.ALREADY_GUESSED_MESSAGE);
                }
                return;
            }
            this.view.flipCurrentInputAndApplyColors(this.model.getCurrentInputAsGuess());
            setTimeout(() => {
                this.model.acceptCurrentInput();
                if (this.model.hasWon()) {
                    this.view.bounceLastGuess();
                    this.view.showTooltip(constants_1.WIN_MESSAGES[this.model.guessHistory.length - 1]);
                }
                if (this.model.hasLost()) {
                    this.view.showTooltip(this.model.correctWord);
                }
            }, constants_1.FLIPPING_INTERVAL * 4 + constants_1.FLIPPING_DURATION * 2);
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
exports.Controller = Controller;


/***/ }),

/***/ "./src/model.ts":
/*!**********************!*\
  !*** ./src/model.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Model = void 0;
const modelutils_1 = __webpack_require__(/*! ./modelutils */ "./src/modelutils.ts");
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
        this.keyboardStatus = (0, modelutils_1.createKeyboardStatus)();
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
        return (0, modelutils_1.performWordleComparison)(this.currentInput, this.correctWord);
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
            const better = (0, modelutils_1.chooseBetterLetterStatus)(pastStatus, newStatus);
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
            this.legalWords = yield (0, modelutils_1.loadLegalWordsAsync)();
        });
    }
}
exports.Model = Model;


/***/ }),

/***/ "./src/modelutils.ts":
/*!***************************!*\
  !*** ./src/modelutils.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.performWordleComparison = exports.createKeyboardStatus = exports.loadLegalWordsAsync = exports.chooseBetterLetterStatus = void 0;
function chooseBetterLetterStatus(a, b) {
    const indexMap = ["green", "yellow", "grey", "unused"];
    const aIndex = indexMap.indexOf(a);
    const bIndex = indexMap.indexOf(b);
    if (aIndex < bIndex) {
        return a;
    }
    return b;
}
exports.chooseBetterLetterStatus = chooseBetterLetterStatus;
function loadLegalWordsAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("./valid-wordle-words.txt");
        if (!response.ok) {
            throw new Error("Could not read legal words file.");
        }
        return (yield response.text()).split("\n").map((x) => x.toUpperCase());
    });
}
exports.loadLegalWordsAsync = loadLegalWordsAsync;
function createKeyboardStatus() {
    const map = new Map();
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        map.set(letter, "unused");
    }
    return map;
}
exports.createKeyboardStatus = createKeyboardStatus;
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
exports.performWordleComparison = performWordleComparison;


/***/ }),

/***/ "./src/view.ts":
/*!*********************!*\
  !*** ./src/view.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.View = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
const viewutils_1 = __webpack_require__(/*! ./viewutils */ "./src/viewutils.ts");
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
                const element = (0, viewutils_1.letterDataToTileElement)(letterData);
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
            const element = (0, viewutils_1.letterToTileElement)(letter);
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
                const element = (0, viewutils_1.letterToTileElement)(" ");
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
        const keyboardLayout = (0, viewutils_1.createKeyboardLayout)(model.keyboardStatus);
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
            this.pop(tile, constants_1.INPUTTING_DURATION);
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
                }, constants_1.FLIPPING_DURATION);
                setTimeout(() => {
                    tile.classList.remove("flipping-up");
                }, constants_1.FLIPPING_DURATION * 2);
            };
            setTimeout(effect, constants_1.FLIPPING_INTERVAL * i);
        });
    }
    bounceLastGuess() {
        const tiles = document.querySelectorAll("div.tile.last-guess");
        tiles.forEach((tile, i) => {
            const effect = () => {
                tile.classList.add("bouncing");
                setTimeout(() => {
                    tile.classList.remove("bouncing");
                }, constants_1.BOUNCE_DURATION);
            };
            setTimeout(effect, constants_1.BOUNCE_INTERVAL * i);
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
        }, constants_1.TOOLTIP_FADE_DURATION + constants_1.TOOLTIP_SHOW_DURATION);
        setTimeout(() => {
            try {
                this.tooltipAnchor.removeChild(tooltip);
            }
            catch (e) { }
        }, constants_1.TOOLTIP_FADE_DURATION * 2 + constants_1.TOOLTIP_SHOW_DURATION);
    }
}
exports.View = View;


/***/ }),

/***/ "./src/viewutils.ts":
/*!**************************!*\
  !*** ./src/viewutils.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createKeyboardLayout = exports.letterDataToTileElement = exports.letterToTileElement = void 0;
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
exports.letterToTileElement = letterToTileElement;
function letterDataToTileElement(letterData) {
    const div = document.createElement("div");
    div.classList.add("tile");
    div.classList.add(letterData.status);
    const p = document.createElement("p");
    p.innerHTML = letterData.letter;
    div.appendChild(p);
    return div;
}
exports.letterDataToTileElement = letterDataToTileElement;
function createKeyboardLayout(keyboardStatus) {
    return KEYBOARD_LAYOUT_TEMPLATE.map((row) => row.map((letter) => {
        var _a;
        return {
            face: letter,
            status: (_a = keyboardStatus.get(letter)) !== null && _a !== void 0 ? _a : "unused",
        };
    }));
}
exports.createKeyboardLayout = createKeyboardLayout;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const model_1 = __webpack_require__(/*! ./model */ "./src/model.ts");
const controller_1 = __webpack_require__(/*! ./controller */ "./src/controller.ts");
const view_1 = __webpack_require__(/*! ./view */ "./src/view.ts");
const searchParams = new URLSearchParams(window.location.search);
let word = searchParams.get("word");
if (word === null) {
    word = "HELLO";
}
word = word.toUpperCase();
const model = new model_1.Model(word);
const view = new view_1.View();
const controller = new controller_1.Controller(model, view);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esb0NBQW9DLG9DQUFvQztBQUN4RSxzQ0FBc0MsaUJBQWlCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsWUFBWTs7Ozs7Ozs7Ozs7QUNwTkM7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNEJBQTRCLEdBQUcsK0JBQStCLEdBQUcsMkJBQTJCO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDRCQUE0Qjs7Ozs7OztVQzFDNUI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7OztBQ3RCYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxnQkFBZ0IsbUJBQU8sQ0FBQywrQkFBUztBQUNqQyxxQkFBcUIsbUJBQU8sQ0FBQyx5Q0FBYztBQUMzQyxlQUFlLG1CQUFPLENBQUMsNkJBQVE7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3MvLi9zcmMvY29udHJvbGxlci50cyIsIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3MvLi9zcmMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL21vZGVsdXRpbHMudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL3ZpZXd1dGlscy50cyIsIndlYnBhY2s6Ly93b3JkbGUtaHRtbC1jc3Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFMUkVBRFlfR1VFU1NFRF9NRVNTQUdFID0gZXhwb3J0cy5DTE9TRV9DQUxMX01FU1NBR0UgPSBleHBvcnRzLldJTl9NRVNTQUdFUyA9IGV4cG9ydHMuTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UgPSBleHBvcnRzLlVOS05PV05fV09SRF9NRVNTQUdFID0gZXhwb3J0cy5UT09MVElQX1NIT1dfRFVSQVRJT04gPSBleHBvcnRzLlRPT0xUSVBfRkFERV9EVVJBVElPTiA9IGV4cG9ydHMuQk9VTkNFX0lOVEVSVkFMID0gZXhwb3J0cy5CT1VOQ0VfRFVSQVRJT04gPSBleHBvcnRzLkZMSVBQSU5HX0lOVEVSVkFMID0gZXhwb3J0cy5GTElQUElOR19EVVJBVElPTiA9IGV4cG9ydHMuSU5QVVRUSU5HX0RVUkFUSU9OID0gZXhwb3J0cy5TSEFLRV9EVVJBVElPTiA9IHZvaWQgMDtcbmV4cG9ydHMuU0hBS0VfRFVSQVRJT04gPSA2MDA7XG5leHBvcnRzLklOUFVUVElOR19EVVJBVElPTiA9IDEwMDtcbmV4cG9ydHMuRkxJUFBJTkdfRFVSQVRJT04gPSAyMDA7XG5leHBvcnRzLkZMSVBQSU5HX0lOVEVSVkFMID0gMjUwO1xuZXhwb3J0cy5CT1VOQ0VfRFVSQVRJT04gPSA4MDA7XG5leHBvcnRzLkJPVU5DRV9JTlRFUlZBTCA9IDI1MDtcbmV4cG9ydHMuVE9PTFRJUF9GQURFX0RVUkFUSU9OID0gNTAwO1xuZXhwb3J0cy5UT09MVElQX1NIT1dfRFVSQVRJT04gPSAxNTAwO1xuZXhwb3J0cy5VTktOT1dOX1dPUkRfTUVTU0FHRSA9IFwiTm90IGluIHdvcmQgbGlzdFwiO1xuZXhwb3J0cy5OT1RfRU5PVUdIX0xFVFRFUlNfTUVTU0FHRSA9IFwiTm90IGVub3VnaCBsZXR0ZXJzXCI7XG5leHBvcnRzLldJTl9NRVNTQUdFUyA9IFtcbiAgICBcIkdlbml1c1wiLFxuICAgIFwiTmljZVwiLFxuICAgIFwiTmljZVwiLFxuICAgIFwiTmljZVwiLFxuICAgIFwiTmljZVwiLFxuICAgIFwiUGhld1wiLFxuXTtcbmV4cG9ydHMuQ0xPU0VfQ0FMTF9NRVNTQUdFID0gXCJQaGV3XCI7XG5leHBvcnRzLkFMUkVBRFlfR1VFU1NFRF9NRVNTQUdFID0gXCJBbHJlYWR5IGd1ZXNzZWRcIjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db250cm9sbGVyID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihtb2RlbCwgdmlldykge1xuICAgICAgICB0aGlzLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQgPSAobW9kZWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmlldy5yZW5kZXIobW9kZWwpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUtleXByZXNzID0gKGxldHRlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2NrZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5pc0dhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGV0dGVyID09PSBcIkVOVEVSXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN1Ym1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGV0dGVyID09PSBcIkJBQ0tTUEFDRVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVEZWxldGVMZXR0ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWRkTGV0dGVyKGxldHRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlQWRkTGV0dGVyID0gKGxldHRlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudElucHV0SXNGdWxsKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaGFzV29uKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZExldHRlcihsZXR0ZXIpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnBvcExhc3RUaWxlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlRGVsZXRlTGV0dGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudElucHV0SXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tb2RlbC5kZWxldGVMZXR0ZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVTdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubW9kZWwubWF5Q3VycmVudElucHV0QmVBY2NlcHRlZCgpICYmICF0aGlzLm1vZGVsLmhhc1dvbigpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3LnNoYWtlKGNvbnN0YW50c18xLlNIQUtFX0RVUkFUSU9OKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2soY29uc3RhbnRzXzEuU0hBS0VfRFVSQVRJT04pO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb2RlbC5jdXJyZW50SW5wdXRJc0tub3duKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnNob3dUb29sdGlwKGNvbnN0YW50c18xLlVOS05PV05fV09SRF9NRVNTQUdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudElucHV0Tm90RnVsbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5OT1RfRU5PVUdIX0xFVFRFUlNfTUVTU0FHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dEhhc0FscmVhZHlCZWVuR3Vlc3NlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5BTFJFQURZX0dVRVNTRURfTUVTU0FHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmlldy5mbGlwQ3VycmVudElucHV0QW5kQXBwbHlDb2xvcnModGhpcy5tb2RlbC5nZXRDdXJyZW50SW5wdXRBc0d1ZXNzKCkpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5hY2NlcHRDdXJyZW50SW5wdXQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNXb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuYm91bmNlTGFzdEd1ZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5XSU5fTUVTU0FHRVNbdGhpcy5tb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNMb3N0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LnNob3dUb29sdGlwKHRoaXMubW9kZWwuY29ycmVjdFdvcmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGNvbnN0YW50c18xLkZMSVBQSU5HX0lOVEVSVkFMICogNCArIGNvbnN0YW50c18xLkZMSVBQSU5HX0RVUkFUSU9OICogMik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICAgICAgdGhpcy5tb2RlbC5iaW5kTW9kZWxDaGFuZ2VkKHRoaXMub25Nb2RlbENoYW5nZWQpO1xuICAgICAgICB0aGlzLnZpZXcgPSB2aWV3O1xuICAgICAgICB0aGlzLnZpZXcuYmluZENsaWNrVmlydHVhbEtleWJvYXJkKHRoaXMuaGFuZGxlS2V5cHJlc3MpO1xuICAgICAgICB0aGlzLnZpZXcuYmluZEtleVByZXNzT25QaHlzaWNhbEtleWJvYXJkKHRoaXMuaGFuZGxlS2V5cHJlc3MpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMubW9kZWwpO1xuICAgIH1cbiAgICBsb2NrKGR1cmF0aW9uSW5Ncykge1xuICAgICAgICB0aGlzLmlzTG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIH0sIGR1cmF0aW9uSW5Ncyk7XG4gICAgfVxufVxuZXhwb3J0cy5Db250cm9sbGVyID0gQ29udHJvbGxlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1vZGVsID0gdm9pZCAwO1xuY29uc3QgbW9kZWx1dGlsc18xID0gcmVxdWlyZShcIi4vbW9kZWx1dGlsc1wiKTtcbmNsYXNzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3Rvcihjb3JyZWN0V29yZCwgbGVnYWxXb3Jkcykge1xuICAgICAgICB0aGlzLmNvcnJlY3RXb3JkID0gY29ycmVjdFdvcmQ7XG4gICAgICAgIHRoaXMuY3VycmVudElucHV0ID0gXCJcIjtcbiAgICAgICAgdGhpcy5sZWdhbFdvcmRzID0gW107XG4gICAgICAgIGlmIChsZWdhbFdvcmRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZExlZ2FsV29yZHNGb3JTZWxmKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxlZ2FsV29yZHMgPSBsZWdhbFdvcmRzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3Vlc3NIaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMua2V5Ym9hcmRTdGF0dXMgPSAoMCwgbW9kZWx1dGlsc18xLmNyZWF0ZUtleWJvYXJkU3RhdHVzKSgpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkID0gKCkgPT4geyB9O1xuICAgIH1cbiAgICBiaW5kTW9kZWxDaGFuZ2VkKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgY3VycmVudElucHV0SGFzQWxyZWFkeUJlZW5HdWVzc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXN0R3Vlc3Nlc0FzU3RyaW5ncygpLmluY2x1ZGVzKHRoaXMuY3VycmVudElucHV0KTtcbiAgICB9XG4gICAgY3VycmVudElucHV0SGFzTm90WWV0QmVlbkd1ZXNzZWQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5jdXJyZW50SW5wdXRIYXNBbHJlYWR5QmVlbkd1ZXNzZWQoKTtcbiAgICB9XG4gICAgY3VycmVudElucHV0SXNLbm93bigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGVnYWxXb3Jkcy5pbmNsdWRlcyh0aGlzLmN1cnJlbnRJbnB1dCk7XG4gICAgfVxuICAgIG1heUN1cnJlbnRJbnB1dEJlQWNjZXB0ZWQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5jdXJyZW50SW5wdXRJc0Z1bGwoKSAmJlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5wdXRJc0tub3duKCkgJiZcbiAgICAgICAgICAgIHRoaXMuY3VycmVudElucHV0SGFzTm90WWV0QmVlbkd1ZXNzZWQoKSk7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dE5vdEZ1bGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5sZW5ndGggPCA1O1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXRJc0Z1bGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5sZW5ndGggPj0gNTtcbiAgICB9XG4gICAgY3VycmVudElucHV0Tm90RW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXRJc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgICBoYXNSZWFjaGVkR3Vlc3NMaW1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCA+PSA2O1xuICAgIH1cbiAgICBoYXNOb3RSZWFjaGVkR3Vlc3NMaW1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCA8IDY7XG4gICAgfVxuICAgIGhhc1dvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdEd1ZXNzTWF0Y2hlc0NvcnJlY3RXb3JkKCk7XG4gICAgfVxuICAgIGxhc3RHdWVzc01hdGNoZXNDb3JyZWN0V29yZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0TGFzdEd1ZXNzQXNTdHJpbmcoKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29ycmVjdFdvcmQgPT09IHRoaXMuZ2V0TGFzdEd1ZXNzQXNTdHJpbmcoKTtcbiAgICB9XG4gICAgaGFzTG9zdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSAmJiAhdGhpcy5sYXN0R3Vlc3NNYXRjaGVzQ29ycmVjdFdvcmQoKTtcbiAgICB9XG4gICAgaXNHYW1lT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzV29uKCkgfHwgdGhpcy5oYXNMb3N0KCk7XG4gICAgfVxuICAgIGdldEN1cnJlbnRJbnB1dEFzR3Vlc3MoKSB7XG4gICAgICAgIHJldHVybiAoMCwgbW9kZWx1dGlsc18xLnBlcmZvcm1Xb3JkbGVDb21wYXJpc29uKSh0aGlzLmN1cnJlbnRJbnB1dCwgdGhpcy5jb3JyZWN0V29yZCk7XG4gICAgfVxuICAgIGdldEN1cnJlbnRJbnB1dFBhZGRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0LnBhZEVuZCg1LCBcIiBcIik7XG4gICAgfVxuICAgIGdldExhc3RHdWVzc0FzU3RyaW5nKCkge1xuICAgICAgICBpZiAodGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeVt0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxXVxuICAgICAgICAgICAgLm1hcCgoeCkgPT4geC5sZXR0ZXIpXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcbiAgICB9XG4gICAgZ2V0UGFzdEd1ZXNzZXNBc1N0cmluZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeS5tYXAoKGd1ZXNzKSA9PiBndWVzcy5tYXAoKGxldHRlcikgPT4gbGV0dGVyLmxldHRlcikuam9pbihcIlwiKSk7XG4gICAgfVxuICAgIGFjY2VwdEN1cnJlbnRJbnB1dCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1heUN1cnJlbnRJbnB1dEJlQWNjZXB0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGd1ZXNzID0gdGhpcy5nZXRDdXJyZW50SW5wdXRBc0d1ZXNzKCk7XG4gICAgICAgIHRoaXMuZ3Vlc3NIaXN0b3J5LnB1c2goZ3Vlc3MpO1xuICAgICAgICB0aGlzLmNsZWFySW5wdXQoKTtcbiAgICAgICAgdGhpcy51cGRhdGVLZXlib2FyZFN0YXRlV2l0aExhc3RHdWVzcygpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBjbGVhcklucHV0KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCA9IFwiXCI7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIHVwZGF0ZUtleWJvYXJkU3RhdGVXaXRoTGFzdEd1ZXNzKCkge1xuICAgICAgICBjb25zdCBndWVzcyA9IHRoaXMuZ3Vlc3NIaXN0b3J5W3RoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgICBndWVzcy5mb3JFYWNoKChsZXR0ZXJEYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXN0U3RhdHVzID0gdGhpcy5rZXlib2FyZFN0YXR1cy5nZXQobGV0dGVyRGF0YS5sZXR0ZXIpO1xuICAgICAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gbGV0dGVyRGF0YS5zdGF0dXM7XG4gICAgICAgICAgICBjb25zdCBiZXR0ZXIgPSAoMCwgbW9kZWx1dGlsc18xLmNob29zZUJldHRlckxldHRlclN0YXR1cykocGFzdFN0YXR1cywgbmV3U3RhdHVzKTtcbiAgICAgICAgICAgIHRoaXMua2V5Ym9hcmRTdGF0dXMuc2V0KGxldHRlckRhdGEubGV0dGVyLCBiZXR0ZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgZGVsZXRlTGV0dGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudElucHV0Tm90RW1wdHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudElucHV0ID0gdGhpcy5jdXJyZW50SW5wdXQuc2xpY2UoMCwgdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIGFkZExldHRlcihsZXR0ZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRJbnB1dE5vdEZ1bGwoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmhhc1JlYWNoZWRHdWVzc0xpbWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCArPSBsZXR0ZXI7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIGxvYWRMZWdhbFdvcmRzRm9yU2VsZigpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRoaXMubGVnYWxXb3JkcyA9IHlpZWxkICgwLCBtb2RlbHV0aWxzXzEubG9hZExlZ2FsV29yZHNBc3luYykoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5Nb2RlbCA9IE1vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucGVyZm9ybVdvcmRsZUNvbXBhcmlzb24gPSBleHBvcnRzLmNyZWF0ZUtleWJvYXJkU3RhdHVzID0gZXhwb3J0cy5sb2FkTGVnYWxXb3Jkc0FzeW5jID0gZXhwb3J0cy5jaG9vc2VCZXR0ZXJMZXR0ZXJTdGF0dXMgPSB2b2lkIDA7XG5mdW5jdGlvbiBjaG9vc2VCZXR0ZXJMZXR0ZXJTdGF0dXMoYSwgYikge1xuICAgIGNvbnN0IGluZGV4TWFwID0gW1wiZ3JlZW5cIiwgXCJ5ZWxsb3dcIiwgXCJncmV5XCIsIFwidW51c2VkXCJdO1xuICAgIGNvbnN0IGFJbmRleCA9IGluZGV4TWFwLmluZGV4T2YoYSk7XG4gICAgY29uc3QgYkluZGV4ID0gaW5kZXhNYXAuaW5kZXhPZihiKTtcbiAgICBpZiAoYUluZGV4IDwgYkluZGV4KSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbn1cbmV4cG9ydHMuY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzID0gY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzO1xuZnVuY3Rpb24gbG9hZExlZ2FsV29yZHNBc3luYygpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGZldGNoKFwiLi92YWxpZC13b3JkbGUtd29yZHMudHh0XCIpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVhZCBsZWdhbCB3b3JkcyBmaWxlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHlpZWxkIHJlc3BvbnNlLnRleHQoKSkuc3BsaXQoXCJcXG5cIikubWFwKCh4KSA9PiB4LnRvVXBwZXJDYXNlKCkpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5sb2FkTGVnYWxXb3Jkc0FzeW5jID0gbG9hZExlZ2FsV29yZHNBc3luYztcbmZ1bmN0aW9uIGNyZWF0ZUtleWJvYXJkU3RhdHVzKCkge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGxldHRlciBvZiBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIpIHtcbiAgICAgICAgbWFwLnNldChsZXR0ZXIsIFwidW51c2VkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuZXhwb3J0cy5jcmVhdGVLZXlib2FyZFN0YXR1cyA9IGNyZWF0ZUtleWJvYXJkU3RhdHVzO1xuZnVuY3Rpb24gcGVyZm9ybVdvcmRsZUNvbXBhcmlzb24oaW5wdXRXb3JkLCBjb3JyZWN0V29yZCkge1xuICAgIGNvbnN0IGd1ZXNzID0gW107XG4gICAgY29uc3QgaW5wdXRMZXR0ZXJzID0gaW5wdXRXb3JkLnNwbGl0KFwiXCIpO1xuICAgIGNvbnN0IGNvcnJlY3RMZXR0ZXJzID0gY29ycmVjdFdvcmQuc3BsaXQoXCJcIik7XG4gICAgaW5wdXRMZXR0ZXJzLmZvckVhY2goKGlucHV0TGV0dGVyLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvcnJlY3RDaGFyID0gY29ycmVjdFdvcmRbaV07XG4gICAgICAgIGNvbnN0IHJlc3VsdFBhcnQgPSB7IGxldHRlcjogaW5wdXRMZXR0ZXIgfTtcbiAgICAgICAgaWYgKGlucHV0TGV0dGVyID09PSBjb3JyZWN0Q2hhcikge1xuICAgICAgICAgICAgZ3Vlc3MucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdFBhcnQpLCB7IHN0YXR1czogXCJncmVlblwiIH0pKTtcbiAgICAgICAgICAgIGNvcnJlY3RMZXR0ZXJzW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNvbHV0aW9uSW5kZXggPSBjb3JyZWN0TGV0dGVycy5pbmRleE9mKGlucHV0TGV0dGVyKTtcbiAgICAgICAgICAgIGlmIChzb2x1dGlvbkluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGd1ZXNzLnB1c2goT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXN1bHRQYXJ0KSwgeyBzdGF0dXM6IFwieWVsbG93XCIgfSkpO1xuICAgICAgICAgICAgICAgIGNvcnJlY3RMZXR0ZXJzW3NvbHV0aW9uSW5kZXhdID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGd1ZXNzLnB1c2goT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXN1bHRQYXJ0KSwgeyBzdGF0dXM6IFwiZ3JleVwiIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBndWVzcztcbn1cbmV4cG9ydHMucGVyZm9ybVdvcmRsZUNvbXBhcmlzb24gPSBwZXJmb3JtV29yZGxlQ29tcGFyaXNvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5WaWV3ID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jb25zdCB2aWV3dXRpbHNfMSA9IHJlcXVpcmUoXCIuL3ZpZXd1dGlsc1wiKTtcbmNsYXNzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRpbGVHcmlkUm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjdGlsZWdyaWRcIik7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRSb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNrZXlib2FyZFwiKTtcbiAgICAgICAgdGhpcy50b29sdGlwQW5jaG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0b29sdGlwLWFuY2hvclwiKTtcbiAgICB9XG4gICAgYmluZEtleVByZXNzT25QaHlzaWNhbEtleWJvYXJkKGNhbGxiYWNrKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnJlcGVhdCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlLnRvU3RyaW5nKCkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKFwiRU5URVJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZS50b1N0cmluZygpID09PSBcIkJhY2tzcGFjZVwiKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soXCJCQUNLU1BBQ0VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZS50b1N0cmluZygpLnN0YXJ0c1dpdGgoXCJLZXlcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSBldmVudC5jb2RlXG4gICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoMylcbiAgICAgICAgICAgICAgICAgICAgLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobGV0dGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJpbmRDbGlja1ZpcnR1YWxLZXlib2FyZChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmtleWJvYXJkUm9vdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0O1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0Lm1hdGNoZXMoXCJkaXYua2V5Ym9hcmQta2V5XCIpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTFBhcmFncmFwaEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgICAoKF9hID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5tYXRjaGVzKFwiZGl2LmtleWJvYXJkLWtleVwiKSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxldHRlciA9IHRhcmdldC5pZC5zdWJzdHJpbmcoNCk7XG4gICAgICAgICAgICBjYWxsYmFjayhsZXR0ZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKG1vZGVsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyVGlsZUdyaWQobW9kZWwpO1xuICAgICAgICB0aGlzLnJlbmRlcktleWJvYXJkKG1vZGVsKTtcbiAgICB9XG4gICAgcmVuZGVyVGlsZUdyaWQobW9kZWwpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMudGlsZUdyaWRSb290LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LnJlbW92ZUNoaWxkKHRoaXMudGlsZUdyaWRSb290LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIG1vZGVsLmd1ZXNzSGlzdG9yeS5mb3JFYWNoKChndWVzcywgZ3Vlc3NJbmRleCkgPT4ge1xuICAgICAgICAgICAgZ3Vlc3MuZm9yRWFjaCgobGV0dGVyRGF0YSwgbGV0dGVySW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gKDAsIHZpZXd1dGlsc18xLmxldHRlckRhdGFUb1RpbGVFbGVtZW50KShsZXR0ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0xhc3RHdWVzcyA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxID09PSBndWVzc0luZGV4O1xuICAgICAgICAgICAgICAgIGlmIChpc0xhc3RHdWVzcykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJsYXN0LWd1ZXNzXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gXCJ0aWxlLVwiICsgZ3Vlc3NJbmRleCArIFwiLVwiICsgbGV0dGVySW5kZXg7XG4gICAgICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtb2RlbC5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWxcbiAgICAgICAgICAgIC5nZXRDdXJyZW50SW5wdXRQYWRkZWQoKVxuICAgICAgICAgICAgLnNwbGl0KFwiXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgobGV0dGVyLCBsZXR0ZXJJbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3NJbmRleCA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gKDAsIHZpZXd1dGlsc18xLmxldHRlclRvVGlsZUVsZW1lbnQpKGxldHRlcik7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjdXJyZW50LWlucHV0XCIpO1xuICAgICAgICAgICAgY29uc3QgaXNMYXN0SW5wdXQgPSBtb2RlbC5jdXJyZW50SW5wdXQubGVuZ3RoIC0gMSA9PT0gbGV0dGVySW5kZXg7XG4gICAgICAgICAgICBpZiAoaXNMYXN0SW5wdXQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJsYXN0LWlucHV0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5pZCA9IFwidGlsZS1cIiArIGd1ZXNzSW5kZXggKyBcIi1cIiArIGxldHRlckluZGV4O1xuICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBudW1FbXB0eVJvd3NUb0ZpbGwgPSA1IC0gbW9kZWwuZ3Vlc3NIaXN0b3J5Lmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgZW1wdHlSb3dJbmRleCA9IDA7IGVtcHR5Um93SW5kZXggPCBudW1FbXB0eVJvd3NUb0ZpbGw7IGVtcHR5Um93SW5kZXgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgbGV0dGVySW5kZXggPSAwOyBsZXR0ZXJJbmRleCA8IDU7IGxldHRlckluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBndWVzc0luZGV4ID0gbW9kZWwuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCArIGVtcHR5Um93SW5kZXggKyAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSAoMCwgdmlld3V0aWxzXzEubGV0dGVyVG9UaWxlRWxlbWVudCkoXCIgXCIpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSBcInRpbGUtXCIgKyBndWVzc0luZGV4ICsgXCItXCIgKyBsZXR0ZXJJbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVHcmlkUm9vdC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZW5kZXJLZXlib2FyZChtb2RlbCkge1xuICAgICAgICBjb25zdCBjcmVhdGVFbXB0eUtleWJvYXJkUm93ID0gKHJvd051bSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICByb3dFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJrZXlib2FyZC1yb3dcIik7XG4gICAgICAgICAgICByb3dFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJyb3ctXCIgKyAocm93TnVtICsgMSkpO1xuICAgICAgICAgICAgcm93RWxlbWVudC5pZCA9IFwia2V5Ym9hcmQtcm93LVwiICsgKHJvd051bSArIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHJvd0VsZW1lbnQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNyZWF0ZUtleWJvYXJkS2V5ID0gKGtleURhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAga2V5RWxlbWVudC5pZCA9IFwia2V5LVwiICsga2V5RGF0YS5mYWNlO1xuICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwia2V5Ym9hcmQta2V5XCIpO1xuICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKGtleURhdGEuc3RhdHVzKTtcbiAgICAgICAgICAgIGlmIChrZXlEYXRhLmZhY2UgPT09IFwiRU5URVJcIikge1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpZGVcIik7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZW50ZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXlEYXRhLmZhY2UgPT09IFwiQkFDS1NQQUNFXCIpIHtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ3aWRlXCIpO1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImJhY2tzcGFjZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm5vcm1hbFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgIHAuaW5uZXJIVE1MID0ga2V5RGF0YS5mYWNlID09PSBcIkJBQ0tTUEFDRVwiID8gXCI8XCIgOiBrZXlEYXRhLmZhY2U7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmFwcGVuZENoaWxkKHApO1xuICAgICAgICAgICAgcmV0dXJuIGtleUVsZW1lbnQ7XG4gICAgICAgIH07XG4gICAgICAgIHdoaWxlICh0aGlzLmtleWJvYXJkUm9vdC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmtleWJvYXJkUm9vdC5yZW1vdmVDaGlsZCh0aGlzLmtleWJvYXJkUm9vdC5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXlib2FyZExheW91dCA9ICgwLCB2aWV3dXRpbHNfMS5jcmVhdGVLZXlib2FyZExheW91dCkobW9kZWwua2V5Ym9hcmRTdGF0dXMpO1xuICAgICAgICBrZXlib2FyZExheW91dC5mb3JFYWNoKChyb3csIHJvd051bSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93RWxlbWVudCA9IGNyZWF0ZUVtcHR5S2V5Ym9hcmRSb3cocm93TnVtKTtcbiAgICAgICAgICAgIHJvdy5tYXAoY3JlYXRlS2V5Ym9hcmRLZXkpLmZvckVhY2goKGtleUVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICByb3dFbGVtZW50LmFwcGVuZENoaWxkKGtleUVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmtleWJvYXJkUm9vdC5hcHBlbmRDaGlsZChyb3dFbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNoYWtlKGR1cmF0aW9uSW5Ncykge1xuICAgICAgICBjb25zdCBpbnB1dHRlZFRpbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50aWxlLmN1cnJlbnQtaW5wdXRcIik7XG4gICAgICAgIGlucHV0dGVkVGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwic2hha2luZ1wiKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcInNoYWtpbmdcIik7XG4gICAgICAgICAgICB9LCBkdXJhdGlvbkluTXMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9wKHRpbGUsIGR1cmF0aW9uSW5Ncykge1xuICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJpbnB1dHRpbmdcIik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiaW5wdXR0aW5nXCIpO1xuICAgICAgICB9LCBkdXJhdGlvbkluTXMpO1xuICAgIH1cbiAgICBwb3BMYXN0VGlsZSgpIHtcbiAgICAgICAgY29uc3QgdGlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYudGlsZS5sYXN0LWlucHV0XCIpO1xuICAgICAgICBpZiAodGlsZSAhPT0gbnVsbCAmJiB0aWxlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMucG9wKHRpbGUsIGNvbnN0YW50c18xLklOUFVUVElOR19EVVJBVElPTik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmxpcEN1cnJlbnRJbnB1dEFuZEFwcGx5Q29sb3JzKGd1ZXNzKSB7XG4gICAgICAgIGNvbnN0IHRpbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50aWxlLmN1cnJlbnQtaW5wdXRcIik7XG4gICAgICAgIGd1ZXNzLmZvckVhY2goKGxldHRlckRhdGEsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aWxlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJmbGlwcGluZy1kb3duXCIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlwcGluZy1kb3duXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJpbnB1dHRpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChsZXR0ZXJEYXRhLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImZsaXBwaW5nLXVwXCIpO1xuICAgICAgICAgICAgICAgIH0sIGNvbnN0YW50c18xLkZMSVBQSU5HX0RVUkFUSU9OKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpcHBpbmctdXBcIik7XG4gICAgICAgICAgICAgICAgfSwgY29uc3RhbnRzXzEuRkxJUFBJTkdfRFVSQVRJT04gKiAyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGVmZmVjdCwgY29uc3RhbnRzXzEuRkxJUFBJTkdfSU5URVJWQUwgKiBpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJvdW5jZUxhc3RHdWVzcygpIHtcbiAgICAgICAgY29uc3QgdGlsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2LnRpbGUubGFzdC1ndWVzc1wiKTtcbiAgICAgICAgdGlsZXMuZm9yRWFjaCgodGlsZSwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWZmZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImJvdW5jaW5nXCIpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJib3VuY2luZ1wiKTtcbiAgICAgICAgICAgICAgICB9LCBjb25zdGFudHNfMS5CT1VOQ0VfRFVSQVRJT04pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZWZmZWN0LCBjb25zdGFudHNfMS5CT1VOQ0VfSU5URVJWQUwgKiBpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNob3dUb29sdGlwKG1lc3NhZ2UpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50b29sdGlwXCIpLmZvckVhY2goKHRvb2x0aXApID0+IHtcbiAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB0b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKFwidG9vbHRpcFwiKTtcbiAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKFwiZmFkZS1pblwiKTtcbiAgICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICBwLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICAgICAgdG9vbHRpcC5hcHBlbmRDaGlsZChwKTtcbiAgICAgICAgdGhpcy50b29sdGlwQW5jaG9yLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LnJlbW92ZShcImZhZGUtaW5cIik7XG4gICAgICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5hZGQoXCJmYWRlLW91dFwiKTtcbiAgICAgICAgfSwgY29uc3RhbnRzXzEuVE9PTFRJUF9GQURFX0RVUkFUSU9OICsgY29uc3RhbnRzXzEuVE9PTFRJUF9TSE9XX0RVUkFUSU9OKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudG9vbHRpcEFuY2hvci5yZW1vdmVDaGlsZCh0b29sdGlwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cbiAgICAgICAgfSwgY29uc3RhbnRzXzEuVE9PTFRJUF9GQURFX0RVUkFUSU9OICogMiArIGNvbnN0YW50c18xLlRPT0xUSVBfU0hPV19EVVJBVElPTik7XG4gICAgfVxufVxuZXhwb3J0cy5WaWV3ID0gVmlldztcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jcmVhdGVLZXlib2FyZExheW91dCA9IGV4cG9ydHMubGV0dGVyRGF0YVRvVGlsZUVsZW1lbnQgPSBleHBvcnRzLmxldHRlclRvVGlsZUVsZW1lbnQgPSB2b2lkIDA7XG5jb25zdCBLRVlCT0FSRF9MQVlPVVRfVEVNUExBVEUgPSBbXG4gICAgXCJRV0VSVFlVSU9QXCIuc3BsaXQoXCJcIiksXG4gICAgXCJBU0RGR0hKS0xcIi5zcGxpdChcIlwiKSxcbiAgICBbXCJFTlRFUlwiLCAuLi5cIlpYQ1ZCTk1cIi5zcGxpdChcIlwiKSwgXCJCQUNLU1BBQ0VcIl0sXG5dO1xuZnVuY3Rpb24gbGV0dGVyVG9UaWxlRWxlbWVudChsZXR0ZXIpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwidGlsZVwiKTtcbiAgICBpZiAobGV0dGVyICE9PSBcIiBcIikge1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImlucHV0dGVkXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICB9XG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHAuaW5uZXJIVE1MID0gbGV0dGVyO1xuICAgIGRpdi5hcHBlbmRDaGlsZChwKTtcbiAgICByZXR1cm4gZGl2O1xufVxuZXhwb3J0cy5sZXR0ZXJUb1RpbGVFbGVtZW50ID0gbGV0dGVyVG9UaWxlRWxlbWVudDtcbmZ1bmN0aW9uIGxldHRlckRhdGFUb1RpbGVFbGVtZW50KGxldHRlckRhdGEpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwidGlsZVwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChsZXR0ZXJEYXRhLnN0YXR1cyk7XG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHAuaW5uZXJIVE1MID0gbGV0dGVyRGF0YS5sZXR0ZXI7XG4gICAgZGl2LmFwcGVuZENoaWxkKHApO1xuICAgIHJldHVybiBkaXY7XG59XG5leHBvcnRzLmxldHRlckRhdGFUb1RpbGVFbGVtZW50ID0gbGV0dGVyRGF0YVRvVGlsZUVsZW1lbnQ7XG5mdW5jdGlvbiBjcmVhdGVLZXlib2FyZExheW91dChrZXlib2FyZFN0YXR1cykge1xuICAgIHJldHVybiBLRVlCT0FSRF9MQVlPVVRfVEVNUExBVEUubWFwKChyb3cpID0+IHJvdy5tYXAoKGxldHRlcikgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmYWNlOiBsZXR0ZXIsXG4gICAgICAgICAgICBzdGF0dXM6IChfYSA9IGtleWJvYXJkU3RhdHVzLmdldChsZXR0ZXIpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcInVudXNlZFwiLFxuICAgICAgICB9O1xuICAgIH0pKTtcbn1cbmV4cG9ydHMuY3JlYXRlS2V5Ym9hcmRMYXlvdXQgPSBjcmVhdGVLZXlib2FyZExheW91dDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG1vZGVsXzEgPSByZXF1aXJlKFwiLi9tb2RlbFwiKTtcbmNvbnN0IGNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoXCIuL2NvbnRyb2xsZXJcIik7XG5jb25zdCB2aWV3XzEgPSByZXF1aXJlKFwiLi92aWV3XCIpO1xuY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbmxldCB3b3JkID0gc2VhcmNoUGFyYW1zLmdldChcIndvcmRcIik7XG5pZiAod29yZCA9PT0gbnVsbCkge1xuICAgIHdvcmQgPSBcIkhFTExPXCI7XG59XG53b3JkID0gd29yZC50b1VwcGVyQ2FzZSgpO1xuY29uc3QgbW9kZWwgPSBuZXcgbW9kZWxfMS5Nb2RlbCh3b3JkKTtcbmNvbnN0IHZpZXcgPSBuZXcgdmlld18xLlZpZXcoKTtcbmNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgY29udHJvbGxlcl8xLkNvbnRyb2xsZXIobW9kZWwsIHZpZXcpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9