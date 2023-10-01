import { Guess, KeyboardStatusMap, Letter, LetterInGuessStatus } from "./types";

export function chooseBetterLetterStatus(
  a: LetterInGuessStatus,
  b: LetterInGuessStatus
): LetterInGuessStatus {
  const indexMap = ["green", "yellow", "grey", "unused"];
  const aIndex = indexMap.indexOf(a);
  const bIndex = indexMap.indexOf(b);
  if (aIndex < bIndex) {
    return a;
  }
  return b;
}

export async function loadLegalWordsAsync() {
  const response = await fetch("./valid-wordle-words.txt");
  if (!response.ok) {
    throw new Error("Could not read legal words file.");
  }
  return (await response.text()).split("\n").map((x) => x.toUpperCase());
}

export function createKeyboardStatus(): KeyboardStatusMap {
  const map: KeyboardStatusMap = new Map();
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    map.set(letter as Letter, "unused");
  }
  return map;
}

export function performWordleComparison(
  inputWord: string,
  correctWord: string
): Guess {
  const guess: Guess = [];
  const inputLetters = inputWord.split("") as Letter[];
  const correctLetters = correctWord.split("") as (Letter | null)[];
  inputLetters.forEach((inputLetter, i) => {
    const correctChar = correctWord[i];
    const resultPart = { letter: inputLetter };
    if (inputLetter === correctChar) {
      guess.push({ ...resultPart, status: "green" });
      correctLetters[i] = null;
    } else {
      const solutionIndex = correctLetters.indexOf(inputLetter);
      if (solutionIndex !== -1) {
        guess.push({ ...resultPart, status: "yellow" });
        correctLetters[solutionIndex] = null;
      } else {
        guess.push({ ...resultPart, status: "grey" });
      }
    }
  });
  return guess;
}
