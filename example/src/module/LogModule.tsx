import {
  Color,
  jsx,
  createRef,
  Group,
  Panel,
  List,
  layoutConfig,
  ListItem,
  Text,
  Gravity,
  Stack,
} from "doric";
import { DCModule } from "./dcModule";

type LogModel = { type: "d" | "w" | "e"; message: string }[];

export class LogModule extends DCModule<LogModel> {
  listRef = createRef<List>();
  title() {
    return "Log";
  }
  state() {
    return [];
  }
  build(group: Group) {
    group.backgroundColor = Color.RED;
    <List
      ref={this.listRef}
      parent={group}
      layoutConfig={layoutConfig().most()}
    />;
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
    this.listRef.current.renderItem = (i) => {
      return (
        <ListItem layoutConfig={layoutConfig().mostWidth().fitHeight()}>
          <Text
            layoutConfig={layoutConfig().mostWidth().fitHeight()}
            padding={{ left: 5, top: 5, right: 5, bottom: 5 }}
            textColor={
              state[i].type === "e"
                ? Color.parse("#e74c3c")
                : state[i].type === "w"
                ? Color.parse("#f1c40f")
                : Color.BLACK
            }
            textAlignment={Gravity.CenterY.left()}
            textSize={12}
          >
            {state[i].message}
          </Text>
          <Stack
            layoutConfig={layoutConfig().mostWidth().justHeight()}
            height={0.5}
            backgroundColor={Color.parse("#bdc3c7")}
          />
        </ListItem>
      ) as ListItem;
    };
  }
  onBind(state: LogModel) {
    this.listRef.current.itemCount = state.length;
  }
}
