const DURATION_WAIT_FOR_FLIP = 1500;
const DURATION_WAIT_FOR_TOOLTIP = 1000;

export function waitForFlipAnimationToFinish() {
  cy.wait(DURATION_WAIT_FOR_FLIP);
}

export function waitForTooltipToBePresent() {

}

// The virtual keyboard

export function getVirtualKey(key: string) {
  return cy.get("div.keyboard-key#key-" + key);
}

export function clickVirtualKey(key: string) {
  getVirtualKey(key).click();
}

export function keyIsColor(key: string, color: string) {
  getVirtualKey(key).should("have.class", color);
}

// The physical keyboard

export function typePhysicalLetter(key: string) {
  if (key === "ENTER") {
    key = "{enter}";
  }
  if (key === "BACKSPACE") {
    key = "{backspace}";
  }
  cy.get("body").type(key);
}

// Helper for the above

export function inputGuessAndHitEnter(
  input: string,
  method: "virtually" | "physically"
) {
  if (method === "physically") {
    input.split("").forEach((letter) => {
      typePhysicalLetter(letter);
    });
    typePhysicalLetter("ENTER");
  } else {
    input.split("").forEach((letter) => {
      clickVirtualKey(letter);
    });
    clickVirtualKey("ENTER");
  }
}

// The letter tiles

export function getTile(guessIndex: number, letterIndex: number) {
  return cy.get("div.tile#tile-" + guessIndex + "-" + letterIndex);
}

export function tileIsColor(
  tile: Cypress.Chainable<JQuery<HTMLElement>>,
  color: string
) {
  return tile.should("have.class", color);
}

export function expectUiIsIntact() {
  expectAllTilesExist();
}

function expectAllTilesExist() {
  for (let guessIndex = 0; guessIndex < 6; guessIndex++) {
    for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
      const tile = getTile(guessIndex, letterIndex);
      expect(tile.should("exist"));
    }
  }
}

// The tooltip

export function getTooltip() {
  return cy.get("div.tooltip");
}
