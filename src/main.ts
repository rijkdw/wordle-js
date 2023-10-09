import { Controller } from "./controller";
import { Model } from "./model";
import { View } from "./view";

function getWord() {
  const searchParams = new URLSearchParams(window.location.search);
  let word = searchParams.get("word")?.substring(0, 5);
  if (word === null || word === undefined) {
    word = "HELLO";
  }
  return word.toUpperCase();
}

console.log(getWord());

const model = new Model(getWord());
const view = new View();
const controller = new Controller(model, view);
controller.init();
