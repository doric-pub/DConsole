import {
  Align,
  Color,
  createRef,
  FlexDirection,
  FlexLayout,
  GestureContainer,
  Gravity,
  Group,
  jsx,
  Justify,
  layoutConfig,
  List,
  ListItem,
  modal,
  Stack,
  Text,
  VLayout,
  VMPanel,
} from "doric";
import { DCModule } from "./dcModule";
import { Map } from "immutable";
import Immutable from "immutable";
import { separatorColor } from "./utils";

type StateModel = Map<string, any>[];

export class StateModule extends DCModule<StateModel> {
  history: Map<string, any>[] = [];
  listRef = createRef<List>();
  recordMax = 100;

  title(): string {
    return "State";
  }

  state(): StateModel {
    return [];
  }

  onShow(): void {
    this.resetList();
  }

  build(group: Group): void {
    <VLayout parent={group} layoutConfig={layoutConfig().most()}>
      <List
        layoutConfig={layoutConfig().mostWidth().justHeight().configWeight(1)}
        backgroundColor={Color.WHITE}
        ref={this.listRef}
      />
      <FlexLayout
        layoutConfig={layoutConfig()
          .mostWidth()
          .justHeight()
          .configMargin({ top: 5, bottom: 5 })}
        height={30}
        backgroundColor={Color.parse("#ecf0f1")}
        flexConfig={{
          flexDirection: FlexDirection.ROW,
          justifyContent: Justify.SPACE_EVENLY,
          alignContent: Align.FLEX_END,
        }}
      >
        {this.bottomButtons()}
      </FlexLayout>
    </VLayout>;
  }

  bottomButtons() {
    const btnTitles = ["Undo", "Clear"];
    const btns: any[] = [];
    const self = this;
    btnTitles.forEach((title, index) => {
      const btnRef = createRef<GestureContainer>();
      const btn = (
        <GestureContainer
          backgroundColor={Color.parse("#2ecc71")}
          ref={btnRef}
          height={30}
          layoutConfig={layoutConfig().fitWidth().justHeight()}
          corners={15}
          onClick={() => {
            if (title === "Undo") {
              if (self.history.length <= 1) {
                modal(this.context).toast(`当前状态不可再撤销！`);
                return;
              }
              self.history.pop();
              self.resetList();
              const panel = this.context.entity;
              if (panel instanceof VMPanel) {
                const vm = panel.getViewModel();
                if (vm && Reflect.has(vm, "viewHolder")) {
                  const vh = Reflect.get(vm, "viewHolder");
                  const onBindFunc = (vm as any)["onBind"];
                  const state = self.history[self.history.length - 1]
                    .get("value")
                    .toJS();
                  Reflect.set(vm, "state", state);
                  Reflect.apply(onBindFunc, vm, [state, vh]);
                }
              }
            } else if (title === "Clear") {
              if (self.history.length == 0) {
                modal(this.context).toast(`无需清除！`);
                return;
              }
              self.history.length = 0;
              self.resetList();
            }
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
        >
          <Text
            padding={{ left: 15, right: 15 }}
            textColor={Color.WHITE}
            fontStyle={"bold"}
            layoutConfig={layoutConfig().fit().configAlignment(Gravity.Center)}
          >
            {title}
          </Text>
        </GestureContainer>
      );
      btns.push(btn);
    });
    return btns;
  }

  onAttached(state: StateModel): void {
    this.resetList();
    const panel = this.context.entity;
    const self = this;
    if (panel instanceof VMPanel) {
      const vm = panel.getViewModel();
      if (vm && Reflect.has(vm, "onAttached")) {
        self.updateState((s) => {
          self.saveStateToHistory(panel.getState(), s, "默认数据");
        });
        const originUpdateState = (vm as any)["updateState"];
        (vm as any)["updateState"] = (setter: any) => {
          Reflect.apply(originUpdateState, vm, [setter]);
          self.updateState((s) => {
            self.saveStateToHistory(vm.getState(), s, "updateState");
          });
        };
      }
    }
  }

  resetList() {
    this.listRef.current.reset();
    this.listRef.current.apply({
      itemCount: this.history.length,
      renderItem: (i) => {
        const model = this.history[i];
        if (!model) return (<ListItem />) as ListItem;
        return (
          <ListItem
            layoutConfig={layoutConfig().mostWidth().fitHeight()}
            identifier={"state_cell"}
          >
            <Text
              layoutConfig={layoutConfig().mostWidth().fitHeight()}
              maxLines={0}
              padding={{ left: 5, top: 5, right: 5, bottom: 5 }}
              textAlignment={Gravity.CenterY.left()}
              textSize={12}
            >
              {`${model.get("action")}: ${JSON.stringify(model.get("value"))}`}
            </Text>
            <Stack
              layoutConfig={layoutConfig().mostWidth().justHeight()}
              height={0.5}
              backgroundColor={separatorColor}
            />
          </ListItem>
        ) as ListItem;
      },
    });
    if (this.history.length > 0) {
      this.listRef.current.scrolledPosition = this.history.length - 1;
    }
  }

  saveStateToHistory(stateObj: Object, s: StateModel, action: string) {
    const immutableMap = Immutable.fromJS(stateObj);
    const data = Immutable.Map({ action: action, value: immutableMap });
    this.history.push(data);
    if (this.history.length > this.recordMax) {
      this.history.splice(0, this.recordMax / 2);
    }
  }

  onBind(state: StateModel): void {
    this.listRef.current.itemCount = this.history.length;
    if (this.history.length > 0) {
      this.listRef.current.scrolledPosition = this.history.length - 1;
    }
  }
}
