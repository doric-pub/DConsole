import { Color, createRef, Gravity, Group, jsx, layoutConfig, List, ListItem, log, Stack, Text, VMPanel } from "doric";
import { DCModule } from "./dcModule";

type StateModel = {
    action?: string,
    value?: any,
}[];

export class StateModule extends DCModule<StateModel> {
    listRef = createRef<List>();

    title(): string {
        return 'State';
    }
    state(): StateModel {
        return [];
    }
    build(group: Group): void {
        group.backgroundColor = Color.CYAN;
        <List
            parent={group} layoutConfig={layoutConfig().most()}
            backgroundColor={Color.CYAN}
            ref={this.listRef}
        />
    }
    onShow(): void {
        log(`StateModule onShow`)
    }
    onHide(): void {
        log(`StateModule onHide`)
    }

    onAttached(state: StateModel): void {
        this.listRef.current.renderItem = (i) => {
            return (
                <ListItem layoutConfig={layoutConfig().mostWidth().fitHeight()}>
                    <Text
                        layoutConfig={layoutConfig().mostWidth().fitHeight()}
                        maxLines={-1}
                        padding={{ left: 5, top: 5, right: 5, bottom: 5 }}
                        textAlignment={Gravity.CenterY.left()}
                        textSize={12}
                    >
                        {`${state[i].action}: ${JSON.stringify(state[i].value)}`}
                    </Text>
                    <Stack
                        layoutConfig={layoutConfig().mostWidth().justHeight()}
                        height={0.5}
                        backgroundColor={Color.parse("#bdc3c7")}
                    />
                </ListItem>
            ) as ListItem;
        };
        const panel = this.context.entity;
        const self = this;
        if (panel instanceof VMPanel) {
            const vm = panel.getViewModel();
            if (vm && Reflect.has(vm, 'onAttached')) {
                self.updateState((state) => {
                    state.push({ action: '默认数据', value: panel.getState() });
                })
                const originUpdateState = (vm as any)["updateState"];
                (vm as any)["updateState"] = (setter: any) => {
                    Reflect.apply(originUpdateState, vm, [setter]);
                    // log(`StateModule updateState2222: ${JSON.stringify(vm.getState())}`);
                    self.updateState((state) => {
                        state.push({ action: 'updateState', value: vm.getState() });
                    })
                }
            }
        }
    }

    onBind(state: StateModel): void {
        // log(`StateModule onBind: ${JSON.stringify(state)}`);
        this.listRef.current.itemCount = state.length;
        this.listRef.current.scrolledPosition = state.length - 1;
    }
}