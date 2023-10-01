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
function getWord() {
    const searchParams = new URLSearchParams(window.location.search);
    let word = searchParams.get("word");
    if (word === null) {
        word = "HELLO";
    }
    return word.toUpperCase();
}
const model = new model_1.Model(getWord());
const view = new view_1.View();
const controller = new controller_1.Controller(model, view);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esb0NBQW9DLG9DQUFvQztBQUN4RSxzQ0FBc0MsaUJBQWlCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsWUFBWTs7Ozs7Ozs7Ozs7QUNwTkM7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNEJBQTRCLEdBQUcsK0JBQStCLEdBQUcsMkJBQTJCO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDRCQUE0Qjs7Ozs7OztVQzFDNUI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7OztBQ3RCYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxnQkFBZ0IsbUJBQU8sQ0FBQywrQkFBUztBQUNqQyxxQkFBcUIsbUJBQU8sQ0FBQyx5Q0FBYztBQUMzQyxlQUFlLG1CQUFPLENBQUMsNkJBQVE7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL2NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL21vZGVsLnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9tb2RlbHV0aWxzLnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy92aWV3LnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy92aWV3dXRpbHMudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BTFJFQURZX0dVRVNTRURfTUVTU0FHRSA9IGV4cG9ydHMuQ0xPU0VfQ0FMTF9NRVNTQUdFID0gZXhwb3J0cy5XSU5fTUVTU0FHRVMgPSBleHBvcnRzLk5PVF9FTk9VR0hfTEVUVEVSU19NRVNTQUdFID0gZXhwb3J0cy5VTktOT1dOX1dPUkRfTUVTU0FHRSA9IGV4cG9ydHMuVE9PTFRJUF9TSE9XX0RVUkFUSU9OID0gZXhwb3J0cy5UT09MVElQX0ZBREVfRFVSQVRJT04gPSBleHBvcnRzLkJPVU5DRV9JTlRFUlZBTCA9IGV4cG9ydHMuQk9VTkNFX0RVUkFUSU9OID0gZXhwb3J0cy5GTElQUElOR19JTlRFUlZBTCA9IGV4cG9ydHMuRkxJUFBJTkdfRFVSQVRJT04gPSBleHBvcnRzLklOUFVUVElOR19EVVJBVElPTiA9IGV4cG9ydHMuU0hBS0VfRFVSQVRJT04gPSB2b2lkIDA7XG5leHBvcnRzLlNIQUtFX0RVUkFUSU9OID0gNjAwO1xuZXhwb3J0cy5JTlBVVFRJTkdfRFVSQVRJT04gPSAxMDA7XG5leHBvcnRzLkZMSVBQSU5HX0RVUkFUSU9OID0gMjAwO1xuZXhwb3J0cy5GTElQUElOR19JTlRFUlZBTCA9IDI1MDtcbmV4cG9ydHMuQk9VTkNFX0RVUkFUSU9OID0gODAwO1xuZXhwb3J0cy5CT1VOQ0VfSU5URVJWQUwgPSAyNTA7XG5leHBvcnRzLlRPT0xUSVBfRkFERV9EVVJBVElPTiA9IDUwMDtcbmV4cG9ydHMuVE9PTFRJUF9TSE9XX0RVUkFUSU9OID0gMTUwMDtcbmV4cG9ydHMuVU5LTk9XTl9XT1JEX01FU1NBR0UgPSBcIk5vdCBpbiB3b3JkIGxpc3RcIjtcbmV4cG9ydHMuTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UgPSBcIk5vdCBlbm91Z2ggbGV0dGVyc1wiO1xuZXhwb3J0cy5XSU5fTUVTU0FHRVMgPSBbXG4gICAgXCJHZW5pdXNcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIlBoZXdcIixcbl07XG5leHBvcnRzLkNMT1NFX0NBTExfTUVTU0FHRSA9IFwiUGhld1wiO1xuZXhwb3J0cy5BTFJFQURZX0dVRVNTRURfTUVTU0FHRSA9IFwiQWxyZWFkeSBndWVzc2VkXCI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IobW9kZWwsIHZpZXcpIHtcbiAgICAgICAgdGhpcy5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkID0gKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpZXcucmVuZGVyKG1vZGVsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlwcmVzcyA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNHYW1lT3ZlcigpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gXCJFTlRFUlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWJtaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxldHRlciA9PT0gXCJCQUNLU1BBQ0VcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRGVsZXRlTGV0dGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFkZExldHRlcihsZXR0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUFkZExldHRlciA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dElzRnVsbCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmhhc1dvbigpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRMZXR0ZXIobGV0dGVyKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5wb3BMYXN0VGlsZSgpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZURlbGV0ZUxldHRlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dElzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVsZXRlTGV0dGVyKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlU3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1vZGVsLm1heUN1cnJlbnRJbnB1dEJlQWNjZXB0ZWQoKSAmJiAhdGhpcy5tb2RlbC5oYXNXb24oKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaGFrZShjb25zdGFudHNfMS5TSEFLRV9EVVJBVElPTik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrKGNvbnN0YW50c18xLlNIQUtFX0RVUkFUSU9OKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW9kZWwuY3VycmVudElucHV0SXNLbm93bigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5VTktOT1dOX1dPUkRfTUVTU0FHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dE5vdEZ1bGwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoY29uc3RhbnRzXzEuTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50SW5wdXRIYXNBbHJlYWR5QmVlbkd1ZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoY29uc3RhbnRzXzEuQUxSRUFEWV9HVUVTU0VEX01FU1NBR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZpZXcuZmxpcEN1cnJlbnRJbnB1dEFuZEFwcGx5Q29sb3JzKHRoaXMubW9kZWwuZ2V0Q3VycmVudElucHV0QXNHdWVzcygpKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuYWNjZXB0Q3VycmVudElucHV0KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaGFzV29uKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LmJvdW5jZUxhc3RHdWVzcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoY29uc3RhbnRzXzEuV0lOX01FU1NBR0VTW3RoaXMubW9kZWwuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaGFzTG9zdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcCh0aGlzLm1vZGVsLmNvcnJlY3RXb3JkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBjb25zdGFudHNfMS5GTElQUElOR19JTlRFUlZBTCAqIDQgKyBjb25zdGFudHNfMS5GTElQUElOR19EVVJBVElPTiAqIDIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIHRoaXMubW9kZWwuYmluZE1vZGVsQ2hhbmdlZCh0aGlzLm9uTW9kZWxDaGFuZ2VkKTtcbiAgICAgICAgdGhpcy52aWV3ID0gdmlldztcbiAgICAgICAgdGhpcy52aWV3LmJpbmRDbGlja1ZpcnR1YWxLZXlib2FyZCh0aGlzLmhhbmRsZUtleXByZXNzKTtcbiAgICAgICAgdGhpcy52aWV3LmJpbmRLZXlQcmVzc09uUGh5c2ljYWxLZXlib2FyZCh0aGlzLmhhbmRsZUtleXByZXNzKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzLm1vZGVsKTtcbiAgICB9XG4gICAgbG9jayhkdXJhdGlvbkluTXMpIHtcbiAgICAgICAgdGhpcy5pc0xvY2tlZCA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICB9LCBkdXJhdGlvbkluTXMpO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29udHJvbGxlciA9IENvbnRyb2xsZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Nb2RlbCA9IHZvaWQgMDtcbmNvbnN0IG1vZGVsdXRpbHNfMSA9IHJlcXVpcmUoXCIuL21vZGVsdXRpbHNcIik7XG5jbGFzcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IoY29ycmVjdFdvcmQsIGxlZ2FsV29yZHMpIHtcbiAgICAgICAgdGhpcy5jb3JyZWN0V29yZCA9IGNvcnJlY3RXb3JkO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCA9IFwiXCI7XG4gICAgICAgIHRoaXMubGVnYWxXb3JkcyA9IFtdO1xuICAgICAgICBpZiAobGVnYWxXb3JkcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRMZWdhbFdvcmRzRm9yU2VsZigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sZWdhbFdvcmRzID0gbGVnYWxXb3JkcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmd1ZXNzSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmtleWJvYXJkU3RhdHVzID0gKDAsIG1vZGVsdXRpbHNfMS5jcmVhdGVLZXlib2FyZFN0YXR1cykoKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCA9ICgpID0+IHsgfTtcbiAgICB9XG4gICAgYmluZE1vZGVsQ2hhbmdlZChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dEhhc0FscmVhZHlCZWVuR3Vlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFzdEd1ZXNzZXNBc1N0cmluZ3MoKS5pbmNsdWRlcyh0aGlzLmN1cnJlbnRJbnB1dCk7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dEhhc05vdFlldEJlZW5HdWVzc2VkKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuY3VycmVudElucHV0SGFzQWxyZWFkeUJlZW5HdWVzc2VkKCk7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dElzS25vd24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlZ2FsV29yZHMuaW5jbHVkZXModGhpcy5jdXJyZW50SW5wdXQpO1xuICAgIH1cbiAgICBtYXlDdXJyZW50SW5wdXRCZUFjY2VwdGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudElucHV0SXNGdWxsKCkgJiZcbiAgICAgICAgICAgIHRoaXMuY3VycmVudElucHV0SXNLbm93bigpICYmXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dEhhc05vdFlldEJlZW5HdWVzc2VkKCkpO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXROb3RGdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoIDwgNTtcbiAgICB9XG4gICAgY3VycmVudElucHV0SXNGdWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoID49IDU7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dE5vdEVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgY3VycmVudElucHV0SXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggPj0gNjtcbiAgICB9XG4gICAgaGFzTm90UmVhY2hlZEd1ZXNzTGltaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggPCA2O1xuICAgIH1cbiAgICBoYXNXb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RHdWVzc01hdGNoZXNDb3JyZWN0V29yZCgpO1xuICAgIH1cbiAgICBsYXN0R3Vlc3NNYXRjaGVzQ29ycmVjdFdvcmQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdldExhc3RHdWVzc0FzU3RyaW5nKCkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvcnJlY3RXb3JkID09PSB0aGlzLmdldExhc3RHdWVzc0FzU3RyaW5nKCk7XG4gICAgfVxuICAgIGhhc0xvc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1JlYWNoZWRHdWVzc0xpbWl0KCkgJiYgIXRoaXMubGFzdEd1ZXNzTWF0Y2hlc0NvcnJlY3RXb3JkKCk7XG4gICAgfVxuICAgIGlzR2FtZU92ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1dvbigpIHx8IHRoaXMuaGFzTG9zdCgpO1xuICAgIH1cbiAgICBnZXRDdXJyZW50SW5wdXRBc0d1ZXNzKCkge1xuICAgICAgICByZXR1cm4gKDAsIG1vZGVsdXRpbHNfMS5wZXJmb3JtV29yZGxlQ29tcGFyaXNvbikodGhpcy5jdXJyZW50SW5wdXQsIHRoaXMuY29ycmVjdFdvcmQpO1xuICAgIH1cbiAgICBnZXRDdXJyZW50SW5wdXRQYWRkZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5wYWRFbmQoNSwgXCIgXCIpO1xuICAgIH1cbiAgICBnZXRMYXN0R3Vlc3NBc1N0cmluZygpIHtcbiAgICAgICAgaWYgKHRoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnlbdGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgIC5tYXAoKHgpID0+IHgubGV0dGVyKVxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIGdldFBhc3RHdWVzc2VzQXNTdHJpbmdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnkubWFwKChndWVzcykgPT4gZ3Vlc3MubWFwKChsZXR0ZXIpID0+IGxldHRlci5sZXR0ZXIpLmpvaW4oXCJcIikpO1xuICAgIH1cbiAgICBhY2NlcHRDdXJyZW50SW5wdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5tYXlDdXJyZW50SW5wdXRCZUFjY2VwdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBndWVzcyA9IHRoaXMuZ2V0Q3VycmVudElucHV0QXNHdWVzcygpO1xuICAgICAgICB0aGlzLmd1ZXNzSGlzdG9yeS5wdXNoKGd1ZXNzKTtcbiAgICAgICAgdGhpcy5jbGVhcklucHV0KCk7XG4gICAgICAgIHRoaXMudXBkYXRlS2V5Ym9hcmRTdGF0ZVdpdGhMYXN0R3Vlc3MoKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgY2xlYXJJbnB1dCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgPSBcIlwiO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICB1cGRhdGVLZXlib2FyZFN0YXRlV2l0aExhc3RHdWVzcygpIHtcbiAgICAgICAgY29uc3QgZ3Vlc3MgPSB0aGlzLmd1ZXNzSGlzdG9yeVt0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgICAgZ3Vlc3MuZm9yRWFjaCgobGV0dGVyRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFzdFN0YXR1cyA9IHRoaXMua2V5Ym9hcmRTdGF0dXMuZ2V0KGxldHRlckRhdGEubGV0dGVyKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IGxldHRlckRhdGEuc3RhdHVzO1xuICAgICAgICAgICAgY29uc3QgYmV0dGVyID0gKDAsIG1vZGVsdXRpbHNfMS5jaG9vc2VCZXR0ZXJMZXR0ZXJTdGF0dXMpKHBhc3RTdGF0dXMsIG5ld1N0YXR1cyk7XG4gICAgICAgICAgICB0aGlzLmtleWJvYXJkU3RhdHVzLnNldChsZXR0ZXJEYXRhLmxldHRlciwgYmV0dGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIGRlbGV0ZUxldHRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRJbnB1dE5vdEVtcHR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dCA9IHRoaXMuY3VycmVudElucHV0LnNsaWNlKDAsIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBhZGRMZXR0ZXIobGV0dGVyKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50SW5wdXROb3RGdWxsKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgKz0gbGV0dGVyO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBsb2FkTGVnYWxXb3Jkc0ZvclNlbGYoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0aGlzLmxlZ2FsV29yZHMgPSB5aWVsZCAoMCwgbW9kZWx1dGlsc18xLmxvYWRMZWdhbFdvcmRzQXN5bmMpKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuTW9kZWwgPSBNb2RlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnBlcmZvcm1Xb3JkbGVDb21wYXJpc29uID0gZXhwb3J0cy5jcmVhdGVLZXlib2FyZFN0YXR1cyA9IGV4cG9ydHMubG9hZExlZ2FsV29yZHNBc3luYyA9IGV4cG9ydHMuY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzID0gdm9pZCAwO1xuZnVuY3Rpb24gY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzKGEsIGIpIHtcbiAgICBjb25zdCBpbmRleE1hcCA9IFtcImdyZWVuXCIsIFwieWVsbG93XCIsIFwiZ3JleVwiLCBcInVudXNlZFwiXTtcbiAgICBjb25zdCBhSW5kZXggPSBpbmRleE1hcC5pbmRleE9mKGEpO1xuICAgIGNvbnN0IGJJbmRleCA9IGluZGV4TWFwLmluZGV4T2YoYik7XG4gICAgaWYgKGFJbmRleCA8IGJJbmRleCkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgcmV0dXJuIGI7XG59XG5leHBvcnRzLmNob29zZUJldHRlckxldHRlclN0YXR1cyA9IGNob29zZUJldHRlckxldHRlclN0YXR1cztcbmZ1bmN0aW9uIGxvYWRMZWdhbFdvcmRzQXN5bmMoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaChcIi4vdmFsaWQtd29yZGxlLXdvcmRzLnR4dFwiKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IHJlYWQgbGVnYWwgd29yZHMgZmlsZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh5aWVsZCByZXNwb25zZS50ZXh0KCkpLnNwbGl0KFwiXFxuXCIpLm1hcCgoeCkgPT4geC50b1VwcGVyQ2FzZSgpKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMubG9hZExlZ2FsV29yZHNBc3luYyA9IGxvYWRMZWdhbFdvcmRzQXN5bmM7XG5mdW5jdGlvbiBjcmVhdGVLZXlib2FyZFN0YXR1cygpIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBsZXR0ZXIgb2YgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiKSB7XG4gICAgICAgIG1hcC5zZXQobGV0dGVyLCBcInVudXNlZFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbmV4cG9ydHMuY3JlYXRlS2V5Ym9hcmRTdGF0dXMgPSBjcmVhdGVLZXlib2FyZFN0YXR1cztcbmZ1bmN0aW9uIHBlcmZvcm1Xb3JkbGVDb21wYXJpc29uKGlucHV0V29yZCwgY29ycmVjdFdvcmQpIHtcbiAgICBjb25zdCBndWVzcyA9IFtdO1xuICAgIGNvbnN0IGlucHV0TGV0dGVycyA9IGlucHV0V29yZC5zcGxpdChcIlwiKTtcbiAgICBjb25zdCBjb3JyZWN0TGV0dGVycyA9IGNvcnJlY3RXb3JkLnNwbGl0KFwiXCIpO1xuICAgIGlucHV0TGV0dGVycy5mb3JFYWNoKChpbnB1dExldHRlciwgaSkgPT4ge1xuICAgICAgICBjb25zdCBjb3JyZWN0Q2hhciA9IGNvcnJlY3RXb3JkW2ldO1xuICAgICAgICBjb25zdCByZXN1bHRQYXJ0ID0geyBsZXR0ZXI6IGlucHV0TGV0dGVyIH07XG4gICAgICAgIGlmIChpbnB1dExldHRlciA9PT0gY29ycmVjdENoYXIpIHtcbiAgICAgICAgICAgIGd1ZXNzLnB1c2goT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXN1bHRQYXJ0KSwgeyBzdGF0dXM6IFwiZ3JlZW5cIiB9KSk7XG4gICAgICAgICAgICBjb3JyZWN0TGV0dGVyc1tpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzb2x1dGlvbkluZGV4ID0gY29ycmVjdExldHRlcnMuaW5kZXhPZihpbnB1dExldHRlcik7XG4gICAgICAgICAgICBpZiAoc29sdXRpb25JbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBndWVzcy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0UGFydCksIHsgc3RhdHVzOiBcInllbGxvd1wiIH0pKTtcbiAgICAgICAgICAgICAgICBjb3JyZWN0TGV0dGVyc1tzb2x1dGlvbkluZGV4XSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBndWVzcy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0UGFydCksIHsgc3RhdHVzOiBcImdyZXlcIiB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZ3Vlc3M7XG59XG5leHBvcnRzLnBlcmZvcm1Xb3JkbGVDb21wYXJpc29uID0gcGVyZm9ybVdvcmRsZUNvbXBhcmlzb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVmlldyA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY29uc3Qgdmlld3V0aWxzXzEgPSByZXF1aXJlKFwiLi92aWV3dXRpbHNcIik7XG5jbGFzcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3RpbGVncmlkXCIpO1xuICAgICAgICB0aGlzLmtleWJvYXJkUm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYja2V5Ym9hcmRcIik7XG4gICAgICAgIHRoaXMudG9vbHRpcEFuY2hvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjdG9vbHRpcC1hbmNob3JcIik7XG4gICAgfVxuICAgIGJpbmRLZXlQcmVzc09uUGh5c2ljYWxLZXlib2FyZChjYWxsYmFjaykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5yZXBlYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZS50b1N0cmluZygpID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhcIkVOVEVSXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUudG9TdHJpbmcoKSA9PT0gXCJCYWNrc3BhY2VcIikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKFwiQkFDS1NQQUNFXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUudG9TdHJpbmcoKS5zdGFydHNXaXRoKFwiS2V5XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gZXZlbnQuY29kZVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAuc3Vic3RyaW5nKDMpXG4gICAgICAgICAgICAgICAgICAgIC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGxldHRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBiaW5kQ2xpY2tWaXJ0dWFsS2V5Ym9hcmQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5rZXlib2FyZFJvb3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgbGV0IHRhcmdldDtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5tYXRjaGVzKFwiZGl2LmtleWJvYXJkLWtleVwiKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxQYXJhZ3JhcGhFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgKChfYSA9IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubWF0Y2hlcyhcImRpdi5rZXlib2FyZC1rZXlcIikpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0YXJnZXQuaWQuc3Vic3RyaW5nKDQpO1xuICAgICAgICAgICAgY2FsbGJhY2sobGV0dGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlcihtb2RlbCkge1xuICAgICAgICB0aGlzLnJlbmRlclRpbGVHcmlkKG1vZGVsKTtcbiAgICAgICAgdGhpcy5yZW5kZXJLZXlib2FyZChtb2RlbCk7XG4gICAgfVxuICAgIHJlbmRlclRpbGVHcmlkKG1vZGVsKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnRpbGVHcmlkUm9vdC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLnRpbGVHcmlkUm9vdC5yZW1vdmVDaGlsZCh0aGlzLnRpbGVHcmlkUm9vdC5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBtb2RlbC5ndWVzc0hpc3RvcnkuZm9yRWFjaCgoZ3Vlc3MsIGd1ZXNzSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGd1ZXNzLmZvckVhY2goKGxldHRlckRhdGEsIGxldHRlckluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9ICgwLCB2aWV3dXRpbHNfMS5sZXR0ZXJEYXRhVG9UaWxlRWxlbWVudCkobGV0dGVyRGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNMYXN0R3Vlc3MgPSBtb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMSA9PT0gZ3Vlc3NJbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoaXNMYXN0R3Vlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibGFzdC1ndWVzc1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9IFwidGlsZS1cIiArIGd1ZXNzSW5kZXggKyBcIi1cIiArIGxldHRlckluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAobW9kZWwuaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG1vZGVsXG4gICAgICAgICAgICAuZ2V0Q3VycmVudElucHV0UGFkZGVkKClcbiAgICAgICAgICAgIC5zcGxpdChcIlwiKVxuICAgICAgICAgICAgLmZvckVhY2goKGxldHRlciwgbGV0dGVySW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGd1ZXNzSW5kZXggPSBtb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9ICgwLCB2aWV3dXRpbHNfMS5sZXR0ZXJUb1RpbGVFbGVtZW50KShsZXR0ZXIpO1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY3VycmVudC1pbnB1dFwiKTtcbiAgICAgICAgICAgIGNvbnN0IGlzTGFzdElucHV0ID0gbW9kZWwuY3VycmVudElucHV0Lmxlbmd0aCAtIDEgPT09IGxldHRlckluZGV4O1xuICAgICAgICAgICAgaWYgKGlzTGFzdElucHV0KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibGFzdC1pbnB1dFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQuaWQgPSBcInRpbGUtXCIgKyBndWVzc0luZGV4ICsgXCItXCIgKyBsZXR0ZXJJbmRleDtcbiAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbnVtRW1wdHlSb3dzVG9GaWxsID0gNSAtIG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGVtcHR5Um93SW5kZXggPSAwOyBlbXB0eVJvd0luZGV4IDwgbnVtRW1wdHlSb3dzVG9GaWxsOyBlbXB0eVJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGxldHRlckluZGV4ID0gMDsgbGV0dGVySW5kZXggPCA1OyBsZXR0ZXJJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3Vlc3NJbmRleCA9IG1vZGVsLmd1ZXNzSGlzdG9yeS5sZW5ndGggKyBlbXB0eVJvd0luZGV4ICsgMTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gKDAsIHZpZXd1dGlsc18xLmxldHRlclRvVGlsZUVsZW1lbnQpKFwiIFwiKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gXCJ0aWxlLVwiICsgZ3Vlc3NJbmRleCArIFwiLVwiICsgbGV0dGVySW5kZXg7XG4gICAgICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVuZGVyS2V5Ym9hcmQobW9kZWwpIHtcbiAgICAgICAgY29uc3QgY3JlYXRlRW1wdHlLZXlib2FyZFJvdyA9IChyb3dOdW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgcm93RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwia2V5Ym9hcmQtcm93XCIpO1xuICAgICAgICAgICAgcm93RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicm93LVwiICsgKHJvd051bSArIDEpKTtcbiAgICAgICAgICAgIHJvd0VsZW1lbnQuaWQgPSBcImtleWJvYXJkLXJvdy1cIiArIChyb3dOdW0gKyAxKTtcbiAgICAgICAgICAgIHJldHVybiByb3dFbGVtZW50O1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjcmVhdGVLZXlib2FyZEtleSA9IChrZXlEYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGtleUVsZW1lbnQuaWQgPSBcImtleS1cIiArIGtleURhdGEuZmFjZTtcbiAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImtleWJvYXJkLWtleVwiKTtcbiAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChrZXlEYXRhLnN0YXR1cyk7XG4gICAgICAgICAgICBpZiAoa2V5RGF0YS5mYWNlID09PSBcIkVOVEVSXCIpIHtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ3aWRlXCIpO1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImVudGVyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5RGF0YS5mYWNlID09PSBcIkJBQ0tTUEFDRVwiKSB7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2lkZVwiKTtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJiYWNrc3BhY2VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJub3JtYWxcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICBwLmlubmVySFRNTCA9IGtleURhdGEuZmFjZSA9PT0gXCJCQUNLU1BBQ0VcIiA/IFwiPFwiIDoga2V5RGF0YS5mYWNlO1xuICAgICAgICAgICAga2V5RWxlbWVudC5hcHBlbmRDaGlsZChwKTtcbiAgICAgICAgICAgIHJldHVybiBrZXlFbGVtZW50O1xuICAgICAgICB9O1xuICAgICAgICB3aGlsZSAodGhpcy5rZXlib2FyZFJvb3QuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy5rZXlib2FyZFJvb3QucmVtb3ZlQ2hpbGQodGhpcy5rZXlib2FyZFJvb3QuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5Ym9hcmRMYXlvdXQgPSAoMCwgdmlld3V0aWxzXzEuY3JlYXRlS2V5Ym9hcmRMYXlvdXQpKG1vZGVsLmtleWJvYXJkU3RhdHVzKTtcbiAgICAgICAga2V5Ym9hcmRMYXlvdXQuZm9yRWFjaCgocm93LCByb3dOdW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0VsZW1lbnQgPSBjcmVhdGVFbXB0eUtleWJvYXJkUm93KHJvd051bSk7XG4gICAgICAgICAgICByb3cubWFwKGNyZWF0ZUtleWJvYXJkS2V5KS5mb3JFYWNoKChrZXlFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcm93RWxlbWVudC5hcHBlbmRDaGlsZChrZXlFbGVtZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5rZXlib2FyZFJvb3QuYXBwZW5kQ2hpbGQocm93RWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaGFrZShkdXJhdGlvbkluTXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXR0ZWRUaWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYudGlsZS5jdXJyZW50LWlucHV0XCIpO1xuICAgICAgICBpbnB1dHRlZFRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcInNoYWtpbmdcIik7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzaGFraW5nXCIpO1xuICAgICAgICAgICAgfSwgZHVyYXRpb25Jbk1zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBvcCh0aWxlLCBkdXJhdGlvbkluTXMpIHtcbiAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwiaW5wdXR0aW5nXCIpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcImlucHV0dGluZ1wiKTtcbiAgICAgICAgfSwgZHVyYXRpb25Jbk1zKTtcbiAgICB9XG4gICAgcG9wTGFzdFRpbGUoKSB7XG4gICAgICAgIGNvbnN0IHRpbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2LnRpbGUubGFzdC1pbnB1dFwiKTtcbiAgICAgICAgaWYgKHRpbGUgIT09IG51bGwgJiYgdGlsZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBvcCh0aWxlLCBjb25zdGFudHNfMS5JTlBVVFRJTkdfRFVSQVRJT04pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZsaXBDdXJyZW50SW5wdXRBbmRBcHBseUNvbG9ycyhndWVzcykge1xuICAgICAgICBjb25zdCB0aWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYudGlsZS5jdXJyZW50LWlucHV0XCIpO1xuICAgICAgICBndWVzcy5mb3JFYWNoKChsZXR0ZXJEYXRhLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aWxlID0gdGlsZXNbaV07XG4gICAgICAgICAgICBjb25zdCBlZmZlY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwiZmxpcHBpbmctZG93blwiKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpcHBpbmctZG93blwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiaW5wdXR0aW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQobGV0dGVyRGF0YS5zdGF0dXMpO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJmbGlwcGluZy11cFwiKTtcbiAgICAgICAgICAgICAgICB9LCBjb25zdGFudHNfMS5GTElQUElOR19EVVJBVElPTik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcImZsaXBwaW5nLXVwXCIpO1xuICAgICAgICAgICAgICAgIH0sIGNvbnN0YW50c18xLkZMSVBQSU5HX0RVUkFUSU9OICogMik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0VGltZW91dChlZmZlY3QsIGNvbnN0YW50c18xLkZMSVBQSU5HX0lOVEVSVkFMICogaSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBib3VuY2VMYXN0R3Vlc3MoKSB7XG4gICAgICAgIGNvbnN0IHRpbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi50aWxlLmxhc3QtZ3Vlc3NcIik7XG4gICAgICAgIHRpbGVzLmZvckVhY2goKHRpbGUsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJib3VuY2luZ1wiKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwiYm91bmNpbmdcIik7XG4gICAgICAgICAgICAgICAgfSwgY29uc3RhbnRzXzEuQk9VTkNFX0RVUkFUSU9OKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGVmZmVjdCwgY29uc3RhbnRzXzEuQk9VTkNFX0lOVEVSVkFMICogaSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaG93VG9vbHRpcChtZXNzYWdlKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYudG9vbHRpcFwiKS5mb3JFYWNoKCh0b29sdGlwKSA9PiB7XG4gICAgICAgICAgICB0b29sdGlwLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChcInRvb2x0aXBcIik7XG4gICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChcImZhZGUtaW5cIik7XG4gICAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgcC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICAgIHRvb2x0aXAuYXBwZW5kQ2hpbGQocCk7XG4gICAgICAgIHRoaXMudG9vbHRpcEFuY2hvci5hcHBlbmRDaGlsZCh0b29sdGlwKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5yZW1vdmUoXCJmYWRlLWluXCIpO1xuICAgICAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKFwiZmFkZS1vdXRcIik7XG4gICAgICAgIH0sIGNvbnN0YW50c18xLlRPT0xUSVBfRkFERV9EVVJBVElPTiArIGNvbnN0YW50c18xLlRPT0xUSVBfU0hPV19EVVJBVElPTik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXBBbmNob3IucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkgeyB9XG4gICAgICAgIH0sIGNvbnN0YW50c18xLlRPT0xUSVBfRkFERV9EVVJBVElPTiAqIDIgKyBjb25zdGFudHNfMS5UT09MVElQX1NIT1dfRFVSQVRJT04pO1xuICAgIH1cbn1cbmV4cG9ydHMuVmlldyA9IFZpZXc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY3JlYXRlS2V5Ym9hcmRMYXlvdXQgPSBleHBvcnRzLmxldHRlckRhdGFUb1RpbGVFbGVtZW50ID0gZXhwb3J0cy5sZXR0ZXJUb1RpbGVFbGVtZW50ID0gdm9pZCAwO1xuY29uc3QgS0VZQk9BUkRfTEFZT1VUX1RFTVBMQVRFID0gW1xuICAgIFwiUVdFUlRZVUlPUFwiLnNwbGl0KFwiXCIpLFxuICAgIFwiQVNERkdISktMXCIuc3BsaXQoXCJcIiksXG4gICAgW1wiRU5URVJcIiwgLi4uXCJaWENWQk5NXCIuc3BsaXQoXCJcIiksIFwiQkFDS1NQQUNFXCJdLFxuXTtcbmZ1bmN0aW9uIGxldHRlclRvVGlsZUVsZW1lbnQobGV0dGVyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChcInRpbGVcIik7XG4gICAgaWYgKGxldHRlciAhPT0gXCIgXCIpIHtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJpbnB1dHRlZFwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG4gICAgfVxuICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwLmlubmVySFRNTCA9IGxldHRlcjtcbiAgICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gICAgcmV0dXJuIGRpdjtcbn1cbmV4cG9ydHMubGV0dGVyVG9UaWxlRWxlbWVudCA9IGxldHRlclRvVGlsZUVsZW1lbnQ7XG5mdW5jdGlvbiBsZXR0ZXJEYXRhVG9UaWxlRWxlbWVudChsZXR0ZXJEYXRhKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChcInRpbGVcIik7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQobGV0dGVyRGF0YS5zdGF0dXMpO1xuICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwLmlubmVySFRNTCA9IGxldHRlckRhdGEubGV0dGVyO1xuICAgIGRpdi5hcHBlbmRDaGlsZChwKTtcbiAgICByZXR1cm4gZGl2O1xufVxuZXhwb3J0cy5sZXR0ZXJEYXRhVG9UaWxlRWxlbWVudCA9IGxldHRlckRhdGFUb1RpbGVFbGVtZW50O1xuZnVuY3Rpb24gY3JlYXRlS2V5Ym9hcmRMYXlvdXQoa2V5Ym9hcmRTdGF0dXMpIHtcbiAgICByZXR1cm4gS0VZQk9BUkRfTEFZT1VUX1RFTVBMQVRFLm1hcCgocm93KSA9PiByb3cubWFwKChsZXR0ZXIpID0+IHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmFjZTogbGV0dGVyLFxuICAgICAgICAgICAgc3RhdHVzOiAoX2EgPSBrZXlib2FyZFN0YXR1cy5nZXQobGV0dGVyKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogXCJ1bnVzZWRcIixcbiAgICAgICAgfTtcbiAgICB9KSk7XG59XG5leHBvcnRzLmNyZWF0ZUtleWJvYXJkTGF5b3V0ID0gY3JlYXRlS2V5Ym9hcmRMYXlvdXQ7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBtb2RlbF8xID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG5jb25zdCBjb250cm9sbGVyXzEgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyXCIpO1xuY29uc3Qgdmlld18xID0gcmVxdWlyZShcIi4vdmlld1wiKTtcbmZ1bmN0aW9uIGdldFdvcmQoKSB7XG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICBsZXQgd29yZCA9IHNlYXJjaFBhcmFtcy5nZXQoXCJ3b3JkXCIpO1xuICAgIGlmICh3b3JkID09PSBudWxsKSB7XG4gICAgICAgIHdvcmQgPSBcIkhFTExPXCI7XG4gICAgfVxuICAgIHJldHVybiB3b3JkLnRvVXBwZXJDYXNlKCk7XG59XG5jb25zdCBtb2RlbCA9IG5ldyBtb2RlbF8xLk1vZGVsKGdldFdvcmQoKSk7XG5jb25zdCB2aWV3ID0gbmV3IHZpZXdfMS5WaWV3KCk7XG5jb25zdCBjb250cm9sbGVyID0gbmV3IGNvbnRyb2xsZXJfMS5Db250cm9sbGVyKG1vZGVsLCB2aWV3KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==