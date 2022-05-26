import { Color, createRef, Gravity, Group, jsx, layoutConfig, List, ListItem, Stack, Text, VMPanel } from "doric";
import { DCModule } from "./dcModule";
import { Map } from 'immutable';
import Immutable from "immutable";

// type StateModel = {
//     action?: string,
//     value?: any,
// }[];

type StateModel = Map<string, any>[];

export class StateModule extends DCModule<StateModel> {
    history: Map<string, any>[] = [];
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
            backgroundColor={Color.WHITE}
            ref={this.listRef}
        />
    }

    onAttached(state: StateModel): void {
        this.listRef.current.renderItem = (i) => {
            const model = this.history[i];
            if (!model) return <ListItem /> as ListItem;
            return (
                <ListItem
                    layoutConfig={layoutConfig().mostWidth().fitHeight()}
                >
                    <Text
                        layoutConfig={layoutConfig().mostWidth().fitHeight()}
                        maxLines={-1}
                        padding={{ left: 5, top: 5, right: 5, bottom: 5 }}
                        textAlignment={Gravity.CenterY.left()}
                        textSize={12}
                    >
                        {`${model.get('action')}: ${JSON.stringify(model.get('value'))}`}
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
                self.updateState((s) => {
                    self.saveStateToHistory(panel.getState(), s, '默认数据');
                })
                const originUpdateState = (vm as any)["updateState"];
                (vm as any)["updateState"] = (setter: any) => {
                    Reflect.apply(originUpdateState, vm, [setter]);
                    self.updateState((s) => {
                        self.saveStateToHistory(vm.getState(), s, 'updateState');
                    })
                }
            }
        }
    }

    saveStateToHistory(stateObj: Object, s: StateModel, action: string) {
        // const string = JSON.stringify(stateObj);
        // const obj = JSON.parse(string);
        const immutableMap = Immutable.fromJS(stateObj);
        const data = Immutable.Map({ action: action, value: immutableMap });
        this.history.push(data);
        s.push(data);
    }

    onBind(state: StateModel): void {
        this.listRef.current.itemCount = this.history.length;
        if (this.history.length > 0) {
            this.listRef.current.scrolledPosition = this.history.length - 1;
        }
    }
}