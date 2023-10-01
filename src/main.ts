import { Model } from "./model";
import { Controller } from "./controller";
import { View } from "./view";

function getWord() {
  const searchParams = new URLSearchParams(window.location.search);
  let word = searchParams.get("word");
  if (word === null) {
    word = "HELLO";
  }
  return word.toUpperCase();
}

const model = new Model(getWord());
const view = new View();
const controller = new Controller(model, view);
