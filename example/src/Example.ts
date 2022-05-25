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
} from "doric";
import { demoPlugin } from "dconsole";
import { openDConsole } from "./dConsole";

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
        onClick: () => {
          log("Hello, Console");
          logw("Hello, Console");
          loge("Hello, Console");
        },
        layoutConfig: layoutConfig().fit(),
        padding: { left: 20, right: 20, top: 20, bottom: 20 },
      }),
    ])
      .apply({
        layoutConfig: layoutConfig().fit().configAlignment(Gravity.Center),
        space: 20,
        gravity: Gravity.Center,
      })
      .in(rootView);
  }
}
