import {
  jsx,
  BridgeContext,
  Color,
  Panel,
  GestureContainer,
  Text,
  createRef,
  SwipeOrientation,
  layoutConfig,
  Gravity,
  LEFT,
  RIGHT,
  BOTTOM,
  TOP,
  Stack,
  VLayout,
  HLayout,
  ViewHolder,
  Group,
  ViewModel,
  log,
} from "doric";
import { loge } from "doric/lib/src/util/log";

type DCModel = {
  show: boolean;
  logRecords: { type: "d" | "w" | "e"; message: string }[];
};

class DCVH extends ViewHolder {
  containerRef = createRef<Stack>();
  contentRef = createRef<Text>();
  build(root: Group) {
    <Stack
      ref={this.containerRef}
      hidden={true}
      alpha={0.5}
      parent={root}
      layoutConfig={layoutConfig().most()}
      backgroundColor={Color.parse("#bdc3c7")}
    >
      <VLayout
        layoutConfig={layoutConfig()
          .mostWidth()
          .fitHeight()
          .configAlignment(Gravity.Bottom)
          .configMargin({ bottom: 20 })}
        space={1}
      >
        <HLayout
          layoutConfig={layoutConfig().fitWidth().justHeight()}
          height={30}
          gravity={Gravity.CenterY}
          space={1}
        >
          <Text
            layoutConfig={layoutConfig().fitWidth().mostHeight()}
            padding={{ left: 20, right: 20 }}
            backgroundColor={Color.WHITE}
          >
            Log
          </Text>
          <Text
            layoutConfig={layoutConfig().fitWidth().mostHeight()}
            padding={{ left: 20, right: 20 }}
            backgroundColor={Color.WHITE}
          >
            Element
          </Text>
          <Text
            layoutConfig={layoutConfig().fitWidth().mostHeight()}
            padding={{ left: 20, right: 20 }}
            backgroundColor={Color.WHITE}
          >
            VMState
          </Text>
          <Text
            layoutConfig={layoutConfig().fitWidth().mostHeight()}
            padding={{ left: 20, right: 20 }}
            backgroundColor={Color.WHITE}
          >
            Trace
          </Text>
        </HLayout>
        <HLayout
          layoutConfig={layoutConfig().mostWidth().justHeight()}
          height={300}
          backgroundColor={Color.WHITE}
          gravity={Gravity.CenterY}
        >
          <Text ref={this.contentRef}></Text>
        </HLayout>
      </VLayout>
    </Stack>;
  }
}

class DCVM extends ViewModel<DCModel, DCVH> {
  onAttached(state: DCModel, vh: DCVH) {
    vh.containerRef.current.onClick = () => {
      this.updateState((state) => (state.show = false));
    };
  }
  onBind(state: DCModel, vh: DCVH) {
    vh.containerRef.current.hidden = !state.show;
    vh.contentRef.current.text = state.logRecords.length + "";
  }
}

export function openDConsole(context: BridgeContext) {
  const panel = context.entity as Panel;
  const originBuild = (panel as any)["__build__"];
  const originDestroy = (panel as any)["__onDestroy__"];
  const global = new Function("return this")();
  const nativeLog = global["nativeLog"];
  const btnRef = createRef<GestureContainer>();
  const vm = new DCVM(
    {
      show: false,
      logRecords: [],
    },
    new DCVH()
  );
  vm.context = context;
  global["nativeLog"] = function () {
    const args = [];
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    if (!!vm.getViewHolder().containerRef.current) {
      vm.updateState((state) =>
        state.logRecords.push({
          type: arguments[0] as "d" | "w" | "e",
          message: arguments[1] as string,
        })
      );
    } else {
      vm.getState().logRecords.push({
        type: arguments[0] as "d" | "w" | "e",
        message: arguments[1] as string,
      });
    }
    return Reflect.apply(nativeLog, undefined, args);
  };
  (panel as any)["__build__"] = (frame: any) => {
    Reflect.apply(originBuild, panel, [frame]);

    <GestureContainer
      ref={btnRef}
      parent={panel.getRootView()}
      backgroundColor={Color.parse("#2ecc71")}
      layoutConfig={layoutConfig()
        .fit()
        .configAlignment(Gravity.Right.bottom())
        .configMargin({
          bottom: 80,
        })}
      onClick={() => {
        vm.updateState((state) => (state.show = true));
      }}
      onTouchDown={() => {
        btnRef.current.backgroundColor = Color.parse("#16a085");
      }}
      onTouchCancel={() => {
        btnRef.current.backgroundColor = Color.parse("#2ecc71");
      }}
      onTouchUp={() => {
        btnRef.current.backgroundColor = Color.parse("#2ecc71");
      }}
      onSwipe={(orientation: SwipeOrientation) => {
        const margin = {
          bottom: 80,
        };
        const gravity = btnRef.current.layoutConfig?.alignment ?? Gravity.Left;
        if (orientation === SwipeOrientation.RIGHT) {
          gravity.val = gravity.val ^ LEFT;
          btnRef.current.layoutConfig = layoutConfig()
            .fit()
            .configAlignment(gravity.right())
            .configMargin(margin);
        } else if (orientation === SwipeOrientation.LEFT) {
          gravity.val = gravity.val ^ RIGHT;

          btnRef.current.layoutConfig = layoutConfig()
            .fit()
            .configAlignment(gravity.left())
            .configMargin(margin);
        }

        if (orientation === SwipeOrientation.BOTTOM) {
          gravity.val = gravity.val ^ TOP;
          btnRef.current.layoutConfig = layoutConfig()
            .fit()
            .configAlignment(gravity.bottom())
            .configMargin(margin);
        } else if (orientation === SwipeOrientation.TOP) {
          gravity.val = gravity.val ^ BOTTOM;

          btnRef.current.layoutConfig = layoutConfig()
            .fit()
            .configAlignment(gravity.top())
            .configMargin(margin);
        }
      }}
    >
      <Text
        padding={{ left: 15, right: 15, top: 10, bottom: 10 }}
        alpha={0.6}
        textColor={Color.WHITE}
        fontStyle={"bold"}
      >
        dConsole
      </Text>
    </GestureContainer>;
    vm.attach(panel.getRootView());
  };

  (panel as any)["__onDestroy__"] = () => {
    global["nativeLog"] = nativeLog;
    Reflect.apply(originDestroy, panel, []);
  };
}
