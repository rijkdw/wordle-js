// =======================================================================
// Model
// * stores state
// * provides derivative data (e.g. number of guesses)
// * modifies self
// =======================================================================

import {
  chooseBetterLetterStatus,
  createKeyboardStatus,
  loadLegalWordsAsync,
  performWordleComparison,
} from "./modelutils";
import { Guess, KeyboardStatusMap, Letter, LetterInGuessStatus } from "./types";

export class Model {
  correctWord: string;
  currentInput: string;
  legalWords: string[];
  guessHistory: Guess[];
  keyboardStatus: KeyboardStatusMap;
  onModelChanged: (model: Model) => void;
  // TODO (later): separate into:
  // 1. onInputChanged, for when the user types something
  // 2. onInputAccepted, for when the user successfully submits a guess

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
    return (
      this.currentInputIsFull() &&
      this.currentInputIsKnown() &&
      this.currentInputHasNotYetBeenGuessed()
    );
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

  getCurrentInputAsGuess(): Guess {
    return performWordleComparison(this.currentInput, this.correctWord);
  }

  getCurrentInputPadded(): string {
    return this.currentInput.padEnd(5, " ");
  }

  getLastGuessAsString(): string | undefined {
    if (this.guessHistory.length === 0) {
      return undefined;
    }
    return this.guessHistory[this.guessHistory.length - 1]
      .map((x) => x.letter)
      .join("");
  }

  getPastGuessesAsStrings(): string[] {
    return this.guessHistory.map((guess) =>
      guess.map((letter) => letter.letter).join("")
    );
  }

  // modify self

  acceptCurrentInput() {
    if (!this.mayCurrentInputBeAccepted()) {
      return; // TODO error?
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
    if (!this.currentInputNotEmpty()) {
      return; // TODO error?
    }
    this.currentInput = this.currentInput.slice(
      0,
      this.currentInput.length - 1
    );
    this.onModelChanged(this);
  }

  addLetter(letter: Letter) {
    if (!this.currentInputNotFull()) {
      return; // TODO error?
    }
    if (this.hasReachedGuessLimit()) {
      return; // TODO error?
    }
    this.currentInput += letter;
    this.onModelChanged(this);
  }

  async loadLegalWordsForSelf() {
    this.legalWords = await loadLegalWordsAsync();
  }
}
