import {
  animate,
  Color,
  createRef,
  GradientColor,
  Gravity,
  Group,
  HLayout,
  jsx,
  layoutConfig,
  List,
  ListItem,
  logw,
  NativeViewModel,
  notification,
  Panel,
  Root,
  Scroller,
  SlideItem,
  Slider,
  Stack,
  Superview,
  Text,
  TruncateAt,
  View,
  VLayout,
} from "doric";
import {
  donConsoleNotiName,
  greenThemeColor,
  identifier,
  purpRedColor,
  separatorColor,
} from "./utils";
import { DCModule } from "./dcModule";

type ElementModel = {
  data?: NativeViewModel;
  viewId: string;
  level: number;
  unfold: boolean;
  displayChildren: string[];
  viewProperty: Object; // view的属性值
  view?: View;
};

type Elements = ElementModel[];

export class ElementModule extends DCModule<Elements> {
  allElements: ElementModel[] = [];
  listRef = createRef<List>();
  deleteEleMap: Map<string, Elements> = new Map();
  isAnimating: boolean = false;
  sliderRef = createRef<Slider>();
  detailElement?: ElementModel = undefined;
  textRef = createRef<Text>();
  realGroup?: Group;
  subscribeId?: string;
  isShowing: boolean = true;

  title() {
    return "Element";
  }

  state() {
    return [];
  }

  onShow(): void {
    if (this.isShowing === true && this.allElements.length > 0) {
      return;
    }
    this.realBuild();
    this.readData();
  }

  realBuild() {
    if (!this.realGroup) return;
    this.realGroup.removeAllChildren();
    const list = (
      <List ref={this.listRef} layoutConfig={layoutConfig().most()}></List>
    );
    <Slider
      ref={this.sliderRef}
      parent={this.realGroup}
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

  build(group: Group) {
    this.realGroup = group;
  }

  detailView() {
    var jsonString = "";
    if (this.detailElement != undefined) {
      jsonString = this.detailDisplayString(this.detailElement);
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
    notification(this.context)
      .subscribe({
        name: donConsoleNotiName,
        callback: (data) => {
          const id = data.id;
          if (id != undefined && id === this.context.id) {
            if (data.isShowing === false) {
              this.deleteEleMap.clear();
              this.isShowing = false;
            }
          }
        },
      })
      .then((e) => {
        this.subscribeId = e;
      });
    this.onDestroy = () => {
      if (this.subscribeId) {
        notification(this.context).unsubscribe(this.subscribeId);
      }
      this.deleteEleMap.clear();
    };
  }

  readData() {
    this.allElements.length = 0;
    this.deleteEleMap.clear();
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
      let viewId =
        element.viewId.length > 0 ? element.viewId : element.data?.id;
      if (viewId) {
        this.deleteEleMap.set(viewId, deleteElements);
      }
      this.updateState((s) => {});
    } else {
      // 展开
      element.unfold = true;
      let fromIndex = this._state.indexOf(element);
      let viewId =
        element.viewId.length > 0 ? element.viewId : element.data?.id;
      if (viewId) {
        let insertElements = this.deleteEleMap.get(viewId);
        if (insertElements) {
          this._state.splice(fromIndex + 1, 0, ...insertElements);
          this.updateState((s) => {});
        }
      }
    }
  }

  recordView(view: View, level: number) {
    // nativeViewModel暂时先记录
    const lastModel = view.nativeViewModel;
    const modelString = JSON.stringify(lastModel);
    const nativeViewModel = JSON.parse(modelString);
    if (view.tag === identifier) {
      // 不要显示DConsole面板的元素
      return;
    }
    const propMap = new Map();
    Reflect.ownKeys(view).forEach((key) => {
      let value = Reflect.get(view, key);
      propMap.set(key, value);
    });
    var viewId = "";
    if (propMap.has("viewId")) {
      viewId = propMap.get("viewId");
    }
    const ele: ElementModel = {
      data: nativeViewModel,
      viewId,
      level: level,
      unfold: true,
      displayChildren: [],
      viewProperty: Object.fromEntries(propMap),
      view: view,
    };
    this.allElements.push(ele);

    if (view instanceof Group) {
      if (!propMap.has("children")) {
        return;
      }
      let children = propMap.get("children");
      if (children && children instanceof Array && children.length > 0) {
        children.forEach((subView) => {
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

  cellWith(element: ElementModel) {
    const leftPadding = element.level * 10;
    const isHiddenArrow = element.displayChildren.length === 0;
    const arrowImage = (
      <Text
        layoutConfig={layoutConfig()
          .fit()
          .configAlignment(Gravity.Center)
          .configMargin({ right: -4 })}
        hidden={isHiddenArrow}
        textSize={10}
        rotation={element.unfold ? 2 : 1.5}
      >
        ▼
      </Text>
    );

    var bgColor = Color.TRANSPARENT as Color | GradientColor;
    if (element.view?.backgroundColor !== undefined) {
      bgColor = element.view?.backgroundColor;
    }
    var text = "";
    var fontStyle = "normal" as
      | "normal"
      | "bold"
      | "italic"
      | "bold_italic"
      | undefined;
    var textColor = Color.TRANSPARENT as Color | GradientColor | undefined;
    if (element.view !== undefined && element.view instanceof Text) {
      if (element.view.text != undefined) {
        text = element.view.text;
        textColor = element.view.textColor;
        fontStyle = element.view.fontStyle;
      }
    }
    var layoutString = "";
    if (Reflect.has(element.viewProperty, "layoutConfig")) {
      const layoutConfig = Reflect.get(element.viewProperty, "layoutConfig");
      var widthSpec = 1;
      var heightSpec = 1;
      logw(`widthSpec: ${widthSpec}, heightSpec : ${heightSpec}`);
      if (Reflect.has(layoutConfig, "widthSpec")) {
        widthSpec = Reflect.get(layoutConfig, "widthSpec");
      }
      if (Reflect.has(layoutConfig, "heightSpec")) {
        heightSpec = Reflect.get(layoutConfig, "heightSpec");
      }
      layoutString = `（${widthSpec} , ${heightSpec}）`;
    }
    const indicator = (
      <Stack
        layoutConfig={layoutConfig().just()}
        width={40}
        height={20}
        backgroundColor={bgColor}
        border={{
          width: bgColor === Color.TRANSPARENT ? 0.5 : 0,
          color: Color.BLACK,
        }}
        onClick={async () => {
          if (
            !this.isAnimating &&
            element !== undefined &&
            element.view !== undefined
          ) {
            if (
              Environment.platform === "Android" &&
              element.view instanceof Root
            ) {
              return;
            }
            const border = element.view.border;
            this.isAnimating = true;
            await animate(this.context)({
              animations: () => {
                if (element.view !== undefined) {
                  element.view.apply({
                    border: {
                      width: 5,
                      color: Color.GREEN,
                    },
                  });
                }
              },
              duration: 300,
            });
            setTimeout(() => {
              animate(this.context)({
                animations: () => {
                  element.view?.apply({
                    border:
                      border === undefined
                        ? {
                            width: 0,
                            color: Color.TRANSPARENT,
                          }
                        : border,
                  });
                },
                duration: 100,
              }).then(() => {
                this.isAnimating = false;
              });
            }, 600);
          }
        }}
      >
        <Text
          layoutConfig={layoutConfig().most()}
          maxLines={1}
          textColor={textColor}
          fontStyle={fontStyle}
          backgroundColor={bgColor}
          textAlignment={Gravity.Center}
          truncateAt={TruncateAt.Clip}
          textSize={11}
          text={text}
        ></Text>
      </Stack>
    );
    return (
      <ListItem
        layoutConfig={layoutConfig().mostWidth().justHeight()}
        backgroundColor={Color.WHITE}
        height={30}
        identifier={"element_cell"}
        onClick={() => {
          this.displayElementDetail(element);
        }}
      >
        <HLayout
          layoutConfig={layoutConfig().most()}
          gravity={Gravity.CenterY.left()}
          padding={{ right: 10 }}
        >
          <Stack
            layoutConfig={layoutConfig().just()}
            width={24}
            height={26}
            left={leftPadding}
            onClick={async () => {
              if (!this.isAnimating && arrowImage.hidden === false) {
                this.isAnimating = true;
                const duration = 120;
                await animate(this.context)({
                  animations: () => {
                    arrowImage.rotation = element.unfold ? 1.5 : 2;
                  },
                  duration: duration,
                });
                this.clickArrowImageAt(element);
                this.isAnimating = false;
              }
            }}
          >
            {arrowImage}
          </Stack>
          <Text
            layoutConfig={layoutConfig().fit()}
            maxLines={1}
            textColor={purpRedColor}
            fontStyle={"bold"}
            backgroundColor={Color.WHITE}
            textAlignment={Gravity.CenterY.left()}
            textSize={12}
          >
            {element.data?.type}
          </Text>

          <Text
            layoutConfig={layoutConfig().fit().configMargin({ left: 5 })}
            maxLines={1}
            textColor={Color.BLACK}
            backgroundColor={Color.WHITE}
            textAlignment={Gravity.CenterY.left()}
            textSize={10}
          >
            {layoutString}
          </Text>

          <Stack
            layoutConfig={layoutConfig()
              .justHeight()
              .mostWidth()
              .configWeight(1)}
            height={26}
            backgroundColor={Color.WHITE}
          ></Stack>

          {indicator}
        </HLayout>
        <Stack
          layoutConfig={layoutConfig()
            .mostWidth()
            .justHeight()
            .configAlignment(Gravity.Bottom)}
          height={0.5}
          backgroundColor={separatorColor}
        />
      </ListItem>
    ) as ListItem;
  }

  private displayElementDetail(element: ElementModel) {
    this.detailElement = element;
    this.textRef.current.text = this.detailDisplayString(element);
    this.sliderRef.current.slidePage(this.context, 1, true);
  }

  private detailDisplayString(element: ElementModel): string {
    let arr: Object[] = [];
    const detailStr = JSON.stringify(
      element.viewProperty,
      (key, value) => {
        // fix: TypeError: JSON.stringify cannot serialize cyclic structures.
        if (value != null && typeof value == "object") {
          if (arr.indexOf(value) >= 0) {
            return;
          }
          arr.push(value);
        }
        // "children" 数据太长，影响阅读，暂时不展示children、content、superview等信息
        if (key === "children" || key === "content" || key === "superview")
          return;
        return value;
      },
      4
    );
    return detailStr;
  }

  onBind(state: Elements) {
    if (this.sliderRef) {
      this.sliderRef.current.apply({
        itemCount: 2,
      });
    }
    this.listRef.current.reset();
    this.listRef.current.apply({
      itemCount: this._state.length,
      renderItem: (i) => {
        const element = this._state[i];
        return this.cellWith(element);
      },
    });
  }
}
