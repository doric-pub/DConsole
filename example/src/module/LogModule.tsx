import { Color, jsx, createRef, Group, Text, Panel } from "doric";
import { DCModule } from "./dcModule";

type LogModel = { type: "d" | "w" | "e"; message: string }[];

export class LogModule extends DCModule<LogModel> {
  contentRef = createRef<Text>();
  title() {
    return "Log";
  }
  state() {
    return [];
  }
  build(group: Group) {
    group.backgroundColor = Color.RED;
    <Text ref={this.contentRef} parent={group}></Text>;
  }
  onAttached(state: LogModel) {
    const panel = context.entity as Panel;
    const originDestroy = (panel as any)["__onDestroy__"];
    const global = new Function("return this")();
    const nativeLog = global["nativeLog"];
    const self = this;
    global["nativeLog"] = function () {
      const args = [];
      for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      self.updateState((state) =>
        state.push({
          type: arguments[0] as "d" | "w" | "e",
          message: arguments[1] as string,
        })
      );
      return Reflect.apply(nativeLog, undefined, args);
    };

    (panel as any)["__onDestroy__"] = () => {
      global["nativeLog"] = nativeLog;
      Reflect.apply(originDestroy, panel, []);
    };
  }
  onBind(state: LogModel) {
    this.contentRef.current.text = state.length + "";
  }
}
