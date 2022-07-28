//
//  DConsoleManager.m
//  dConsole
//
//  Created by shangkun on 2022/7/26.
//

#import "DConsoleManager.h"

NSNotificationName const DConsoleEnableStateNotiName = @"dConsoleEnableStateNotiName";

@interface DConsoleManager()

@property (nonatomic, readwrite, getter=isEnable) BOOL enable;

@end

@implementation DConsoleManager

+ (instancetype)instance {
    static DConsoleManager *manager;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[DConsoleManager alloc] init];
        manager.enable = true;
    });
    return manager;
}

- (void)enableConsole:(BOOL)enable {
    if (_enable != enable) {
        _enable = enable;
        [[NSNotificationCenter defaultCenter] postNotificationName:DConsoleEnableStateNotiName object:nil userInfo:@{@"isEnable": @(enable)}];
        if (self.enableStateDidChange) {
            self.enableStateDidChange(enable);
        }
    }
}


    
@end
