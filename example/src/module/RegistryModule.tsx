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
  SlideItem,
  Slider,
  Stack,
  Text,
  VLayout,
} from "doric";
import { DCModule } from "./dcModule";
import { dconsolePlugin } from "dconsole";

type StateModel = {
  currentSelectIndex: number;
};

export class RegistryModule extends DCModule<StateModel> {
  listRef = createRef<List>();
  sliderRef = createRef<Slider>();
  currentSelectIndex: number = 0;
  libraries: string[] = [];
  plugins: string[] = [];
  nodes: string[] = [];
  btnTitles = ["libraries", "plugins", "nodes"];
  datas: string[][] = [];
  btns: GestureContainer[] = [];

  title(): string {
    return "Registry";
  }

  state(): StateModel {
    return {
      currentSelectIndex: 0,
    };
  }

  build(group: Group): void {
    group.backgroundColor = Color.parse("#ecf0f1");
    <VLayout parent={group} layoutConfig={layoutConfig().most()}>
      <Slider
        ref={this.sliderRef}
        layoutConfig={layoutConfig().mostWidth().justHeight().configWeight(1)}
        backgroundColor={Color.YELLOW}
      ></Slider>
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

  async readData() {
    this.libraries = await dconsolePlugin(this.context).libraries();
    this.plugins = await dconsolePlugin(this.context).nativePlugins();
    this.nodes = await dconsolePlugin(this.context).viewNodes();
    this.datas.length = 0;
    this.datas = this.datas.concat([this.libraries, this.plugins, this.nodes]);
    this.onBind(this._state);
  }

  bottomButtons() {
    const btns: GestureContainer[] = [];
    const self = this;
    this.btnTitles.forEach((title, index) => {
      function innerUpdateUI() {
        btnRef.current.backgroundColor = Color.parse("#2ecc71");
        self.scrollToIndex(index);
        self.updateBottomBtnState();
      }
      const btnRef = createRef<GestureContainer>();
      const btn = (
        <GestureContainer
          backgroundColor={Color.LTGRAY}
          ref={btnRef}
          height={30}
          layoutConfig={layoutConfig().fitWidth().justHeight()}
          corners={15}
          onClick={() => {
            self.scrollToIndex(index);
            self._state.currentSelectIndex = index;
          }}
          onTouchDown={() => {
            btnRef.current.backgroundColor = Color.parse("#16a085");
          }}
          onTouchCancel={() => {
            innerUpdateUI();
          }}
          onTouchUp={() => {
            innerUpdateUI();
          }}
        >
          <Text
            padding={{ left: 15, right: 15 }}
            textColor={Color.WHITE}
            fontStyle={"bold"}
            textSize={18}
            layoutConfig={layoutConfig().fit().configAlignment(Gravity.Center)}
          >
            {title}
          </Text>
        </GestureContainer>
      ) as GestureContainer;
      btns.push(btn);
    });
    this.btns = btns;
    return btns;
  }

  onAttached(state: StateModel): void {
    this.readData();
    const self = this;
    this.sliderRef.apply({
      itemCount: this.datas.length,
      renderPage: (index) => {
        return (
          <SlideItem
            layoutConfig={layoutConfig().mostWidth().mostHeight()}
            identifier={"slide_cell"}
            backgroundColor={Color.WHITE}
          >
            <List
              layoutConfig={layoutConfig().mostWidth().mostHeight()}
              itemCount={this.datas[index].length}
              renderItem={(i) => {
                const desc = this.datas[index][i];
                return (
                  <ListItem
                    layoutConfig={layoutConfig().mostWidth().fitHeight()}
                    identifier={"node_cell"}
                  >
                    <Text
                      layoutConfig={layoutConfig().mostWidth().fitHeight()}
                      maxLines={-1}
                      textColor={Color.BLACK}
                      padding={{ left: 10, top: 8, right: 5, bottom: 8 }}
                      textAlignment={Gravity.CenterY.left()}
                      textSize={13}
                    >
                      {desc}
                    </Text>
                    <Stack
                      layoutConfig={layoutConfig().mostWidth().justHeight()}
                      height={0.5}
                      backgroundColor={Color.parse("#bdc3c7")}
                    />
                  </ListItem>
                ) as ListItem;
              }}
            ></List>
          </SlideItem>
        ) as SlideItem;
      },
      onPageSlided: (index) => {
        self._state.currentSelectIndex = index;
        self.updateBottomBtnState();
      },
    });
  }

  updateBottomBtnState() {
    this.btns.forEach((btn, index) => {
      btn.apply({
        backgroundColor:
          this._state.currentSelectIndex === index
            ? Color.parse("#2ecc71")
            : Color.LTGRAY,
      });
    });
  }

  scrollToIndex(index: number) {
    if (index != this._state.currentSelectIndex) {
      this.sliderRef.current.slidePage(this.context, index, true);
    }
  }

  onBind(state: StateModel): void {
    this.sliderRef.apply({
      itemCount: this.datas.length,
    });
    this.updateBottomBtnState();
  }
}
