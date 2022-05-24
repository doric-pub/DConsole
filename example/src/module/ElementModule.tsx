import { Color, Group } from "doric";
import { DCModule } from "./dcModule";

type ElementModel = {};

export class ElementModule extends DCModule<ElementModel> {
  title() {
    return "Element";
  }
  state() {
    return [];
  }
  build(group: Group) {
    group.backgroundColor = Color.YELLOW;
  }
  onAttached(state: ElementModel) {}
  onBind(state: ElementModel) {}
}
