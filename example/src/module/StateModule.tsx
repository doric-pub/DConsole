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
    onAttached(state: StateModel): void {

        // const panel = context.entity as Panel;

        const panel = context.entity as VMPanel<Object, ViewHolder>;
        log(`onAttached start: ${JSON.stringify(panel.allHeadViews)}`);

        if (panel instanceof VMPanel) {
            const originShow = (panel as any)["__onShow__"];

            (panel as any)["__onShow__"] = () => {
                Reflect.apply(originShow, panel, []);

                log(`__onShow__ onAttached: ${panel.getState}`);
                const originVM = (panel as any)["vm"];
                log(`__onShow__ originVM: ${originVM}`);

            };

        }

        // const originVM = (panel as any)["vm"];
        // log(`originVM: ${originVM}`);


        // originVM["updateState"] = (setter: any) => {
        //     // log(`updateState: ${panel.getState}`);
        // };



        log(`onAttached end.....`);

    }
    onBind(state: StateModel): void {
        log(`onBind`);
    }
}