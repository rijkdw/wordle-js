import {
  clickVirtualKey,
  getTile,
  getVirtualKey,
  inputGuessAndHitEnter,
  keyIsColor,
  tileIsColor,
  typePhysicalLetter,
} from "./test-helpers";

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

  const naturalTypingSubroutine = (inputFunction: (key: string) => void) => {
    cy.visit("http://localhost:8000");

    inputFunction("H"); // H
    expect(getTile(0, 0).contains("H"));
    inputFunction("E"); // HE
    expect(getTile(0, 1).contains("E"));
    inputFunction("L"); // HEL
    expect(getTile(0, 2).contains("L"));
    inputFunction("L"); // HELL
    expect(getTile(0, 3).contains("L"));
    inputFunction("O"); // HELLO
    expect(getTile(0, 4).contains("O"));

    inputFunction("BACKSPACE");
    // HELL
    expect(getTile(0, 0).contains("H"));
    expect(getTile(0, 1).contains("E"));
    expect(getTile(0, 2).contains("L"));
    expect(getTile(0, 3).contains("L"));
    expect(getTile(0, 4).should("not.contain", "O"));

    inputFunction("A");
    // HELLA
    expect(getTile(0, 0).contains("H"));
    expect(getTile(0, 1).contains("E"));
    expect(getTile(0, 2).contains("L"));
    expect(getTile(0, 3).contains("L"));
    expect(getTile(0, 4).contains("A"));

    inputFunction("BACKSPACE");
    inputFunction("BACKSPACE");
    // HEL
    expect(getTile(0, 0).contains("H"));
    expect(getTile(0, 1).contains("E"));
    expect(getTile(0, 2).contains("L"));
    expect(getTile(0, 3).should("not.contain", "L"));
    expect(getTile(0, 4).should("not.contain", "A"));
  };

  it("natural typing with physical keyboard", () => {
    naturalTypingSubroutine(typePhysicalLetter);
  });

  it("natural typing with virtual keyboard", () => {
    naturalTypingSubroutine(clickVirtualKey);
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

  it("for incomplete inputs", () => {
    cy.visit("http://localhost:8000");
    typePhysicalLetter("A");
    typePhysicalLetter("B");
    typePhysicalLetter("C");
    expect(getTile(0, 0).should("have.class", "inputted"));
    expect(getTile(0, 1).should("have.class", "inputted"));
    expect(getTile(0, 2).should("have.class", "inputted"));
    expect(getTile(0, 3).should("not.have.class", "inputted"));
    expect(getTile(0, 4).should("not.have.class", "inputted"));
  });
});

describe("Word selection via URL", () => {
  it("defaults to HELLO", () => {
    cy.visit("http://localhost:8000");
    inputGuessAndHitEnter("HELLO", "physically");
    [0, 1, 2, 3, 4].forEach((letterIndex) => {
      expect(tileIsColor(getTile(0, letterIndex), "green"));
    });
  });

  it("can be set", () => {
    cy.visit("http://localhost:8000?word=WORLD");
    inputGuessAndHitEnter("WORLD", "physically");
    [0, 1, 2, 3, 4].forEach((letterIndex) => {
      expect(tileIsColor(getTile(0, letterIndex), "green"));
    });
  });
});
