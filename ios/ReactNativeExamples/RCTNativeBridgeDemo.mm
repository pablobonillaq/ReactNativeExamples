#import "RCTNativeBridgeDemo.h"

/// Name of the thread (or dispatch queue) running the current code.
static NSString *CurrentThreadName(void)
{
  if (NSThread.isMainThread) {
    return @"main";
  }
  NSString *name = NSThread.currentThread.name;
  if (name.length > 0) {
    return name;
  }
  const char *label = dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL);
  return label != NULL ? @(label) : @"(unnamed)";
}

/// How spec types arrive here:
///   string → NSString, number → double (NSNumber when nullable or returned),
///   boolean → BOOL, object → NSDictionary, Array → NSArray,
///   Promise<T> → resolve/reject blocks, function → RCTResponseSenderBlock.
@implementation RCTNativeBridgeDemo {
  NSTimer *_timer;
  NSInteger _tickCount;
}

+ (NSString *)moduleName
{
  return @"NativeBridgeDemo";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBridgeDemoSpecJSI>(params);
}

#pragma mark - 1. Sync (runs on the JS thread; JS waits for the value)

- (NSString *)currentThread
{
  return CurrentThreadName();
}

- (NSNumber *)add:(double)a b:(double)b
{
  return @(a + b);
}

#pragma mark - 2. Async (runs on the module's queue; resolves a Promise)

- (void)asyncThread:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  resolve(CurrentThreadName());
}

- (void)addAsync:(double)a
               b:(double)b
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  resolve(@(a + b));
}

#pragma mark - 3. Callback (a JS function native can call once)

- (void)withCallback:(double)value callback:(RCTResponseSenderBlock)callback
{
  callback(@[ [NSString
      stringWithFormat:@"Objective-C got %g and sends back %g", value, value * 2] ]);
}

#pragma mark - 4. Events (native decides when to send)

- (void)startTicking:(double)intervalMs
{
  NSTimeInterval interval = MAX(intervalMs, 100) / 1000.0;
  // NSTimer needs a run loop: use the main thread's.
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_timer invalidate];
    self->_tickCount = 0;
    __weak RCTNativeBridgeDemo *weakSelf = self;
    self->_timer = [NSTimer
        scheduledTimerWithTimeInterval:interval
                               repeats:YES
                                 block:^(NSTimer *timer) {
                                   RCTNativeBridgeDemo *strongSelf = weakSelf;
                                   if (strongSelf == nil) {
                                     [timer invalidate];
                                     return;
                                   }
                                   strongSelf->_tickCount++;
                                   // Generated from `readonly onTick: EventEmitter<…>`.
                                   [strongSelf emitOnTick:@{
                                     @"count" : @(strongSelf->_tickCount),
                                     @"timestamp" : @(NSDate.date.timeIntervalSince1970 * 1000),
                                     @"thread" : CurrentThreadName(),
                                   }];
                                 }];
  });
}

- (void)stopTicking
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_timer invalidate];
    self->_timer = nil;
  });
}

/// Called when the JS runtime goes away (reload): stop sending events.
- (void)invalidate
{
  [self stopTicking];
}

#pragma mark - 5. Type conversion (what each JS value became)

- (NSDictionary *)echo:(NSDictionary *)value
{
  NSMutableDictionary *result = [NSMutableDictionary new];
  [value enumerateKeysAndObjectsUsingBlock:^(NSString *key, id obj, BOOL *stop) {
    result[key] = [self describe:obj];
  }];
  return result;
}

- (NSString *)describe:(id)obj
{
  if (obj == nil || obj == (id)kCFNull) {
    return @"NSNull";
  }
  if ([obj isKindOfClass:NSNumber.class]) {
    // JS booleans and numbers both become NSNumber; CFBoolean tells them apart.
    if (CFGetTypeID((__bridge CFTypeRef)obj) == CFBooleanGetTypeID()) {
      return [NSString stringWithFormat:@"NSNumber (BOOL) %@", [obj boolValue] ? @"YES" : @"NO"];
    }
    return [NSString stringWithFormat:@"NSNumber (double) %@", obj];
  }
  if ([obj isKindOfClass:NSString.class]) {
    return [NSString stringWithFormat:@"NSString \"%@\"", obj];
  }
  if ([obj isKindOfClass:NSArray.class]) {
    return [NSString stringWithFormat:@"NSArray (%lu items)", (unsigned long)[obj count]];
  }
  if ([obj isKindOfClass:NSDictionary.class]) {
    return [NSString stringWithFormat:@"NSDictionary (%lu keys)", (unsigned long)[obj count]];
  }
  return NSStringFromClass([obj class]);
}

#pragma mark - 6. Errors (reject with a code JS reads as error.code)

- (void)fail:(NSString *)code
     message:(NSString *)message
     resolve:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject
{
  reject(code, message, nil);
}

@end
