import {
  Align,
  AssetsResource,
  Color,
  createRef,
  gravity,
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
};

export class ElementModule extends DCModule<ElementModel> {
  // 所有的元素
  allElement: ElementModel[] = [];
  listRef = createRef<List>();

  title() {
    return "Element";
  }

  state() {
    return { level: 0 };
  }

  build(group: Group) {
    group.backgroundColor = Color.YELLOW;
    <List
      parent={group}
      ref={this.listRef}
      layoutConfig={layoutConfig().most()}
    ></List>;
  }

  onAttached(state: ElementModel) {
    log(`Element onAttached`);
    this.allElement.length = 0;
    const panel = this.context.entity;
    const self = this;
    if (panel instanceof Panel) {
      const root = panel.getRootView();
      this.logView(root, 0);
      // loge(`root信息: ${root.nativeViewModel.type} (${root.nativeViewModel.id}) = ${JSON.stringify(root.nativeViewModel.props)}`);
      // root.allSubviews().forEach((view, index) => {
      //   loge(`开始1: ${view.nativeViewModel.type} (${view.nativeViewModel.id})`);
      //   this.logView(view, 0);
      //   loge(`结束2: ${view.nativeViewModel.type} (${view.nativeViewModel.id})`);
      // });
    }
    logw(
      `最终所有元素: ${this.allElement.length}:\n ${JSON.stringify(
        this.allElement
      )}`
    );

    this.listRef.current.apply({
      itemCount: this.allElement.length,
      renderItem: (i) => {
        const element = this.allElement[i];
        const leftPadding = element.level *10;
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
                width={28}
                height={28}
                left={leftPadding}
                >
                <Image
                layoutConfig={layoutConfig().just().configAlignment(Gravity.Center)}
                width={14}
                height={14}
                scaleType={ScaleType.ScaleAspectFit}
                image={new AssetsResource("console_arrow")}
                border={{width: 1, color: Color.RED}}
              ></Image>
              </Stack>
              <Text
                layoutConfig={layoutConfig().mostWidth().fitHeight()}
                maxLines={-1}
                textColor={purpRedColor}
                fontStyle={"bold"}
                padding={{ left: 0, top: 5, right: 5, bottom: 5 }}
                textAlignment={Gravity.CenterY.left()}
                textSize={13}
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
      },
    });
  }

  logView(view: View, level: number) {
    const nativeViewModel = view.nativeViewModel;
    if (view.tag === identifier) {
      loge(
        `view.tag === ${view.tag},  ${nativeViewModel.type} (${nativeViewModel.id})`
      );
      return;
    }
    this.allElement.push({ data: nativeViewModel, level: level });
    // log(`111view[0]: ${nativeViewModel.type} (${nativeViewModel.id}) = ${JSON.stringify(nativeViewModel.props)}`);
    log(`111view[${nativeViewModel.id}]: ${nativeViewModel.type}`);
    let children = nativeViewModel.props["children"];
    if (children && children instanceof Array && children.length > 0) {
      (children as string[]).forEach((viewId) => {
        log(`222view[${viewId}]`);
        let subView = (view as Superview).subviewById(viewId);
        if (subView != undefined) {
          this.logView(subView, level + 1);
        }
      });
    }
  }

  onBind(state: ElementModel) {
    this.listRef.current.itemCount = this.allElement.length;
  }
}
