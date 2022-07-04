
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
$ npm install dconsole
```

在Panel的`onCreate()`回调方法里，通过`openDConsole(context: BridgeContext)`方法传入当前的`context`即可

```js
import { openDConsole } from "dConsole";

onCreate() {
    openDConsole(this.context);
}
```

完成以上ts项目中的配置即可使用DConsole，如果需要在调试面板查看`libraries`、`plugins`、`nodes`， 则需要在iOS或者Andorid端进行以下配置。

2. iOS端使用cocoapods引入 （**非必须**）

```objc
$ pod 'dConsole'

```
注册library

```objc
#import "dConsoleLibrary.h"

[Doric registerLibrary:[dConsoleLibrary new]];
```

3. Andorid端在app目录中的 build.gradle 中添加依赖（**非必须**）

```java
dependencies {
    ......
    implementation "pub.doric:dconsole:0.1.0"
}
```

注册library

```java
import pub.doric.library.dConsoleLibrary;

Doric.registerLibrary(new dConsoleLibrary());

```


### Requirements

```js
"dependencies": {
      "doric": "^0.10.16",
},
```

### Screenshots

* **Log**

| iOS | Android |
| ---- | ---- |
| !<img src="../main/images/log1.png" height="500px"/> | <img src="../main/images/log2.jpg" height="500px"/>|

* **Registry**

| iOS | Android |
| ---- | ---- |
| !<img src="../main/images/plugin1.PNG" height="500px"/> | <img src="../main/images/plugin2.jpg" height="500px"/>|

* **State**

<img src="../main/images/state1.PNG" width="50%"/>
