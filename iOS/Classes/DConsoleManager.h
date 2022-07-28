//
//  DConsoleManager.h
//  dConsole
//
//  Created by shangkun on 2022/7/26.
//

#import <Foundation/Foundation.h>

@interface DConsoleManager : NSObject

@property (nonatomic, readonly, getter=isEnable) BOOL enable;

+ (instancetype)instance;

- (void)enableConsole:(BOOL)enable;

@property (nonatomic, copy) void(^enableStateDidChange)(BOOL enable);

@end

