//
//  DemoPlugin.m
//  Example
//
//  Created by shangkun on 2022/7/26.
//  Copyright © 2022 pengfei.zhou. All rights reserved.
//

#import "DemoPlugin.h"
#import "DConsoleManager.h"

@implementation DemoPlugin

- (void)openDConsole:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    [[DConsoleManager instance] enableConsole:YES];
    [promise resolve:nil];
}

- (void)closeDConsole:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    [[DConsoleManager instance] enableConsole:NO];
    [promise resolve:nil];
}


@end
