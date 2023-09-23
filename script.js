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
    }
    loadLegalWordsForSelf() {
        return __awaiter(this, void 0, void 0, function* () {
            this.legalWords = yield Model.loadLegalWords();
        });
    }
    static loadLegalWords() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("./valid-wordle-words.txt");
            if (!response.ok) {
                throw new Error("Could not read legal words file");
            }
            return (yield response.text()).split("\n").map((x) => x.toUpperCase());
        });
    }
    // checks
    mayCurrentInputBeAccepted() {
        return (this.currentInput.length === 5 &&
            this.legalWords.includes(this.currentInput));
    }
    hasReachedGuessLimit() {
        return this.guessHistory.length >= 6;
    }
    // conversions
    getCurrentInputAsGuess() {
        return wordleComparisonAlgorithm(this.currentInput, this.correctWord);
    }
    acceptCurrentInput() {
        const asGuess = this.getCurrentInputAsGuess();
        this.currentInput = "";
        this.guessHistory.push(asGuess);
    }
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
class ConsoleView {
    update(model) {
        // TODO
    }
}
class Controller {
    constructor() { }
}
