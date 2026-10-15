#import <Foundation/Foundation.h>
#import <AppSpecs/AppSpecs.h>

NS_ASSUME_NONNULL_BEGIN

/// Turbo Native Module for the "Bridging" screen.
/// It inherits from NativeBridgeDemoSpecBase (generated because the spec
/// declares an event, onTick) to get the emitOnTick: method.
@interface RCTNativeBridgeDemo : NativeBridgeDemoSpecBase <NativeBridgeDemoSpec>

@end

NS_ASSUME_NONNULL_END
