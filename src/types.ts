export type Letter =
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

export type LetterInGuessStatus = "green" | "yellow" | "grey";
export type LetterInGuessData = {
  letter: Letter;
  status: LetterInGuessStatus;
};
export type Guess = LetterInGuessData[];

export type KeyboardKeyStatus = "green" | "yellow" | "grey" | "unused";
export type KeyboardKeyLetter = Letter | "ENTER" | "BACKSPACE";
export type KeyboardKeyData = {
  face: KeyboardKeyLetter;
  status: KeyboardKeyStatus;
};
export type KeyboardStatusMap = Map<Letter, KeyboardKeyStatus>;
