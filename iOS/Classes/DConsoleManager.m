//
//  DConsoleManager.m
//  dConsole
//
//  Created by shangkun on 2022/7/26.
//

#import "DConsoleManager.h"

@interface DConsoleManager()

@property (nonatomic, readwrite, getter=isEnable) BOOL enable;

@end

@implementation DConsoleManager

+ (instancetype)instance {
    static DConsoleManager *manager;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[DConsoleManager alloc] init];
    });
    return manager;
}

- (void)enableConsole:(BOOL)enable {
    _enable = enable;
}
    
@end
