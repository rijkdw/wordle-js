import {
  clickVirtualKey,
  getTile,
  inputGuessAndHitEnter,
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
    // expect(tileIsColor(getTile(0, 0), "yellow"));
    // expect(tileIsColor(getTile(0, 1), "grey"));
    // expect(tileIsColor(getTile(0, 2), "grey"));
    // expect(tileIsColor(getTile(0, 3), "grey"));
    // expect(tileIsColor(getTile(0, 4), "grey"));

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
  it("multiple guesses", () => {
    cy.visit("http://localhost:8000?word=WHISK");
    inputGuessAndHitEnter("HELLO", "physically");
  });
});
