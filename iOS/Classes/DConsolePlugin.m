//
//  DConsolePlugin.m
//  dConsole
//
//  Created by shangkun on 2022/5/30.
//

#import "DConsolePlugin.h"
#import <DoricCore/DoricSingleton.h>
#import <objc/runtime.h>

@implementation DConsolePlugin

- (void)libraries:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableArray *libraries = @[].mutableCopy;
    [DoricSingleton.instance.libraries enumerateObjectsUsingBlock:^(DoricLibrary * _Nonnull obj, BOOL * _Nonnull stop) {
        [libraries addObject:NSStringFromClass(obj.class)];
    }];
    [promise resolve:[libraries copy]];
}

- (void)nativePlugins:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableDictionary *pluginsDict = [NSMutableDictionary dictionaryWithCapacity:20];
    for (DoricRegistry *registry in DoricSingleton.instance.registries) {
        if (registry) {
            unsigned int count;
            objc_property_t *propertyList = class_copyPropertyList(registry.class, &count);
              for (unsigned int i = 0; i < count; i++) {
                  const char *property = property_getName(propertyList[i]);
                  NSString *propertyName = [NSString stringWithUTF8String:property];
                  if ([propertyName isEqualToString:@"plugins"]) {
                      NSMutableDictionary *plugins = [registry valueForKey:@"plugins"];
                      [pluginsDict addEntriesFromDictionary:[plugins copy]];
                      break;
                  }
              }
              free(propertyList);
        }
    }
    NSMutableArray *plugins = @[].mutableCopy;
    [pluginsDict enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, Class obj, BOOL * _Nonnull stop) {
        [plugins addObject:[NSString stringWithFormat:@"%@ = %@", key, NSStringFromClass(obj)]];
    }];
    [promise resolve:[plugins copy]];
}

- (void)viewNodes:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSMutableDictionary *nodesDict = [NSMutableDictionary dictionaryWithCapacity:20];
    for (DoricRegistry *registry in DoricSingleton.instance.registries) {
        if (registry) {
            unsigned int count;
            objc_property_t *propertyList = class_copyPropertyList(registry.class, &count);
              for (unsigned int i = 0; i < count; i++) {
                  const char *property = property_getName(propertyList[i]);
                  NSString *propertyName = [NSString stringWithUTF8String:property];
                  if ([propertyName isEqualToString:@"nodes"]) {
                      NSMutableDictionary *nodes = [registry valueForKey:@"nodes"];
                      [nodesDict addEntriesFromDictionary:[nodes copy]];
                      break;
                  }
              }
              free(propertyList);
        }
    }
    NSMutableArray *nodes = @[].mutableCopy;
    [nodesDict enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, Class obj, BOOL * _Nonnull stop) {
        [nodes addObject:[NSString stringWithFormat:@"%@ = %@", key, NSStringFromClass(obj)]];
    }];
    [promise resolve:[nodes copy]];
}

@end
