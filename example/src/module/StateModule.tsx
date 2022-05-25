import { Color, Group } from "doric";
import { DCModule } from "./dcModule";

type StateModel = {}[];

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

    }

    onBind(state: StateModel): void {

    }
}