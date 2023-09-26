import {
  clickVirtualKey,
  getTile,
  getVirtualKey,
  inputGuessAndHitEnter,
  keyIsColor,
  tileIsColor,
  typePhysicalLetter,
} from "./helpers";

describe("Input", () => {
  it("with virtual keyboard", () => {
    cy.visit("http://localhost:8000?word=WHISK");

    clickVirtualKey("H");
    clickVirtualKey("E");
    clickVirtualKey("L");
    clickVirtualKey("L");
    clickVirtualKey("O");
    clickVirtualKey("ENTER");

    expect(getTile(0, 0).contains("H"));
    expect(getTile(0, 1).contains("E"));
    expect(getTile(0, 2).contains("L"));
    expect(getTile(0, 3).contains("L"));
    expect(getTile(0, 4).contains("O"));

    // // tiles -- colors

    // // keyboard -- colors
    // TODO
  });

  it("with physical keyboard", () => {
    cy.visit("http://localhost:8000?word=WHISK");

    typePhysicalLetter("H");
    typePhysicalLetter("E");
    typePhysicalLetter("L");
    typePhysicalLetter("L");
    typePhysicalLetter("O");
    typePhysicalLetter("ENTER");

    expect(getTile(0, 0).contains("H"));
    expect(getTile(0, 1).contains("E"));
    expect(getTile(0, 2).contains("L"));
    expect(getTile(0, 3).contains("L"));
    expect(getTile(0, 4).contains("O"));
  });
});

describe("Keyboard colors change", () => {
  it("for one guess", () => {
    cy.visit("http://localhost:8000?word=WHISK");
    inputGuessAndHitEnter("HELLO", "physically");
    expect(getVirtualKey("W").should("have.class", "unused"));
    expect(getVirtualKey("H").should("have.class", "yellow"));
    expect(getVirtualKey("I").should("have.class", "unused"));
    expect(getVirtualKey("S").should("have.class", "unused"));
    expect(getVirtualKey("K").should("have.class", "unused"));
    expect(getVirtualKey("E").should("have.class", "grey"));
    expect(getVirtualKey("L").should("have.class", "grey"));
    expect(getVirtualKey("O").should("have.class", "grey"));
    expect(getVirtualKey("R").should("have.class", "unused"));
    expect(getVirtualKey("T").should("have.class", "unused"));
    expect(getVirtualKey("X").should("have.class", "unused"));
  });

  it("for multiple guesses", () => {
    let keyStates: string[][] = [];
    cy.visit("http://localhost:8000?word=WHISK");

    inputGuessAndHitEnter("HELLO", "physically");
    keyStates = [
      ["W", "unused"],
      ["H", "yellow"],
      ["I", "unused"],
      ["S", "unused"],
      ["K", "unused"],
      ["E", "grey"],
      ["L", "grey"],
      ["O", "grey"],
      ["R", "unused"],
      ["T", "unused"],
      ["X", "unused"],
    ];
    keyStates.forEach(([key, state]) => {
      expect(keyIsColor(key, state));
    });

    inputGuessAndHitEnter("WORLD", "physically");
    keyStates = [
      ["W", "green"],
      ["H", "yellow"],
      ["I", "unused"],
      ["S", "unused"],
      ["K", "unused"],
      ["E", "grey"],
      ["L", "grey"],
      ["O", "grey"],
      ["R", "grey"],
      ["T", "unused"],
      ["X", "unused"],
    ];
    keyStates.forEach(([key, state]) => {
      expect(keyIsColor(key, state));
    });

    inputGuessAndHitEnter("WHISH", "physically");
    keyStates = [
      ["W", "green"],
      ["H", "green"],
      ["I", "green"],
      ["S", "green"],
      ["K", "unused"],
      ["E", "grey"],
      ["L", "grey"],
      ["O", "grey"],
      ["R", "grey"],
      ["T", "unused"],
      ["X", "unused"],
    ];
    keyStates.forEach(([key, state]) => {
      expect(keyIsColor(key, state));
    });

    inputGuessAndHitEnter("WHISK", "physically");
    keyStates = [
      ["W", "green"],
      ["H", "green"],
      ["I", "green"],
      ["S", "green"],
      ["K", "green"],
      ["E", "grey"],
      ["L", "grey"],
      ["O", "grey"],
      ["R", "grey"],
      ["T", "unused"],
      ["X", "unused"],
    ];
    keyStates.forEach(([key, state]) => {
      expect(keyIsColor(key, state));
    });
  });
});

describe("Tile colors change", () => {
  it("for one guess", () => {
    cy.visit("http://localhost:8000?word=WHISK");
    inputGuessAndHitEnter("HELLO", "physically");
    let expectedColors = ["yellow", "grey", "grey", "grey", "grey"];
    expectedColors.forEach((color, letterIndex) => {
      expect(tileIsColor(getTile(0, letterIndex), color));
    });
  });

  it("for multiple guesses", () => {
    let expectedColors: string[];
    cy.visit("http://localhost:8000?word=WHISK");

    inputGuessAndHitEnter("HELLO", "physically");
    expectedColors = ["yellow", "grey", "grey", "grey", "grey"];
    expectedColors.forEach((color, letterIndex) => {
      expect(tileIsColor(getTile(0, letterIndex), color));
    });

    inputGuessAndHitEnter("WORLD", "physically");
    expectedColors = ["green", "grey", "grey", "grey", "grey"];
    expectedColors.forEach((color, letterIndex) => {
      expect(tileIsColor(getTile(1, letterIndex), color));
    });

    inputGuessAndHitEnter("WHISH", "physically");
    expectedColors = ["green", "green", "green", "green", "grey"];
    expectedColors.forEach((color, letterIndex) => {
      expect(tileIsColor(getTile(2, letterIndex), color));
    });

    inputGuessAndHitEnter("WHISK", "physically");
    expectedColors = ["green", "green", "green", "green", "green"];
    expectedColors.forEach((color, letterIndex) => {
      expect(tileIsColor(getTile(3, letterIndex), color));
    });
  });
});
