import {
  BOUNCE_DURATION,
  BOUNCE_INTERVAL,
  FLIPPING_DURATION,
  FLIPPING_INTERVAL,
  INPUTTING_DURATION,
  TOOLTIP_FADE_DURATION,
  TOOLTIP_SHOW_DURATION,
} from "./constants";
import { Guess, KeyboardKeyData, KeyboardKeyLetter, Letter } from "./types";
import {
  createKeyboardLayout,
  letterDataToTileElement,
  letterToTileElement,
} from "./viewutils";
import { Model } from "./model";

export class View {
  tileGridRoot: HTMLElement;
  keyboardRoot: HTMLElement;
  tooltipAnchor: HTMLElement;

  constructor() {
    this.tileGridRoot = document.querySelector("div#tilegrid")!;
    this.keyboardRoot = document.querySelector("div#keyboard")!;
    this.tooltipAnchor = document.querySelector("div#tooltip-anchor")!;
  }

  bindKeyPressOnPhysicalKeyboard(
    callback: (letter: KeyboardKeyLetter) => void
  ) {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
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
          .toUpperCase() as Letter;
        callback(letter);
      }
    });
  }

  bindClickVirtualKeyboard(callback: (letter: KeyboardKeyLetter) => void) {
    this.keyboardRoot.addEventListener("click", (event: MouseEvent) => {
      let target: HTMLDivElement;
      if (
        event.target instanceof HTMLDivElement &&
        event.target.matches("div.keyboard-key")
      ) {
        target = event.target;
      } else if (
        event.target instanceof HTMLParagraphElement &&
        event.target.parentElement?.matches("div.keyboard-key")
      ) {
        target = event.target.parentElement as HTMLDivElement;
      } else {
        return;
      }
      const letter = target.id.substring(4);
      callback(letter as KeyboardKeyLetter);
    });
  }

  render(model: Model) {
    this.renderTileGrid(model);
    this.renderKeyboard(model);
  }

  renderTileGrid(model: Model) {
    // clear the grid
    while (this.tileGridRoot.firstChild) {
      this.tileGridRoot.removeChild(this.tileGridRoot.firstChild);
    }
    // repopulate the grid
    // 1. the past guesses
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
    // 1.a stop if six guesses
    if (model.hasReachedGuessLimit()) {
      return;
    }
    // 2. the current input
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
    // 3. the remaing empty rows
    const numEmptyRowsToFill = 5 - model.guessHistory.length;
    for (
      let emptyRowIndex = 0;
      emptyRowIndex < numEmptyRowsToFill;
      emptyRowIndex++
    ) {
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        const guessIndex = model.guessHistory.length + emptyRowIndex + 1;
        const element = letterToTileElement(" ");
        element.id = "tile-" + guessIndex + "-" + letterIndex;
        this.tileGridRoot.appendChild(element);
      }
    }
  }

  renderKeyboard(model: Model) {
    const createEmptyKeyboardRow = (rowNum: number) => {
      const rowElement = document.createElement("div");
      rowElement.classList.add("keyboard-row");
      rowElement.classList.add("row-" + (rowNum + 1));
      rowElement.id = "keyboard-row-" + (rowNum + 1);
      return rowElement;
    };

    const createKeyboardKey = (keyData: KeyboardKeyData) => {
      const keyElement = document.createElement("div");
      keyElement.id = "key-" + keyData.face;
      keyElement.classList.add("keyboard-key");
      keyElement.classList.add(keyData.status);
      if (keyData.face === "ENTER") {
        keyElement.classList.add("wide");
        keyElement.classList.add("enter");
      } else if (keyData.face === "BACKSPACE") {
        keyElement.classList.add("wide");
        keyElement.classList.add("backspace");
      } else {
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

  shake(durationInMs: number) {
    const inputtedTiles = document.querySelectorAll("div.tile.current-input");
    inputtedTiles.forEach((tile) => {
      tile.classList.add("shaking");
      setTimeout(() => {
        tile.classList.remove("shaking");
      }, durationInMs);
    });
  }

  pop(tile: HTMLElement, durationInMs: number) {
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

  flipCurrentInputAndApplyColors(guess: Guess) {
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

  showTooltip(message: string) {
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
    setTimeout(
      () => {
        try {
          this.tooltipAnchor.removeChild(tooltip);
        } catch (e) {
          //
        }
      },
      TOOLTIP_FADE_DURATION * 2 + TOOLTIP_SHOW_DURATION
    );
  }
}
