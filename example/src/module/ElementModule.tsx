import {
  animate,
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
  NativeViewModel,
  Panel,
  ScaleType,
  Scroller,
  SlideItem,
  Slider,
  Stack,
  Superview,
  Text,
  View,
  VLayout,
} from "doric";
import { greenThemeColor, identifier, purpRedColor } from "../utils";
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
  isAnimating: boolean = false;
  sliderRef = createRef<Slider>();
  detailElement?: ElementModel = undefined;
  textRef = createRef<Text>(); // 用于显示元素详情

  title() {
    return "Element";
  }

  state() {
    return [];
  }

  build(group: Group) {
    group.backgroundColor = Color.WHITE;
    const list = (
      <List ref={this.listRef} layoutConfig={layoutConfig().most()}></List>
    );
    <Slider
      ref={this.sliderRef}
      parent={group}
      layoutConfig={layoutConfig().most()}
      backgroundColor={Color.WHITE}
      itemCount={2}
      scrollable={false}
      renderPage={(index) => {
        if (index == 0) {
          return (
            <SlideItem
              layoutConfig={layoutConfig().most()}
              identifier={"menu_cell"}
            >
              {list}
            </SlideItem>
          ) as SlideItem;
        } else {
          return (
            <SlideItem
              layoutConfig={layoutConfig().most()}
              identifier={"detail_cell"}
            >
              {this.detailView()}
            </SlideItem>
          ) as SlideItem;
        }
      }}
    ></Slider>;
  }

  detailView() {
    var jsonString = "";
    if (this.detailElement != undefined) {
      jsonString = JSON.stringify(this.detailElement.data, undefined, 4);
    }
    return (
      <VLayout layoutConfig={layoutConfig().most()}>
        <Stack
          layoutConfig={layoutConfig().mostWidth().justHeight()}
          height={40}
        >
          <Text
            layoutConfig={layoutConfig()
              .fit()
              .configAlignment(Gravity.Left.centerY())}
            textColor={greenThemeColor}
            fontStyle={"bold"}
            textSize={14}
            padding={{ left: 5, right: 15, top: 5, bottom: 5 }}
            onClick={() => {
              this.sliderRef.current.slidePage(this.context, 0, true);
            }}
          >
            返回
          </Text>
        </Stack>
        <Scroller
          layoutConfig={layoutConfig().most()}
          backgroundColor={Color.WHITE}
        >
          <Text
            ref={this.textRef}
            layoutConfig={layoutConfig().mostWidth().fitHeight()}
            maxLines={0}
            textSize={12}
            textAlignment={Gravity.Left}
          >
            {jsonString}
          </Text>
        </Scroller>
      </VLayout>
    );
  }

  onAttached(state: Elements) {
    this.onDestroy = () => {
      this.deleteEleMap.clear();
    };
    this.readData();
  }

  readData() {
    this.allElements.length = 0;
    const panel = this.context.entity;
    const self = this;
    if (panel instanceof Panel) {
      const root = panel.getRootView();
      self.recordView(root, 0);
    }
    this._state.length = 0;
    this._state = this._state.concat(this.allElements);
    this.updateState((s) => {});
  }

  ///  点击箭头 展开 or 收齐
  clickArrowImageAt(element: ElementModel) {
    if (element.unfold) {
      // 收齐
      let fromIndex = this._state.indexOf(element);
      let level = element.level;
      element.unfold = false;
      var toIndex = fromIndex;
      for (let index = fromIndex + 1; index < this._state.length; index++) {
        const ele = this._state[index];
        toIndex = index;
        if (ele.level <= level) {
          toIndex--;
          break;
        }
      }
      let count = toIndex - fromIndex;
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
          this._state.splice(fromIndex + 1, 0, ...insertElements);
          this.updateState((s) => {});
        }
      }
    }
  }

  recordView(view: View, level: number) {
    const lastModel = view.nativeViewModel;
    const modelString = JSON.stringify(lastModel);
    const nativeViewModel = JSON.parse(modelString);
    if (view.tag === identifier) {
      // 不要显示DConsole面板的元素
      return;
    }
    const ele: ElementModel = {
      data: nativeViewModel,
      level: level,
      unfold: true,
      displayChildren: [],
    };
    this.allElements.push(ele);
    if (view instanceof Group) {
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
    } else if (view instanceof Superview) {
      let subviews = view.allSubviews();
      if (subviews && subviews instanceof Array && subviews.length > 0) {
        subviews.forEach((view) => {
          if (view != undefined && view.tag != identifier) {
            ele.displayChildren.push(view.nativeViewModel.id);
            this.recordView(view, level + 1);
          }
        });
      }
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
        image={new AssetsResource("console_arrow.jpg")}
        rotation={element.unfold ? 0.5 : 0}
        hidden={isHiddenArrow}
      ></Image>
    );
    return (
      <ListItem
        layoutConfig={layoutConfig().mostWidth().fitHeight()}
        identifier={"element_cell"}
        onClick={() => {
          this.displayElementDetail(element);
        }}
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
              if (!this.isAnimating && arrowImage.hidden === false) {
                this.isAnimating = true;
                const duration = 120;
                setTimeout(() => {
                  this.clickArrowImageAt(element);
                  this.isAnimating = false;
                }, duration);
                animate(this.context)({
                  animations: () => {
                    if (element.unfold) {
                      arrowImage.rotation = 0;
                    } else {
                      arrowImage.rotation = 0.5;
                    }
                  },
                  duration: duration,
                });
              }
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

  displayElementDetail(element: ElementModel) {
    this.detailElement = element;
    this.textRef.current.text = JSON.stringify(
      this.detailElement.data,
      undefined,
      4
    );
    this.sliderRef.current.slidePage(this.context, 1, true);
  }

  onBind(state: Elements) {
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
