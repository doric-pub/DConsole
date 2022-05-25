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
  VLayout,
  HLayout,
  Input,
} from "doric";
import { DCModule } from "./dcModule";

type LogModel = { type: "d" | "w" | "e" | "q" | "a"; message: string }[];

export class LogModule extends DCModule<LogModel> {
  listRef = createRef<List>();
  inputRef = createRef<Input>();
  title() {
    return "Log";
  }
  state() {
    return [];
  }
  build(group: Group) {
    <VLayout parent={group} layoutConfig={layoutConfig().most()}>
      <List
        ref={this.listRef}
        layoutConfig={layoutConfig().mostWidth().justHeight().configWeight(1)}
      />
      <HLayout
        layoutConfig={layoutConfig().mostWidth().justHeight()}
        height={50}
        gravity={Gravity.CenterY}
        padding={{ left: 15, right: 15 }}
      >
        <Input
          ref={this.inputRef}
          layoutConfig={layoutConfig().mostHeight().justWidth().configWeight(2)}
          backgroundColor={Color.parse("#ecf0f1")}
          textAlignment={Gravity.CenterY.left()}
        />
        <Text
          layoutConfig={layoutConfig().mostHeight().fitWidth()}
          padding={{ left: 15, right: 15 }}
          backgroundColor={Color.parse("#bdc3c7")}
          onClick={async () => {
            const text = await this.inputRef.current.getText(this.context);
            if (text?.length <= 0) {
              return;
            }
            this.inputRef.current.text = "";
            this.updateState((state) => {
              state.push({
                type: "q",
                message: `> ${text}`,
              });
            });
            try {
              const func = new Function(`return eval(${text})`);
              const ret = Reflect.apply(func, context.entity, []);
              this.updateState((state) => {
                state.push({
                  type: "a",
                  message: `< ${ret}`,
                });
              });
            } catch (e) {
              this.updateState((state) => {
                state.push({
                  type: "a",
                  message: `< ${e}`,
                });
              });
            }
            await this.inputRef.current.releaseFocus(this.context);
          }}
        >
          OK
        </Text>
      </HLayout>
    </VLayout>;
  }

  onHide() {
    this.inputRef.current.releaseFocus(this.context);
  }

  onAttached(state: LogModel) {
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
    this.onDestroy = () => {
      global["nativeLog"] = nativeLog;
    };
    this.listRef.current.renderItem = (i) => {
      return (
        <ListItem layoutConfig={layoutConfig().mostWidth().fitHeight()}>
          <Text
            layoutConfig={layoutConfig().mostWidth().fitHeight()}
            maxLines={-1}
            padding={{ left: 5, top: 5, right: 5, bottom: 5 }}
            textColor={(() => {
              switch (state[i].type) {
                case "e":
                  return Color.parse("#e74c3c");
                case "w":
                  return Color.parse("#f1c40f");
                case "q":
                  return Color.parse("#2980b9");
                case "a":
                  return Color.parse("#27ae60");
                default:
                  return Color.BLACK;
              }
            })()}
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
    this.listRef.current.scrolledPosition = state.length - 1;
  }
}
