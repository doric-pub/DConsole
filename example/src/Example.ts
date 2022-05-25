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
import { demoPlugin } from "dconsole";
import { openDConsole } from "./dConsole";
import { CounterDemo } from "./CounterDemo";

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
        text: "Click to call native plugin",
        textSize: 20,
        backgroundColor: Color.parse("#70a1ff"),
        textColor: Color.WHITE,
        onClick: async () => {
          log("Hello,Console");
          logw("Hello,Console");
          loge("Hello,Console");
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
      text({
        text: "State",
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
