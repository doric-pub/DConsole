import {
  Panel,
  Group,
  vlayout,
  layoutConfig,
  Gravity,
  text,
  Color,
  navbar,
  AssetsResource,
  image,
  log,
  loge,
  logw,
  navigator,
  hlayout,
} from "doric";
import { openDConsole } from "doric-console";
import { CounterDemo } from "./CounterDemo";
import { demoPlugin } from "./DemoPlugin";
import { GestureContainerDemo } from "./GestureContainerDemo";

@Entry
class Example extends Panel {
  subscribeId?: string;

  onCreate() {
    openDConsole(this.context);
  }

  onShow() {
    navbar(context).setTitle("Example");
  }

  build(rootView: Group) {
    vlayout([
      image({
        image: new AssetsResource("logo_doric.png"),
      }),
      text({
        text: "test LogModule",
        textSize: 20,
        backgroundColor: Color.parse("#70a1ff"),
        textColor: Color.WHITE,
        onClick: () => {
          log("Hello, DConsole");
          logw("Hello, DConsole");
          loge("Hello, DConsole");
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
      text({
        text: "test ElementModule",
        textSize: 20,
        backgroundColor: Color.parse("#70a1ff"),
        textColor: Color.WHITE,
        onClick: async () => {
          navigator(this.context).push(GestureContainerDemo);
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
      text({
        text: "test StateModule",
        textSize: 20,
        backgroundColor: Color.parse("#70a1ff"),
        textColor: Color.WHITE,
        onClick: async () => {
          log("mvvm state11");
          logw("mvvm state");
          loge("mvvm state");
          navigator(this.context).push(CounterDemo);
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
      hlayout(
        [
          text({
            text: "打开",
            textSize: 18,
            backgroundColor: Color.parse("#70a1ff"),
            textColor: Color.WHITE,
            onClick: async () => {
              demoPlugin(this.context).openDConsole();
            },
            height: 30,
            layoutConfig: layoutConfig().fitWidth().justHeight(),
            padding: { left: 15, right: 15 },
            corners: 15,
          }),
          text({
            text: "关闭",
            textSize: 18,
            backgroundColor: Color.parse("#70a1ff"),
            textColor: Color.WHITE,
            onClick: async () => {
              demoPlugin(this.context).closeDConsole();
            },
            height: 30,
            layoutConfig: layoutConfig().fitWidth().justHeight(),
            padding: { left: 15, right: 15 },
            corners: 15,
          }),
        ],
        {
          space: 30,
          height: 60,
          gravity: Gravity.CenterY,
          layoutConfig: layoutConfig()
            .fitWidth()
            .justHeight()
            .configMargin({ top: 10 }),
        }
      ),
    ])
      .apply({
        layoutConfig: layoutConfig()
          .fitHeight()
          .mostWidth()
          .configAlignment(Gravity.CenterX),
        space: 20,
        gravity: Gravity.Center,
      })
      .in(rootView);
  }
}
