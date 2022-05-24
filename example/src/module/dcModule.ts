import { BridgeContext, Group, Setter } from "doric";

export abstract class DCModule<T> {
  context: BridgeContext;
  _state: T;
  constructor(context: BridgeContext) {
    this.context = context;
    this._state = this.state();
  }
  abstract title(): string;
  abstract state(): T;
  abstract build(group: Group): void;
  abstract onAttached(state: T): void;
  abstract onBind(state: T): void;

  updateState(setter: Setter<T>) {
    setter(this._state);
    this.onBind(this._state);
  }
}
