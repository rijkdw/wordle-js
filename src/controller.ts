import {
  ALREADY_GUESSED_MESSAGE,
  FLIPPING_DURATION,
  FLIPPING_INTERVAL,
  NOT_ENOUGH_LETTERS_MESSAGE,
  SHAKE_DURATION,
  UNKNOWN_WORD_MESSAGE,
  WIN_MESSAGES,
} from "./constants";
import { Model } from "./model";
import { KeyboardKeyLetter, Letter } from "./types";
import { View } from "./view";

export class Controller {
  model: Model;
  view: View;
  isLocked: boolean = false;

  constructor(model: Model, view: View) {
    this.model = model;
    this.model.bindModelChanged(this.onModelChanged);

    this.view = view;
    this.view.bindClickVirtualKeyboard(this.handleKeypress);
    this.view.bindKeyPressOnPhysicalKeyboard(this.handleKeypress);

    this.onModelChanged(this.model);
  }

  onModelChanged = (model: Model) => {
    this.view.render(model);
  };

  handleKeypress = (letter: KeyboardKeyLetter) => {
    if (this.isLocked) {
      return;
    }
    if (this.model.isGameOver()) {
      return;
    }
    if (letter === "ENTER") {
      this.handleSubmit();
    } else if (letter === "BACKSPACE") {
      this.handleDeleteLetter();
    } else {
      this.handleAddLetter(letter);
    }
  };

  handleAddLetter = (letter: Letter) => {
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

  handleDeleteLetter = () => {
    if (this.model.currentInputIsEmpty()) {
      return;
    }
    this.model.deleteLetter();
  };

  handleSubmit = () => {
    if (!this.model.mayCurrentInputBeAccepted() && !this.model.hasWon()) {
      this.view.shake(SHAKE_DURATION);
      this.lock(SHAKE_DURATION);
      if (!this.model.currentInputIsKnown()) {
        this.view.showTooltip(UNKNOWN_WORD_MESSAGE);
      }
      if (this.model.currentInputNotFull()) {
        this.view.showTooltip(NOT_ENOUGH_LETTERS_MESSAGE);
      }
      if (this.model.currentInputHasAlreadyBeenGuessed()) {
        this.view.showTooltip(ALREADY_GUESSED_MESSAGE);
      }
      return;
    }
    this.view.flipCurrentInputAndApplyColors(
      this.model.getCurrentInputAsGuess()
    );
    setTimeout(() => {
      this.model.acceptCurrentInput();
      if (this.model.hasWon()) {
        this.view.bounceLastGuess();
        this.view.showTooltip(WIN_MESSAGES[this.model.guessHistory.length - 1]);
      }
      if (this.model.hasLost()) {
        this.view.showTooltip(this.model.correctWord);
      }
    }, FLIPPING_INTERVAL * 4 + FLIPPING_DURATION * 2);
  };

  lock(durationInMs: number) {
    this.isLocked = true;
    setTimeout(() => {
      this.isLocked = false;
    }, durationInMs);
  }
}
