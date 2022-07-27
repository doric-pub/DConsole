//
//  DemoLibrary.m
//  Example
//
//  Created by shangkun on 2022/7/26.
//  Copyright © 2022 pengfei.zhou. All rights reserved.
//

#import "DemoLibrary.h"
#import "DemoPlugin.h"

@implementation DemoLibrary

- (void)load:(DoricRegistry *)registry {
    [registry registerNativePlugin:DemoPlugin.class withName:@"demoPlugin"];
}

@end
