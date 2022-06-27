import { Color, Gravity, Group, layoutConfig, log, stack, Text, text, ViewHolder, ViewModel, VMPanel } from "doric";
import {openDConsole} from "dconsole"


interface CountModel {
    count: number;
}

class CounterView extends ViewHolder {

    numberText!: Text
    clickText!: Text

    build(root: Group) {
        log('CounterView build')
        stack(
            [
                this.numberText = text({
                    textSize: 36,
                    fontStyle: 'bold',
                    layoutConfig: layoutConfig().fit().configAlignment(Gravity.Center).configMargin({ bottom: 60 })
                }),
                this.clickText = text({
                    textSize: 26,
                    text: 'click me!',
                    layoutConfig: layoutConfig().fit().configAlignment(Gravity.Center),
                })
            ],
            {
                backgroundColor: Color.WHITE,
                layoutConfig: layoutConfig().most()
            }
        ).in(root)
    }
}

class CounterVM extends ViewModel<CountModel, CounterView> {

    onAttached(state: CountModel, vh: CounterView) {
        log(`onAttached state: ${state.count}`)
        vh.clickText.onClick = () => {
            Promise.resolve(this.getState().count).then(count => {
                Promise.resolve().then(() => {
                    this.updateState((s: CountModel) => {
                        s.count = count + 1
                    })
                })
            })
        }
    }

    onBind(state: CountModel, vh: CounterView) {
        log(`onBind state: ${state.count}`)
        vh.numberText.text = `${state.count}`
    }
}

@Entry
export class CounterDemo extends VMPanel<CountModel, CounterView> {

    countModel: CountModel = {
        count: 0
    }

    onCreate(): void {
        openDConsole(this.context);
    }

    getState() {
        return this.countModel
    }

    getViewHolderClass() {
        return CounterView
    }

    getViewModelClass() {
        return CounterVM
    }
}