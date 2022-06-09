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
  ClassType,
  View,
  keyboard,
} from "doric";
import { DCModule } from "./module/dcModule";
import { ElementModule } from "./module/ElementModule";
import { LogModule } from "./module/LogModule";
import { RegistryModule } from "./module/RegistryModule";
import { StateModule } from "./module/StateModule";
import { identifier } from "./utils";

const DCM: ClassType<DCModule<any>>[] = [LogModule, ElementModule, StateModule, RegistryModule];

type DCModel = {
  show: boolean;
  selectedModule: DCModule<any>;
  dcModules: DCModule<any>[];
};

class DCVH extends ViewHolder {
  containerRef = createRef<Stack>();
  tabRef = createRef<HLayout>();
  contentRef = createRef<Stack>();
  build(root: Group) {
    <Stack
      ref={this.containerRef}
      tag={identifier}
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
          ref={this.tabRef}
        />
        <Stack
          layoutConfig={layoutConfig().mostWidth().justHeight()}
          height={300}
          ref={this.contentRef}
          backgroundColor={Color.WHITE}
          onClick={() => {}}
        />
      </VLayout>
    </Stack>;
  }
}

class DCVM extends ViewModel<DCModel, DCVH> {
  vRecord: Map<
    DCModule<any>,
    {
      title: View;
      content: View;
    }
  > = new Map();

  onAttached(state: DCModel, vh: DCVH) {
    vh.containerRef.current.onClick = () => {
      this.updateState((state) => (state.show = false));
    };
    state.dcModules.forEach((e) => {
      const title = (
        <Text
          layoutConfig={layoutConfig().fitWidth().mostHeight()}
          padding={{ left: 20, right: 20 }}
          backgroundColor={Color.WHITE}
          onClick={() => {
            this.updateState((state) => (state.selectedModule = e));
          }}
        >
          {e.title()}
        </Text>
      );
      const content = <Stack layoutConfig={layoutConfig().most()} />;
      vh.tabRef.current.addChild(title);
      vh.contentRef.current.addChild(content);
      this.vRecord.set(e, { title, content });
      e.build(content as Group);
      e.onAttached(e._state);
    });
  }
  onBind(state: DCModel, vh: DCVH) {
    this.vRecord.forEach((v, k) => {
      if (v.content.hidden !== !(k === state.selectedModule)) {
        v.content.hidden = !(k === state.selectedModule);
        if (v.content.hidden) {
          k.onHide();
        } else {
          k.onShow();
        }
      } else if (vh.containerRef.current.hidden !== !state.show) {
        if (k === state.selectedModule) {
          if (state.show) {
            k.onShow();
          } else {
            k.onHide();
          }
        }
      }
      v.title.backgroundColor =
        k === state.selectedModule ? Color.WHITE : Color.parse("#95a5a6");
    });
    vh.containerRef.current.hidden = !state.show;
  }
}

export function openDConsole(context: BridgeContext) {
  const panel = context.entity as Panel;
  const originBuild = (panel as any)["__build__"];
  const btnRef = createRef<GestureContainer>();
  const dcModules = DCM.map((e) => new e(context));
  const vm = new DCVM(
    {
      show: false,
      dcModules,
      selectedModule: dcModules[0],
    },
    new DCVH()
  );
  vm.context = context;
  (panel as any)["__build__"] = (frame: any) => {
    Reflect.apply(originBuild, panel, [frame]);

    <GestureContainer
      ref={btnRef}
      tag={identifier}
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
        textColor={Color.WHITE}
        fontStyle={"bold"}
      >
        dConsole
      </Text>
    </GestureContainer>;
    vm.attach(panel.getRootView());
    const destroyCallbacks: Function[] = [];
    const global = new Function("return this")();
    const originJSReleaseContext = global.doric.jsReleaseContext;
    global.doric.jsReleaseContext = (id: string) => {
      if (id === context.id) {
        vm.getState().dcModules.forEach((module) => module.onDestroy?.());
        destroyCallbacks.forEach((e) => e());
      }
      Reflect.apply(originJSReleaseContext, global.doric, [id]);
    };
    keyboard(context)
      .subscribe((data) => {
        if (Environment.platform === "iOS") {
          vm.getViewHolder().containerRef.current.translationY = -(
            data.bottomMargin + data.height
          );
        }
      })
      .then((subId) => {
        destroyCallbacks.push(() => {
          keyboard(context).unsubscribe(subId);
        });
      });
  };
}
