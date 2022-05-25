import { Color, Group, log, Panel, Setter, ViewHolder, VMPanel } from "doric";
import { DCModule } from "./dcModule";
import { ClassType } from "doric"

type StateModel = {
    action: string,
    state: any,
}[];

export class StateModule extends DCModule<StateModel> {

    title(): string {
        return 'State';
    }
    state(): StateModel {
        return [];
    }
    build(group: Group): void {
        group.backgroundColor = Color.CYAN;
    }
    onShow(): void {
        log(`StateModule onShow`)
    }
    onHide(): void {
        log(`StateModule onHide`)
    }

    onAttached(state: StateModel): void {

        const panel = context.entity;
        log(`panel type: ${typeof panel}`);

        if (panel instanceof VMPanel) {
            // const panel = context.entity as VMPanel<Object, ViewHolder>;
            log(`StateModule onAttached: ${JSON.stringify(panel.getState())}`);

            // const originShow = (panel as any)["__onShow__"];
            // (panel as any)["__onShow__"] = () => {
            //     Reflect.apply(originShow, panel, []);
            //     log(`StateModule __onShow__`);
            // };
        }
        log(`onAttached end.....`);
    }

    onBind(state: StateModel): void {
        log(`onBind`);
    }
}