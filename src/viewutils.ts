import {
  KeyboardKeyData,
  KeyboardKeyLetter,
  KeyboardStatusMap,
  Letter,
  LetterInGuessData,
} from "./types";

const KEYBOARD_LAYOUT_TEMPLATE: KeyboardKeyLetter[][] = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"],
] as KeyboardKeyLetter[][];

export function letterToTileElement(letter: string): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("tile");
  if (letter !== " ") {
    div.classList.add("inputted");
  } else {
    div.classList.add("empty");
  }
  const p = document.createElement("p");
  p.innerHTML = letter;
  div.appendChild(p);
  return div;
}

export function letterDataToTileElement(
  letterData: LetterInGuessData
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("tile");
  div.classList.add(letterData.status);
  const p = document.createElement("p");
  p.innerHTML = letterData.letter;
  div.appendChild(p);
  return div;
}

export function createKeyboardLayout(
  keyboardStatus: KeyboardStatusMap
): KeyboardKeyData[][] {
  return KEYBOARD_LAYOUT_TEMPLATE.map((row) =>
    row.map((letter) => {
      return {
        face: letter as KeyboardKeyLetter,
        status: keyboardStatus.get(letter as Letter) ?? "unused",
      };
    })
  );
}
