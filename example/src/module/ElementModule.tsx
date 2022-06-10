import {
  AssetsResource,
  Color,
  createRef,
  Gravity,
  Group,
  HLayout,
  Image,
  jsx,
  layoutConfig,
  List,
  ListItem,
  log,
  loge,
  logw,
  NativeViewModel,
  Panel,
  ScaleType,
  Stack,
  Superview,
  Text,
  View,
} from "doric";
import { identifier, purpRedColor } from "../utils";
import { DCModule } from "./dcModule";

type ElementModel = {
  data?: NativeViewModel;
  level: number;
  unfold: boolean;
  displayChildren: string[];
};

type Elements = ElementModel[];

export class ElementModule extends DCModule<Elements> {
  // 所有的元素
  allElements: ElementModel[] = [];
  listRef = createRef<List>();
  deleteEleMap: Map<string, Elements> = new Map();

  title() {
    return "Element";
  }

  state() {
    return [];
  }

  build(group: Group) {
    group.backgroundColor = Color.YELLOW;
    <List
      parent={group}
      ref={this.listRef}
      layoutConfig={layoutConfig().most()}
    ></List>;
  }

  onAttached(state: Elements) {
    this.allElements.length = 0;
    const panel = this.context.entity;
    const self = this;
    if (panel instanceof Panel) {
      const root = panel.getRootView();
      this.recordView(root, 0);
    }

    this._state.length = 0;
    this._state = this._state.concat(this.allElements);
    this.updateState((s) => {
      logw(`最终所有元素: ${s.length}:\n ${JSON.stringify(s)}`);
    });
  }

  findElementById(id: string, source: ElementModel[]) {
    return source.find((value) => {
      return value.data?.id === id;
    });
  }

  ///  点击箭头 展开 or 收齐
  clickArrowImageAt(element: ElementModel) {
    // loge(`click element 刷新界面 = ${JSON.stringify(element)}`);
    if (element.unfold) {
      // 收齐
      let fromIndex = this._state.indexOf(element);
      let level = element.level;
      // logw(`收齐 fromIndex: ${fromIndex}, level: ${level}`);
      element.unfold = false;
      var toIndex = fromIndex;
      for (let index = fromIndex + 1; index < this._state.length; index++) {
        const ele = this._state[index];
        toIndex = index;
        if (ele.level > level) {
          // logw(`>> ele[${index}] : ${ele.data?.type}, toIndex=${toIndex}`);
        } else {
          // logw(`break ele[${index}] : ${ele.data?.type}, toIndex=${toIndex}`);
          toIndex--;
          break;
        }
      }
      let count = toIndex - fromIndex;
      logw(`收齐 toIndex: ${toIndex}, count = ${count}`);
      const deleteElements = this._state.splice(fromIndex + 1, count);
      if (element.data?.id) {
        this.deleteEleMap.set(element.data?.id, deleteElements);
      }
      this.updateState((s) => {});
    } else {
      // 展开
      element.unfold = true;
      let fromIndex = this._state.indexOf(element);
      if (element.data?.id) {
        let insertElements = this.deleteEleMap.get(element.data?.id);
        if (insertElements) {
          logw(`插入: ${JSON.stringify(insertElements)}`);
          this._state.splice(fromIndex + 1, 0, ...insertElements);
          this.updateState((s) => {});
        }
      }
    }
  }

  recordView(view: View, level: number) {
    const nativeViewModel = view.nativeViewModel;
    if (view.tag === identifier) {
      loge(
        `view.tag === ${view.tag},  ${nativeViewModel.type} (${nativeViewModel.id})`
      );
      return;
    }
    const ele: ElementModel = {
      data: nativeViewModel,
      level: level,
      unfold: true,
      displayChildren: [],
    };
    this.allElements.push(ele);
    let children = nativeViewModel.props["children"];
    if (children && children instanceof Array && children.length > 0) {
      (children as string[]).forEach((viewId) => {
        let subView = (view as Superview).subviewById(viewId);
        if (subView != undefined && view.tag != identifier) {
          ele.displayChildren.push(subView.nativeViewModel.id);
          this.recordView(subView, level + 1);
        }
      });
    }
  }

  cellWith(element: ElementModel, index: number) {
    const leftPadding = element.level * 10;
    const isHiddenArrow = element.displayChildren.length === 0;
    const arrowImage = (
      <Image
        layoutConfig={layoutConfig().just().configAlignment(Gravity.Center)}
        width={10}
        height={10}
        scaleType={ScaleType.ScaleAspectFit}
        image={new AssetsResource("console_arrow")}
        rotation={element.unfold ? 0.5 : 0}
        hidden={isHiddenArrow}
      ></Image>
    );
    return (
      <ListItem
        layoutConfig={layoutConfig().mostWidth().fitHeight()}
        identifier={"element_cell"}
      >
        <HLayout
          layoutConfig={layoutConfig().mostWidth().fitHeight()}
          gravity={Gravity.CenterY.left()}
        >
          <Stack
            layoutConfig={layoutConfig().just()}
            width={26}
            height={26}
            left={leftPadding}
            onClick={() => {
              if (arrowImage.hidden === false) {
                this.clickArrowImageAt(element);
              }
              // const duration = 300;
              // setTimeout(() => {
              //   loge(`click element 刷新界面= ${JSON.stringify(element)}`);
              // }, duration);
              // animate(this.context)({
              //   animations: () => {
              //     if (element.unfold) {
              //       arrowImage.rotation = 0;
              //     } else {
              //       arrowImage.rotation = 0.5;
              //     }
              //     element.unfold = !element.unfold;
              //   },
              //   duration: duration,
              // });
            }}
          >
            {arrowImage}
          </Stack>
          <Text
            layoutConfig={layoutConfig().mostWidth().fitHeight()}
            maxLines={-1}
            textColor={purpRedColor}
            fontStyle={"bold"}
            padding={{ left: 0, top: 5, right: 5, bottom: 5 }}
            textAlignment={Gravity.CenterY.left()}
            textSize={12}
          >
            {element.data?.type}
          </Text>
        </HLayout>
        <Stack
          layoutConfig={layoutConfig().mostWidth().justHeight()}
          height={0.5}
          backgroundColor={Color.parse("#bdc3c7")}
        />
      </ListItem>
    ) as ListItem;
  }

  onBind(state: Elements) {
    // logw(
    //   `onBind所有元素: ${this._state.length}:\n ${JSON.stringify(this._state)}`
    // );
    this.listRef.current.reset();
    this.listRef.current.apply({
      itemCount: this._state.length,
      renderItem: (i) => {
        const element = this._state[i];
        return this.cellWith(element, i);
      },
    });
  }
}
