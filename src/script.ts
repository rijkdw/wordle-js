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
type Word = string;

type LetterInGuessStatus = "green" | "yellow" | "grey";
type LetterInGuessData = {
  letter: Letter;
  status: LetterInGuessStatus;
};
type LetterGuessHistoryStatus = LetterInGuessStatus | "dark";

type Guess = LetterInGuessData[];

class Model {
  correctWord: Word;
  currentInput: Word;
  legalWords: Word[];
  guessHistory: Guess[];

  constructor(correctWord: Word, legalWords: Word[] | "load") {
    this.correctWord = correctWord;
    this.currentInput = "";
    this.legalWords = [];
    if (legalWords === "load") {
      this.loadLegalWordsForSelf();
    } else {
      this.legalWords = legalWords;
    }
    this.guessHistory = [];
  }

  async loadLegalWordsForSelf() {
    this.legalWords = await Model.loadLegalWords();
  }

  static async loadLegalWords() {
    const response = await fetch("./valid-wordle-words.txt");
    if (!response.ok) {
      throw new Error("Could not read legal words file");
    }
    return (await response.text()).split("\n").map((x) => x.toUpperCase());
  }

  // checks

  mayCurrentInputBeAccepted(): boolean {
    return (
      this.currentInput.length === 5 &&
      this.legalWords.includes(this.currentInput)
    );
  }

  hasReachedGuessLimit(): boolean {
    return this.guessHistory.length >= 6;
  }

  // conversions

  getCurrentInputAsGuess(): Guess {
    return wordleComparisonAlgorithm(this.currentInput, this.correctWord);
  }

  acceptCurrentInput() {
    const asGuess = this.getCurrentInputAsGuess();
    this.currentInput = "";
    this.guessHistory.push(asGuess);
  }
}

function wordleComparisonAlgorithm(inputWord: Word, correctWord: Word): Guess {
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

type KeyboardKeyInView = {
  letter: string;
  element: HTMLElement;
};
interface IView {
  update: (model: Model) => void;
}

class ConsoleView implements IView {
  update(model: Model) {
    console.clear();
  }
}

class Controller {
  model?: Model;
  view?: IView;

  constructor() {}
}
