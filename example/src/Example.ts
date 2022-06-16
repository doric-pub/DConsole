import {
  Panel,
  Group,
  vlayout,
  layoutConfig,
  Gravity,
  text,
  Color,
  navbar,
  modal,
  AssetsResource,
  image,
  log,
  loge,
  logw,
  navigator,
} from "doric";
import { openDConsole } from "./dConsole";
import { CounterDemo } from "./CounterDemo";
import { GestureContainerDemo } from "./GestureContainerDemo";

@Entry
class Example extends Panel {
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
          log("Hello, Console");
          logw("Hello, Console");
          loge("Hello, Console");
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
          navigator(this.context).push(GestureContainerDemo)
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
          log("mvvm state");
          logw("mvvm state");
          loge("mvvm state");
          navigator(this.context).push(CounterDemo)
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
    ])
      .apply({
        layoutConfig: layoutConfig().fit().configAlignment(Gravity.CenterX),
        space: 20,
        gravity: Gravity.Center,
      })
      .in(rootView);
  }
}
