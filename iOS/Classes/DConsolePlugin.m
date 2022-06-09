//
//  DConsolePlugin.m
//  dConsole
//
//  Created by shangkun on 2022/5/30.
//

#import "DConsolePlugin.h"
#import <DoricCore/DoricSingleton.h>

@implementation DConsolePlugin

- (void)libraries:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableArray *libraries = @[].mutableCopy;
    [DoricSingleton.instance.libraries enumerateObjectsUsingBlock:^(DoricLibrary * _Nonnull obj, BOOL * _Nonnull stop) {
        [libraries addObject:NSStringFromClass(obj.class)];
    }];
    [promise resolve:[libraries copy]];
}

- (void)nativePlugins:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableArray *plugins = @[].mutableCopy;
    for (DoricRegistry *registry in DoricSingleton.instance.registries) {
        if (registry) {
            NSArray *pluginKeys = [registry allPlugins];
            [pluginKeys enumerateObjectsUsingBlock:^(id  _Nonnull key, NSUInteger idx, BOOL * _Nonnull stop) {
                Class class = [registry acquireNativePlugin:key];
                if (class) {
                    [plugins addObject:[NSString stringWithFormat:@"%@ = %@", key, NSStringFromClass(class)]];
                }
            }];
        }
    }
    [promise resolve:[plugins copy]];
}

- (void)viewNodes:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableArray *nodes = @[].mutableCopy;
    for (DoricRegistry *registry in DoricSingleton.instance.registries) {
        if (registry) {
            NSArray *nodeKeys = [registry allViewNodes];
            [nodeKeys enumerateObjectsUsingBlock:^(id  _Nonnull key, NSUInteger idx, BOOL * _Nonnull stop) {
                Class class = [registry acquireViewNode:key];
                if (class) {
                    [nodes addObject:[NSString stringWithFormat:@"%@ = %@", key, NSStringFromClass(class)]];
                }
            }];
        }
    }
    
    
    [nodes enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if (idx == 4) {
            return;
        }
        NSLog(@"obj[%tu] : %@", idx, obj);
    }];
    
    [promise resolve:[nodes copy]];
}

- (void)testNumber:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSUInteger largeNum = 1234545678901234;
    NSDictionary *param = @{
        @"uid": @(largeNum),
        @"size":@(78),
        @"name":@"Vincent",
        @"info":@{
            @"age": @(11)
        }
    };
    NSError *error;
    NSData *data = [NSJSONSerialization dataWithJSONObject:param options:NSJSONWritingPrettyPrinted error:&error];
    NSString *jsonStr;
    if (!error) {
        jsonStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    }
    NSLog(@"native json str = %@", jsonStr);
    [promise resolve:jsonStr];
}

@end
