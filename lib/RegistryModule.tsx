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
import { dconsolePlugin } from "./DConsolePlugin";
import { separatorColor } from "./utils";

export class RegistryModule extends DCModule<number> {
  listRef = createRef<List>();
  sliderRef = createRef<Slider>();
  currentSelectIndex: number = 0;
  libraries: string[] = [];
  plugins: string[] = [];
  nodes: string[] = [];
  btnTitles = ["libraries", "plugins", "nodes"];
  datas: string[][] = [];
  btns: GestureContainer[] = [];
  btnTexts: Text[] = [];

  title(): string {
    return "Registry";
  }

  state(): number {
    return 0;
  }

  build(group: Group): void {
    <VLayout parent={group} layoutConfig={layoutConfig().most()}>
      <Slider
        ref={this.sliderRef}
        itemCount={0}
        layoutConfig={layoutConfig().mostWidth().justHeight().configWeight(1)}
        backgroundColor={Color.WHITE}
        renderPage={(i) => {
          return (
            <SlideItem
              layoutConfig={layoutConfig().most()}
              identifier={"slide_cell"}
            ></SlideItem>
          ) as SlideItem;
        }}
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
    this.datas.length = 0;
    this.libraries = await dconsolePlugin(this.context).libraries();
    this.plugins = await dconsolePlugin(this.context).nativePlugins();
    this.nodes = await dconsolePlugin(this.context).viewNodes();
    this.datas = this.datas.concat([this.libraries, this.plugins, this.nodes]);
    this.onBind(this._state);
  }

  bottomButtons() {
    const btns: GestureContainer[] = [];
    const btnTexts: Text[] = [];
    const self = this;
    this.btnTitles.forEach((title, index) => {
      function innerUpdateUI() {
        btnRef.current.backgroundColor = Color.parse("#2ecc71");
        self.scrollToIndex(index);
        self.updateBottomBtnState();
      }
      const btnRef = createRef<GestureContainer>();
      const text = (
        <Text
          padding={{ left: 15, right: 15 }}
          textColor={Color.WHITE}
          fontStyle={"bold"}
          layoutConfig={layoutConfig().fit().configAlignment(Gravity.Center)}
        >
          {title}
        </Text>
      ) as Text;
      btnTexts.push(text);

      const btn = (
        <GestureContainer
          backgroundColor={Color.LTGRAY}
          ref={btnRef}
          height={30}
          layoutConfig={layoutConfig().fitWidth().justHeight()}
          corners={15}
          onClick={() => {
            self.scrollToIndex(index);
            self.currentSelectIndex = index;
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
          {text}
        </GestureContainer>
      ) as GestureContainer;
      btns.push(btn);
    });
    this.btns = btns;
    this.btnTexts = btnTexts;
    return btns;
  }

  onAttached(state: number): void {
    this.readData();
    const self = this;
    this.sliderRef.apply({
      itemCount: this.datas.length,
      renderPage: (index) => {
        return (
          <SlideItem
            layoutConfig={layoutConfig().most()}
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
                      maxLines={0}
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
                      backgroundColor={separatorColor}
                    />
                  </ListItem>
                ) as ListItem;
              }}
            ></List>
          </SlideItem>
        ) as SlideItem;
      },
      onPageSlided: (index) => {
        self.currentSelectIndex = index;
        self.updateBottomBtnState();
      },
    });
  }

  updateBottomBtnState() {
    this.btns.forEach((btn, index) => {
      btn.apply({
        backgroundColor:
          this.currentSelectIndex === index
            ? Color.parse("#2ecc71")
            : Color.LTGRAY,
      });
    });

    this.btnTexts.forEach((t, index) => {
      if (index < this.datas.length) {
        var str = "";
        let array = this.datas[index];
        if (array === undefined) return;
        const count = ` : ${array.length}`;
        if (index === 0) {
          str = "libraries" + count;
        } else if (index === 1) {
          str = "plugins" + count;
        } else if (index === 2) {
          str = "nodes" + count;
        }
        t.apply({
          text: str,
        });
      }
    });
  }

  scrollToIndex(index: number) {
    if (index != this.currentSelectIndex && index < this.sliderRef.current.itemCount) {
      this.sliderRef.current.slidePage(this.context, index, true);
    }
  }

  onBind(state: number): void {
    this.sliderRef.apply({
      itemCount: this.datas.length,
    });
    this.updateBottomBtnState();
  }
}
