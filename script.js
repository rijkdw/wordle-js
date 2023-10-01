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
            this.lock();
            this.view.flipCurrentInputAndApplyColors(this.model.getCurrentInputAsGuess());
            setTimeout(() => {
                this.model.acceptCurrentInput();
                if (this.model.hasWon()) {
                    this.view.bounceLastGuess();
                    this.view.showTooltip(constants_1.WIN_MESSAGES[this.model.guessHistory.length - 1]);
                }
                else if (this.model.hasLost()) {
                    this.view.showTooltip(this.model.correctWord);
                }
                else {
                    this.unlock();
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
        if (durationInMs !== undefined) {
            setTimeout(() => {
                this.unlock();
            }, durationInMs);
        }
    }
    unlock() {
        this.isLocked = false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esb0NBQW9DLG9DQUFvQztBQUN4RSxzQ0FBc0MsaUJBQWlCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsWUFBWTs7Ozs7Ozs7Ozs7QUNwTkM7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNEJBQTRCLEdBQUcsK0JBQStCLEdBQUcsMkJBQTJCO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDRCQUE0Qjs7Ozs7OztVQzFDNUI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7OztBQ3RCYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxnQkFBZ0IsbUJBQU8sQ0FBQywrQkFBUztBQUNqQyxxQkFBcUIsbUJBQU8sQ0FBQyx5Q0FBYztBQUMzQyxlQUFlLG1CQUFPLENBQUMsNkJBQVE7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL2NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzLy4vc3JjL21vZGVsLnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9tb2RlbHV0aWxzLnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy92aWV3LnRzIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy92aWV3dXRpbHMudHMiLCJ3ZWJwYWNrOi8vd29yZGxlLWh0bWwtY3NzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dvcmRsZS1odG1sLWNzcy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BTFJFQURZX0dVRVNTRURfTUVTU0FHRSA9IGV4cG9ydHMuQ0xPU0VfQ0FMTF9NRVNTQUdFID0gZXhwb3J0cy5XSU5fTUVTU0FHRVMgPSBleHBvcnRzLk5PVF9FTk9VR0hfTEVUVEVSU19NRVNTQUdFID0gZXhwb3J0cy5VTktOT1dOX1dPUkRfTUVTU0FHRSA9IGV4cG9ydHMuVE9PTFRJUF9TSE9XX0RVUkFUSU9OID0gZXhwb3J0cy5UT09MVElQX0ZBREVfRFVSQVRJT04gPSBleHBvcnRzLkJPVU5DRV9JTlRFUlZBTCA9IGV4cG9ydHMuQk9VTkNFX0RVUkFUSU9OID0gZXhwb3J0cy5GTElQUElOR19JTlRFUlZBTCA9IGV4cG9ydHMuRkxJUFBJTkdfRFVSQVRJT04gPSBleHBvcnRzLklOUFVUVElOR19EVVJBVElPTiA9IGV4cG9ydHMuU0hBS0VfRFVSQVRJT04gPSB2b2lkIDA7XG5leHBvcnRzLlNIQUtFX0RVUkFUSU9OID0gNjAwO1xuZXhwb3J0cy5JTlBVVFRJTkdfRFVSQVRJT04gPSAxMDA7XG5leHBvcnRzLkZMSVBQSU5HX0RVUkFUSU9OID0gMjAwO1xuZXhwb3J0cy5GTElQUElOR19JTlRFUlZBTCA9IDI1MDtcbmV4cG9ydHMuQk9VTkNFX0RVUkFUSU9OID0gODAwO1xuZXhwb3J0cy5CT1VOQ0VfSU5URVJWQUwgPSAyNTA7XG5leHBvcnRzLlRPT0xUSVBfRkFERV9EVVJBVElPTiA9IDUwMDtcbmV4cG9ydHMuVE9PTFRJUF9TSE9XX0RVUkFUSU9OID0gMTUwMDtcbmV4cG9ydHMuVU5LTk9XTl9XT1JEX01FU1NBR0UgPSBcIk5vdCBpbiB3b3JkIGxpc3RcIjtcbmV4cG9ydHMuTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UgPSBcIk5vdCBlbm91Z2ggbGV0dGVyc1wiO1xuZXhwb3J0cy5XSU5fTUVTU0FHRVMgPSBbXG4gICAgXCJHZW5pdXNcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIk5pY2VcIixcbiAgICBcIlBoZXdcIixcbl07XG5leHBvcnRzLkNMT1NFX0NBTExfTUVTU0FHRSA9IFwiUGhld1wiO1xuZXhwb3J0cy5BTFJFQURZX0dVRVNTRURfTUVTU0FHRSA9IFwiQWxyZWFkeSBndWVzc2VkXCI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IobW9kZWwsIHZpZXcpIHtcbiAgICAgICAgdGhpcy5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkID0gKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpZXcucmVuZGVyKG1vZGVsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlwcmVzcyA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gXCJFTlRFUlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWJtaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxldHRlciA9PT0gXCJCQUNLU1BBQ0VcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRGVsZXRlTGV0dGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFkZExldHRlcihsZXR0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUFkZExldHRlciA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dElzRnVsbCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmhhc1dvbigpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRMZXR0ZXIobGV0dGVyKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5wb3BMYXN0VGlsZSgpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZURlbGV0ZUxldHRlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dElzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVsZXRlTGV0dGVyKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlU3VibWl0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1vZGVsLm1heUN1cnJlbnRJbnB1dEJlQWNjZXB0ZWQoKSAmJiAhdGhpcy5tb2RlbC5oYXNXb24oKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaGFrZShjb25zdGFudHNfMS5TSEFLRV9EVVJBVElPTik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrKGNvbnN0YW50c18xLlNIQUtFX0RVUkFUSU9OKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW9kZWwuY3VycmVudElucHV0SXNLbm93bigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5VTktOT1dOX1dPUkRfTUVTU0FHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRJbnB1dE5vdEZ1bGwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoY29uc3RhbnRzXzEuTk9UX0VOT1VHSF9MRVRURVJTX01FU1NBR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50SW5wdXRIYXNBbHJlYWR5QmVlbkd1ZXNzZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAoY29uc3RhbnRzXzEuQUxSRUFEWV9HVUVTU0VEX01FU1NBR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxvY2soKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5mbGlwQ3VycmVudElucHV0QW5kQXBwbHlDb2xvcnModGhpcy5tb2RlbC5nZXRDdXJyZW50SW5wdXRBc0d1ZXNzKCkpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5hY2NlcHRDdXJyZW50SW5wdXQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNXb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuYm91bmNlTGFzdEd1ZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5zaG93VG9vbHRpcChjb25zdGFudHNfMS5XSU5fTUVTU0FHRVNbdGhpcy5tb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLm1vZGVsLmhhc0xvc3QoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXcuc2hvd1Rvb2x0aXAodGhpcy5tb2RlbC5jb3JyZWN0V29yZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVubG9jaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGNvbnN0YW50c18xLkZMSVBQSU5HX0lOVEVSVkFMICogNCArIGNvbnN0YW50c18xLkZMSVBQSU5HX0RVUkFUSU9OICogMik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICAgICAgdGhpcy5tb2RlbC5iaW5kTW9kZWxDaGFuZ2VkKHRoaXMub25Nb2RlbENoYW5nZWQpO1xuICAgICAgICB0aGlzLnZpZXcgPSB2aWV3O1xuICAgICAgICB0aGlzLnZpZXcuYmluZENsaWNrVmlydHVhbEtleWJvYXJkKHRoaXMuaGFuZGxlS2V5cHJlc3MpO1xuICAgICAgICB0aGlzLnZpZXcuYmluZEtleVByZXNzT25QaHlzaWNhbEtleWJvYXJkKHRoaXMuaGFuZGxlS2V5cHJlc3MpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMubW9kZWwpO1xuICAgIH1cbiAgICBsb2NrKGR1cmF0aW9uSW5Ncykge1xuICAgICAgICB0aGlzLmlzTG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGR1cmF0aW9uSW5NcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVubG9jaygpO1xuICAgICAgICAgICAgfSwgZHVyYXRpb25Jbk1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1bmxvY2soKSB7XG4gICAgICAgIHRoaXMuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLkNvbnRyb2xsZXIgPSBDb250cm9sbGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTW9kZWwgPSB2b2lkIDA7XG5jb25zdCBtb2RlbHV0aWxzXzEgPSByZXF1aXJlKFwiLi9tb2RlbHV0aWxzXCIpO1xuY2xhc3MgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yKGNvcnJlY3RXb3JkLCBsZWdhbFdvcmRzKSB7XG4gICAgICAgIHRoaXMuY29ycmVjdFdvcmQgPSBjb3JyZWN0V29yZDtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgPSBcIlwiO1xuICAgICAgICB0aGlzLmxlZ2FsV29yZHMgPSBbXTtcbiAgICAgICAgaWYgKGxlZ2FsV29yZHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTGVnYWxXb3Jkc0ZvclNlbGYoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubGVnYWxXb3JkcyA9IGxlZ2FsV29yZHM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ndWVzc0hpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5rZXlib2FyZFN0YXR1cyA9ICgwLCBtb2RlbHV0aWxzXzEuY3JlYXRlS2V5Ym9hcmRTdGF0dXMpKCk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQgPSAoKSA9PiB7IH07XG4gICAgfVxuICAgIGJpbmRNb2RlbENoYW5nZWQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXRIYXNBbHJlYWR5QmVlbkd1ZXNzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhc3RHdWVzc2VzQXNTdHJpbmdzKCkuaW5jbHVkZXModGhpcy5jdXJyZW50SW5wdXQpO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXRIYXNOb3RZZXRCZWVuR3Vlc3NlZCgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmN1cnJlbnRJbnB1dEhhc0FscmVhZHlCZWVuR3Vlc3NlZCgpO1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXRJc0tub3duKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sZWdhbFdvcmRzLmluY2x1ZGVzKHRoaXMuY3VycmVudElucHV0KTtcbiAgICB9XG4gICAgbWF5Q3VycmVudElucHV0QmVBY2NlcHRlZCgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmN1cnJlbnRJbnB1dElzRnVsbCgpICYmXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRJbnB1dElzS25vd24oKSAmJlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5wdXRIYXNOb3RZZXRCZWVuR3Vlc3NlZCgpKTtcbiAgICB9XG4gICAgY3VycmVudElucHV0Tm90RnVsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCA8IDU7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dElzRnVsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCA+PSA1O1xuICAgIH1cbiAgICBjdXJyZW50SW5wdXROb3RFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudElucHV0Lmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGN1cnJlbnRJbnB1dElzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbnB1dC5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGhhc1JlYWNoZWRHdWVzc0xpbWl0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoID49IDY7XG4gICAgfVxuICAgIGhhc05vdFJlYWNoZWRHdWVzc0xpbWl0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoIDwgNjtcbiAgICB9XG4gICAgaGFzV29uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0R3Vlc3NNYXRjaGVzQ29ycmVjdFdvcmQoKTtcbiAgICB9XG4gICAgbGFzdEd1ZXNzTWF0Y2hlc0NvcnJlY3RXb3JkKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRMYXN0R3Vlc3NBc1N0cmluZygpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb3JyZWN0V29yZCA9PT0gdGhpcy5nZXRMYXN0R3Vlc3NBc1N0cmluZygpO1xuICAgIH1cbiAgICBoYXNMb3N0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNSZWFjaGVkR3Vlc3NMaW1pdCgpICYmICF0aGlzLmxhc3RHdWVzc01hdGNoZXNDb3JyZWN0V29yZCgpO1xuICAgIH1cbiAgICBpc0dhbWVPdmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNXb24oKSB8fCB0aGlzLmhhc0xvc3QoKTtcbiAgICB9XG4gICAgZ2V0Q3VycmVudElucHV0QXNHdWVzcygpIHtcbiAgICAgICAgcmV0dXJuICgwLCBtb2RlbHV0aWxzXzEucGVyZm9ybVdvcmRsZUNvbXBhcmlzb24pKHRoaXMuY3VycmVudElucHV0LCB0aGlzLmNvcnJlY3RXb3JkKTtcbiAgICB9XG4gICAgZ2V0Q3VycmVudElucHV0UGFkZGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SW5wdXQucGFkRW5kKDUsIFwiIFwiKTtcbiAgICB9XG4gICAgZ2V0TGFzdEd1ZXNzQXNTdHJpbmcoKSB7XG4gICAgICAgIGlmICh0aGlzLmd1ZXNzSGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NIaXN0b3J5W3RoaXMuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAubWFwKCh4KSA9PiB4LmxldHRlcilcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xuICAgIH1cbiAgICBnZXRQYXN0R3Vlc3Nlc0FzU3RyaW5ncygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NIaXN0b3J5Lm1hcCgoZ3Vlc3MpID0+IGd1ZXNzLm1hcCgobGV0dGVyKSA9PiBsZXR0ZXIubGV0dGVyKS5qb2luKFwiXCIpKTtcbiAgICB9XG4gICAgYWNjZXB0Q3VycmVudElucHV0KCkge1xuICAgICAgICBpZiAoIXRoaXMubWF5Q3VycmVudElucHV0QmVBY2NlcHRlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ3Vlc3MgPSB0aGlzLmdldEN1cnJlbnRJbnB1dEFzR3Vlc3MoKTtcbiAgICAgICAgdGhpcy5ndWVzc0hpc3RvcnkucHVzaChndWVzcyk7XG4gICAgICAgIHRoaXMuY2xlYXJJbnB1dCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZUtleWJvYXJkU3RhdGVXaXRoTGFzdEd1ZXNzKCk7XG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZWQodGhpcyk7XG4gICAgfVxuICAgIGNsZWFySW5wdXQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudElucHV0ID0gXCJcIjtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgdXBkYXRlS2V5Ym9hcmRTdGF0ZVdpdGhMYXN0R3Vlc3MoKSB7XG4gICAgICAgIGNvbnN0IGd1ZXNzID0gdGhpcy5ndWVzc0hpc3RvcnlbdGhpcy5ndWVzc0hpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgICAgIGd1ZXNzLmZvckVhY2goKGxldHRlckRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhc3RTdGF0dXMgPSB0aGlzLmtleWJvYXJkU3RhdHVzLmdldChsZXR0ZXJEYXRhLmxldHRlcik7XG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSBsZXR0ZXJEYXRhLnN0YXR1cztcbiAgICAgICAgICAgIGNvbnN0IGJldHRlciA9ICgwLCBtb2RlbHV0aWxzXzEuY2hvb3NlQmV0dGVyTGV0dGVyU3RhdHVzKShwYXN0U3RhdHVzLCBuZXdTdGF0dXMpO1xuICAgICAgICAgICAgdGhpcy5rZXlib2FyZFN0YXR1cy5zZXQobGV0dGVyRGF0YS5sZXR0ZXIsIGJldHRlcik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2VkKHRoaXMpO1xuICAgIH1cbiAgICBkZWxldGVMZXR0ZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50SW5wdXROb3RFbXB0eSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJyZW50SW5wdXQgPSB0aGlzLmN1cnJlbnRJbnB1dC5zbGljZSgwLCB0aGlzLmN1cnJlbnRJbnB1dC5sZW5ndGggLSAxKTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgYWRkTGV0dGVyKGxldHRlcikge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudElucHV0Tm90RnVsbCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzUmVhY2hlZEd1ZXNzTGltaXQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudElucHV0ICs9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlZCh0aGlzKTtcbiAgICB9XG4gICAgbG9hZExlZ2FsV29yZHNGb3JTZWxmKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdGhpcy5sZWdhbFdvcmRzID0geWllbGQgKDAsIG1vZGVsdXRpbHNfMS5sb2FkTGVnYWxXb3Jkc0FzeW5jKSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLk1vZGVsID0gTW9kZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wZXJmb3JtV29yZGxlQ29tcGFyaXNvbiA9IGV4cG9ydHMuY3JlYXRlS2V5Ym9hcmRTdGF0dXMgPSBleHBvcnRzLmxvYWRMZWdhbFdvcmRzQXN5bmMgPSBleHBvcnRzLmNob29zZUJldHRlckxldHRlclN0YXR1cyA9IHZvaWQgMDtcbmZ1bmN0aW9uIGNob29zZUJldHRlckxldHRlclN0YXR1cyhhLCBiKSB7XG4gICAgY29uc3QgaW5kZXhNYXAgPSBbXCJncmVlblwiLCBcInllbGxvd1wiLCBcImdyZXlcIiwgXCJ1bnVzZWRcIl07XG4gICAgY29uc3QgYUluZGV4ID0gaW5kZXhNYXAuaW5kZXhPZihhKTtcbiAgICBjb25zdCBiSW5kZXggPSBpbmRleE1hcC5pbmRleE9mKGIpO1xuICAgIGlmIChhSW5kZXggPCBiSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIHJldHVybiBiO1xufVxuZXhwb3J0cy5jaG9vc2VCZXR0ZXJMZXR0ZXJTdGF0dXMgPSBjaG9vc2VCZXR0ZXJMZXR0ZXJTdGF0dXM7XG5mdW5jdGlvbiBsb2FkTGVnYWxXb3Jkc0FzeW5jKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZmV0Y2goXCIuL3ZhbGlkLXdvcmRsZS13b3Jkcy50eHRcIik7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZWFkIGxlZ2FsIHdvcmRzIGZpbGUuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoeWllbGQgcmVzcG9uc2UudGV4dCgpKS5zcGxpdChcIlxcblwiKS5tYXAoKHgpID0+IHgudG9VcHBlckNhc2UoKSk7XG4gICAgfSk7XG59XG5leHBvcnRzLmxvYWRMZWdhbFdvcmRzQXN5bmMgPSBsb2FkTGVnYWxXb3Jkc0FzeW5jO1xuZnVuY3Rpb24gY3JlYXRlS2V5Ym9hcmRTdGF0dXMoKSB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgbGV0dGVyIG9mIFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIikge1xuICAgICAgICBtYXAuc2V0KGxldHRlciwgXCJ1bnVzZWRcIik7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5leHBvcnRzLmNyZWF0ZUtleWJvYXJkU3RhdHVzID0gY3JlYXRlS2V5Ym9hcmRTdGF0dXM7XG5mdW5jdGlvbiBwZXJmb3JtV29yZGxlQ29tcGFyaXNvbihpbnB1dFdvcmQsIGNvcnJlY3RXb3JkKSB7XG4gICAgY29uc3QgZ3Vlc3MgPSBbXTtcbiAgICBjb25zdCBpbnB1dExldHRlcnMgPSBpbnB1dFdvcmQuc3BsaXQoXCJcIik7XG4gICAgY29uc3QgY29ycmVjdExldHRlcnMgPSBjb3JyZWN0V29yZC5zcGxpdChcIlwiKTtcbiAgICBpbnB1dExldHRlcnMuZm9yRWFjaCgoaW5wdXRMZXR0ZXIsIGkpID0+IHtcbiAgICAgICAgY29uc3QgY29ycmVjdENoYXIgPSBjb3JyZWN0V29yZFtpXTtcbiAgICAgICAgY29uc3QgcmVzdWx0UGFydCA9IHsgbGV0dGVyOiBpbnB1dExldHRlciB9O1xuICAgICAgICBpZiAoaW5wdXRMZXR0ZXIgPT09IGNvcnJlY3RDaGFyKSB7XG4gICAgICAgICAgICBndWVzcy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcmVzdWx0UGFydCksIHsgc3RhdHVzOiBcImdyZWVuXCIgfSkpO1xuICAgICAgICAgICAgY29ycmVjdExldHRlcnNbaV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc29sdXRpb25JbmRleCA9IGNvcnJlY3RMZXR0ZXJzLmluZGV4T2YoaW5wdXRMZXR0ZXIpO1xuICAgICAgICAgICAgaWYgKHNvbHV0aW9uSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3MucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdFBhcnQpLCB7IHN0YXR1czogXCJ5ZWxsb3dcIiB9KSk7XG4gICAgICAgICAgICAgICAgY29ycmVjdExldHRlcnNbc29sdXRpb25JbmRleF0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3Vlc3MucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHJlc3VsdFBhcnQpLCB7IHN0YXR1czogXCJncmV5XCIgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGd1ZXNzO1xufVxuZXhwb3J0cy5wZXJmb3JtV29yZGxlQ29tcGFyaXNvbiA9IHBlcmZvcm1Xb3JkbGVDb21wYXJpc29uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlZpZXcgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNvbnN0IHZpZXd1dGlsc18xID0gcmVxdWlyZShcIi4vdmlld3V0aWxzXCIpO1xuY2xhc3MgVmlldyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudGlsZUdyaWRSb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aWxlZ3JpZFwiKTtcbiAgICAgICAgdGhpcy5rZXlib2FyZFJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I2tleWJvYXJkXCIpO1xuICAgICAgICB0aGlzLnRvb2x0aXBBbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3Rvb2x0aXAtYW5jaG9yXCIpO1xuICAgIH1cbiAgICBiaW5kS2V5UHJlc3NPblBoeXNpY2FsS2V5Ym9hcmQoY2FsbGJhY2spIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQucmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUudG9TdHJpbmcoKSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soXCJFTlRFUlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlLnRvU3RyaW5nKCkgPT09IFwiQmFja3NwYWNlXCIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhcIkJBQ0tTUEFDRVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5jb2RlLnRvU3RyaW5nKCkuc3RhcnRzV2l0aChcIktleVwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxldHRlciA9IGV2ZW50LmNvZGVcbiAgICAgICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgLnN1YnN0cmluZygzKVxuICAgICAgICAgICAgICAgICAgICAudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhsZXR0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYmluZENsaWNrVmlydHVhbEtleWJvYXJkKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRSb290LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGxldCB0YXJnZXQ7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQubWF0Y2hlcyhcImRpdi5rZXlib2FyZC1rZXlcIikpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MUGFyYWdyYXBoRWxlbWVudCAmJlxuICAgICAgICAgICAgICAgICgoX2EgPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm1hdGNoZXMoXCJkaXYua2V5Ym9hcmQta2V5XCIpKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGFyZ2V0LmlkLnN1YnN0cmluZyg0KTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxldHRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobW9kZWwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJUaWxlR3JpZChtb2RlbCk7XG4gICAgICAgIHRoaXMucmVuZGVyS2V5Ym9hcmQobW9kZWwpO1xuICAgIH1cbiAgICByZW5kZXJUaWxlR3JpZChtb2RlbCkge1xuICAgICAgICB3aGlsZSAodGhpcy50aWxlR3JpZFJvb3QuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy50aWxlR3JpZFJvb3QucmVtb3ZlQ2hpbGQodGhpcy50aWxlR3JpZFJvb3QuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWwuZ3Vlc3NIaXN0b3J5LmZvckVhY2goKGd1ZXNzLCBndWVzc0luZGV4KSA9PiB7XG4gICAgICAgICAgICBndWVzcy5mb3JFYWNoKChsZXR0ZXJEYXRhLCBsZXR0ZXJJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSAoMCwgdmlld3V0aWxzXzEubGV0dGVyRGF0YVRvVGlsZUVsZW1lbnQpKGxldHRlckRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTGFzdEd1ZXNzID0gbW9kZWwuZ3Vlc3NIaXN0b3J5Lmxlbmd0aCAtIDEgPT09IGd1ZXNzSW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKGlzTGFzdEd1ZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImxhc3QtZ3Vlc3NcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSBcInRpbGUtXCIgKyBndWVzc0luZGV4ICsgXCItXCIgKyBsZXR0ZXJJbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVHcmlkUm9vdC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG1vZGVsLmhhc1JlYWNoZWRHdWVzc0xpbWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBtb2RlbFxuICAgICAgICAgICAgLmdldEN1cnJlbnRJbnB1dFBhZGRlZCgpXG4gICAgICAgICAgICAuc3BsaXQoXCJcIilcbiAgICAgICAgICAgIC5mb3JFYWNoKChsZXR0ZXIsIGxldHRlckluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBndWVzc0luZGV4ID0gbW9kZWwuZ3Vlc3NIaXN0b3J5Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSAoMCwgdmlld3V0aWxzXzEubGV0dGVyVG9UaWxlRWxlbWVudCkobGV0dGVyKTtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImN1cnJlbnQtaW5wdXRcIik7XG4gICAgICAgICAgICBjb25zdCBpc0xhc3RJbnB1dCA9IG1vZGVsLmN1cnJlbnRJbnB1dC5sZW5ndGggLSAxID09PSBsZXR0ZXJJbmRleDtcbiAgICAgICAgICAgIGlmIChpc0xhc3RJbnB1dCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImxhc3QtaW5wdXRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LmlkID0gXCJ0aWxlLVwiICsgZ3Vlc3NJbmRleCArIFwiLVwiICsgbGV0dGVySW5kZXg7XG4gICAgICAgICAgICB0aGlzLnRpbGVHcmlkUm9vdC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG51bUVtcHR5Um93c1RvRmlsbCA9IDUgLSBtb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBlbXB0eVJvd0luZGV4ID0gMDsgZW1wdHlSb3dJbmRleCA8IG51bUVtcHR5Um93c1RvRmlsbDsgZW1wdHlSb3dJbmRleCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBsZXR0ZXJJbmRleCA9IDA7IGxldHRlckluZGV4IDwgNTsgbGV0dGVySW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGd1ZXNzSW5kZXggPSBtb2RlbC5ndWVzc0hpc3RvcnkubGVuZ3RoICsgZW1wdHlSb3dJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9ICgwLCB2aWV3dXRpbHNfMS5sZXR0ZXJUb1RpbGVFbGVtZW50KShcIiBcIik7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9IFwidGlsZS1cIiArIGd1ZXNzSW5kZXggKyBcIi1cIiArIGxldHRlckluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMudGlsZUdyaWRSb290LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlbmRlcktleWJvYXJkKG1vZGVsKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUVtcHR5S2V5Ym9hcmRSb3cgPSAocm93TnVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIHJvd0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImtleWJvYXJkLXJvd1wiKTtcbiAgICAgICAgICAgIHJvd0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJvdy1cIiArIChyb3dOdW0gKyAxKSk7XG4gICAgICAgICAgICByb3dFbGVtZW50LmlkID0gXCJrZXlib2FyZC1yb3ctXCIgKyAocm93TnVtICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gcm93RWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY3JlYXRlS2V5Ym9hcmRLZXkgPSAoa2V5RGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmlkID0gXCJrZXktXCIgKyBrZXlEYXRhLmZhY2U7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJrZXlib2FyZC1rZXlcIik7XG4gICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoa2V5RGF0YS5zdGF0dXMpO1xuICAgICAgICAgICAgaWYgKGtleURhdGEuZmFjZSA9PT0gXCJFTlRFUlwiKSB7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2lkZVwiKTtcbiAgICAgICAgICAgICAgICBrZXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJlbnRlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleURhdGEuZmFjZSA9PT0gXCJCQUNLU1BBQ0VcIikge1xuICAgICAgICAgICAgICAgIGtleUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpZGVcIik7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYmFja3NwYWNlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibm9ybWFsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgcC5pbm5lckhUTUwgPSBrZXlEYXRhLmZhY2UgPT09IFwiQkFDS1NQQUNFXCIgPyBcIjxcIiA6IGtleURhdGEuZmFjZTtcbiAgICAgICAgICAgIGtleUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XG4gICAgICAgICAgICByZXR1cm4ga2V5RWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgd2hpbGUgKHRoaXMua2V5Ym9hcmRSb290LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMua2V5Ym9hcmRSb290LnJlbW92ZUNoaWxkKHRoaXMua2V5Ym9hcmRSb290LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleWJvYXJkTGF5b3V0ID0gKDAsIHZpZXd1dGlsc18xLmNyZWF0ZUtleWJvYXJkTGF5b3V0KShtb2RlbC5rZXlib2FyZFN0YXR1cyk7XG4gICAgICAgIGtleWJvYXJkTGF5b3V0LmZvckVhY2goKHJvdywgcm93TnVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dFbGVtZW50ID0gY3JlYXRlRW1wdHlLZXlib2FyZFJvdyhyb3dOdW0pO1xuICAgICAgICAgICAgcm93Lm1hcChjcmVhdGVLZXlib2FyZEtleSkuZm9yRWFjaCgoa2V5RWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvd0VsZW1lbnQuYXBwZW5kQ2hpbGQoa2V5RWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMua2V5Ym9hcmRSb290LmFwcGVuZENoaWxkKHJvd0VsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2hha2UoZHVyYXRpb25Jbk1zKSB7XG4gICAgICAgIGNvbnN0IGlucHV0dGVkVGlsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2LnRpbGUuY3VycmVudC1pbnB1dFwiKTtcbiAgICAgICAgaW5wdXR0ZWRUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoXCJzaGFraW5nXCIpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2hha2luZ1wiKTtcbiAgICAgICAgICAgIH0sIGR1cmF0aW9uSW5Ncyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3AodGlsZSwgZHVyYXRpb25Jbk1zKSB7XG4gICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImlucHV0dGluZ1wiKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJpbnB1dHRpbmdcIik7XG4gICAgICAgIH0sIGR1cmF0aW9uSW5Ncyk7XG4gICAgfVxuICAgIHBvcExhc3RUaWxlKCkge1xuICAgICAgICBjb25zdCB0aWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdi50aWxlLmxhc3QtaW5wdXRcIik7XG4gICAgICAgIGlmICh0aWxlICE9PSBudWxsICYmIHRpbGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5wb3AodGlsZSwgY29uc3RhbnRzXzEuSU5QVVRUSU5HX0RVUkFUSU9OKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmbGlwQ3VycmVudElucHV0QW5kQXBwbHlDb2xvcnMoZ3Vlc3MpIHtcbiAgICAgICAgY29uc3QgdGlsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2LnRpbGUuY3VycmVudC1pbnB1dFwiKTtcbiAgICAgICAgZ3Vlc3MuZm9yRWFjaCgobGV0dGVyRGF0YSwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGlsZSA9IHRpbGVzW2ldO1xuICAgICAgICAgICAgY29uc3QgZWZmZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChcImZsaXBwaW5nLWRvd25cIik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcImZsaXBwaW5nLWRvd25cIik7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcImlucHV0dGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKGxldHRlckRhdGEuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwiZmxpcHBpbmctdXBcIik7XG4gICAgICAgICAgICAgICAgfSwgY29uc3RhbnRzXzEuRkxJUFBJTkdfRFVSQVRJT04pO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlwcGluZy11cFwiKTtcbiAgICAgICAgICAgICAgICB9LCBjb25zdGFudHNfMS5GTElQUElOR19EVVJBVElPTiAqIDIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZWZmZWN0LCBjb25zdGFudHNfMS5GTElQUElOR19JTlRFUlZBTCAqIGkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYm91bmNlTGFzdEd1ZXNzKCkge1xuICAgICAgICBjb25zdCB0aWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYudGlsZS5sYXN0LWd1ZXNzXCIpO1xuICAgICAgICB0aWxlcy5mb3JFYWNoKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlZmZlY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKFwiYm91bmNpbmdcIik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShcImJvdW5jaW5nXCIpO1xuICAgICAgICAgICAgICAgIH0sIGNvbnN0YW50c18xLkJPVU5DRV9EVVJBVElPTik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0VGltZW91dChlZmZlY3QsIGNvbnN0YW50c18xLkJPVU5DRV9JTlRFUlZBTCAqIGkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2hvd1Rvb2x0aXAobWVzc2FnZSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2LnRvb2x0aXBcIikuZm9yRWFjaCgodG9vbHRpcCkgPT4ge1xuICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5hZGQoXCJ0b29sdGlwXCIpO1xuICAgICAgICB0b29sdGlwLmNsYXNzTGlzdC5hZGQoXCJmYWRlLWluXCIpO1xuICAgICAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgIHAudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgICAgICB0b29sdGlwLmFwcGVuZENoaWxkKHApO1xuICAgICAgICB0aGlzLnRvb2x0aXBBbmNob3IuYXBwZW5kQ2hpbGQodG9vbHRpcCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdG9vbHRpcC5jbGFzc0xpc3QucmVtb3ZlKFwiZmFkZS1pblwiKTtcbiAgICAgICAgICAgIHRvb2x0aXAuY2xhc3NMaXN0LmFkZChcImZhZGUtb3V0XCIpO1xuICAgICAgICB9LCBjb25zdGFudHNfMS5UT09MVElQX0ZBREVfRFVSQVRJT04gKyBjb25zdGFudHNfMS5UT09MVElQX1NIT1dfRFVSQVRJT04pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b29sdGlwQW5jaG9yLnJlbW92ZUNoaWxkKHRvb2x0aXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHsgfVxuICAgICAgICB9LCBjb25zdGFudHNfMS5UT09MVElQX0ZBREVfRFVSQVRJT04gKiAyICsgY29uc3RhbnRzXzEuVE9PTFRJUF9TSE9XX0RVUkFUSU9OKTtcbiAgICB9XG59XG5leHBvcnRzLlZpZXcgPSBWaWV3O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNyZWF0ZUtleWJvYXJkTGF5b3V0ID0gZXhwb3J0cy5sZXR0ZXJEYXRhVG9UaWxlRWxlbWVudCA9IGV4cG9ydHMubGV0dGVyVG9UaWxlRWxlbWVudCA9IHZvaWQgMDtcbmNvbnN0IEtFWUJPQVJEX0xBWU9VVF9URU1QTEFURSA9IFtcbiAgICBcIlFXRVJUWVVJT1BcIi5zcGxpdChcIlwiKSxcbiAgICBcIkFTREZHSEpLTFwiLnNwbGl0KFwiXCIpLFxuICAgIFtcIkVOVEVSXCIsIC4uLlwiWlhDVkJOTVwiLnNwbGl0KFwiXCIpLCBcIkJBQ0tTUEFDRVwiXSxcbl07XG5mdW5jdGlvbiBsZXR0ZXJUb1RpbGVFbGVtZW50KGxldHRlcikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xuICAgIGlmIChsZXR0ZXIgIT09IFwiIFwiKSB7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiaW5wdXR0ZWRcIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuICAgIH1cbiAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgcC5pbm5lckhUTUwgPSBsZXR0ZXI7XG4gICAgZGl2LmFwcGVuZENoaWxkKHApO1xuICAgIHJldHVybiBkaXY7XG59XG5leHBvcnRzLmxldHRlclRvVGlsZUVsZW1lbnQgPSBsZXR0ZXJUb1RpbGVFbGVtZW50O1xuZnVuY3Rpb24gbGV0dGVyRGF0YVRvVGlsZUVsZW1lbnQobGV0dGVyRGF0YSkge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJ0aWxlXCIpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKGxldHRlckRhdGEuc3RhdHVzKTtcbiAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgcC5pbm5lckhUTUwgPSBsZXR0ZXJEYXRhLmxldHRlcjtcbiAgICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gICAgcmV0dXJuIGRpdjtcbn1cbmV4cG9ydHMubGV0dGVyRGF0YVRvVGlsZUVsZW1lbnQgPSBsZXR0ZXJEYXRhVG9UaWxlRWxlbWVudDtcbmZ1bmN0aW9uIGNyZWF0ZUtleWJvYXJkTGF5b3V0KGtleWJvYXJkU3RhdHVzKSB7XG4gICAgcmV0dXJuIEtFWUJPQVJEX0xBWU9VVF9URU1QTEFURS5tYXAoKHJvdykgPT4gcm93Lm1hcCgobGV0dGVyKSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZhY2U6IGxldHRlcixcbiAgICAgICAgICAgIHN0YXR1czogKF9hID0ga2V5Ym9hcmRTdGF0dXMuZ2V0KGxldHRlcikpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFwidW51c2VkXCIsXG4gICAgICAgIH07XG4gICAgfSkpO1xufVxuZXhwb3J0cy5jcmVhdGVLZXlib2FyZExheW91dCA9IGNyZWF0ZUtleWJvYXJkTGF5b3V0O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgbW9kZWxfMSA9IHJlcXVpcmUoXCIuL21vZGVsXCIpO1xuY29uc3QgY29udHJvbGxlcl8xID0gcmVxdWlyZShcIi4vY29udHJvbGxlclwiKTtcbmNvbnN0IHZpZXdfMSA9IHJlcXVpcmUoXCIuL3ZpZXdcIik7XG5mdW5jdGlvbiBnZXRXb3JkKCkge1xuICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgbGV0IHdvcmQgPSBzZWFyY2hQYXJhbXMuZ2V0KFwid29yZFwiKTtcbiAgICBpZiAod29yZCA9PT0gbnVsbCkge1xuICAgICAgICB3b3JkID0gXCJIRUxMT1wiO1xuICAgIH1cbiAgICByZXR1cm4gd29yZC50b1VwcGVyQ2FzZSgpO1xufVxuY29uc3QgbW9kZWwgPSBuZXcgbW9kZWxfMS5Nb2RlbChnZXRXb3JkKCkpO1xuY29uc3QgdmlldyA9IG5ldyB2aWV3XzEuVmlldygpO1xuY29uc3QgY29udHJvbGxlciA9IG5ldyBjb250cm9sbGVyXzEuQ29udHJvbGxlcihtb2RlbCwgdmlldyk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=