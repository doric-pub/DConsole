
# dConsole

一个轻量、针对跨平台框架[Doric](https://doric.pub/)开发者的调试面板。

- 支持日志（**Logs**）查看
- 支持查看所有元素（**Element**）
- 支持对`mvvm`模式下的状态**State**记录，并支持回溯
- 支持查看`libraries`、`plugins`、`nodes`

详情可参考下方截图

<img src="../main/images/element.gif" width="50%"/>


### Usage

1. 将 dConsole 添加到ts项目中，使用 npm安装：

```
$ npm install doric-console --save
```

在Panel的`onCreate()`回调方法里，通过`openDConsole(context: BridgeContext)`方法传入当前的`context`即可

```js
import { openDConsole } from "doric-console";

onCreate() {
    openDConsole(this.context);
}
```

完成以上ts项目中的配置即可使用DConsole，如果需要在调试面板查看`libraries`、`plugins`、`nodes`， 则需要在iOS或者Andorid端进行以下配置。

2. iOS端使用cocoapods引入

```objc
$ pod 'dConsole'

```
注册library

```objc
#import "dConsoleLibrary.h"

[Doric registerLibrary:[dConsoleLibrary new]];
```

3. Andorid端在app目录中的 build.gradle 中添加依赖

```java
dependencies {
    ......
    implementation "pub.doric:dconsole:0.1.5"
}
```

注册library

```java
import pub.doric.library.dConsoleLibrary;

Doric.registerLibrary(new dConsoleLibrary());

```

4. 开启和关闭

在native端开启或关闭DConsole的方法：

iOS端:

```objc
#import "dConsoleLibrary.h"

[[DConsoleManager instance] enableConsole:YES];  // 开启

[[DConsoleManager instance] enableConsole:NO];  // 关闭
```
Andorid端:


```java
DConsoleManager.getInstance().enableConsole(true);  // 开启

DConsoleManager.getInstance().enableConsole(false);  // 关闭
```

在js端获取开关状态：
```js
dconsolePlugin(context)
      .enableState()
      .then((isEnable) => {
        if (this.stateText !== undefined) {
          this.stateText.text = isEnable ? "已打开" : "已关闭";
        }
      });
```


### Requirements

```js
"peerDependencies": {
      "doric": "^0.10.16",
},
```

### Screenshots

* **Log**

可以通过底部的输入框执行一段执行Javascript语句，可调用当前Panel的function，比如可执行以下语句

```js

this.getRootView().viewId
this.getRootView().height
this.getRootView().scaleX = 0.5
this.getRootView().scaleX = 1
```

| iOS | Android |
| ---- | ---- |
| <img src="../main/images/log1.png" height="500px"/> | <img src="../main/images/log2.jpg" height="500px"/>|

* **Registry**

| iOS | Android |
| ---- | ---- |
| <img src="../main/images/plugin1.PNG" height="500px"/> | <img src="../main/images/plugin2.jpg" height="500px"/>|

* **State**

<img src="../main/images/state1.PNG" width="50%"/>
