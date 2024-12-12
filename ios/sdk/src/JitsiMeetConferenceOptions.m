/*
 * Copyright @ 2019-present 8x8, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <React/RCTUtils.h>

#import "JitsiMeetConferenceOptions+Private.h"
#import "JitsiMeetUserInfo+Private.h"

@implementation JitsiMeetConferenceOptionsBuilder {
    NSMutableDictionary *_featureFlags;
    NSMutableDictionary *_config;
}

- (instancetype)init {
    if (self = [super init]) {
        _serverURL = nil;
        _room = nil;
        _token = nil;
        _waitingAreaText = nil;
        _meetingTitle = nil;
        _lobyTitle = nil;
        _lobyDescription = nil;
        _minBitrate = nil;
        _stdBitrate = nil;
        _maxBitrate = nil;

        _config = [[NSMutableDictionary alloc] init];
        _featureFlags = [[NSMutableDictionary alloc] init];

        _userInfo = nil;
    }
    
    return self;
}

- (void)setFeatureFlag:(NSString *)flag withBoolean:(BOOL)value {
    [self setFeatureFlag:flag withValue:[NSNumber numberWithBool:value]];
}

- (void)setFeatureFlag:(NSString *)flag withValue:(id)value {
    _featureFlags[flag] = value;
}

- (void)setAudioOnly:(BOOL)audioOnly {
    [self setConfigOverride:@"startAudioOnly" withBoolean:audioOnly];
}

- (void)setAudioMuted:(BOOL)audioMuted {
    [self setConfigOverride:@"startWithAudioMuted" withBoolean:audioMuted];
}

- (void)setVideoMuted:(BOOL)videoMuted {
    [self setConfigOverride:@"startWithVideoMuted" withBoolean:videoMuted];
}

- (void)setCallHandle:(NSString *_Nonnull)callHandle {
    [self setConfigOverride:@"callHandle" withValue:callHandle];
}

- (void)setCallUUID:(NSUUID *_Nonnull)callUUID {
    [self setConfigOverride:@"callUUID" withValue:[callUUID UUIDString]];
}

- (void)setSubject:(NSString *_Nonnull)subject {
    [self setConfigOverride:@"subject" withValue:subject];
}

- (void)setWaitingAreaText:(NSString *)waitingAreaText {
    [self setConfigOverride:@"waitingAreaText" withValue:waitingAreaText];
}

- (void)setMeetingTitle:(NSString *)meetingTitle {
    [self setConfigOverride:@"meetingTitle" withValue:meetingTitle];
}

- (void)setLobyTitle:(NSString *)lobyTitle {
    [self setConfigOverride:@"lobyTitle" withValue:lobyTitle];
}

- (void)setLobyDescription:(NSString *)lobyDescription {
    [self setConfigOverride:@"lobyDescription" withValue:lobyDescription];
}

- (void)setMinBitrate:(NSNumber *) minBitrate {
    [self setConfigOverride:@"minBitrate" withValue:minBitrate];
}

- (void)setMaxBitrate:(NSNumber *) maxBitrate {
    [self setConfigOverride:@"maxBitrate" withValue:maxBitrate];
}

- (void)setStdBitrate:(NSNumber *)stdBitrate {
    [self setConfigOverride:@"stdBitrate" withValue:stdBitrate];
}

- (void)setConfigOverride:(NSString *_Nonnull)config withBoolean:(BOOL)value {
    [self setConfigOverride:config withValue:[NSNumber numberWithBool:value]];
}

- (void)setConfigOverride:(NSString *_Nonnull)config withDictionary:(NSDictionary*)dictionary {
    _config[config] = dictionary;
}

- (void)setConfigOverride:(NSString *_Nonnull)config withArray:( NSArray * _Nonnull)array {
    _config[config] = array;
}

- (void)setConfigOverride:(NSString *_Nonnull)config withValue:(id _Nonnull)value {
    _config[config] = value;
}

@end

@implementation JitsiMeetConferenceOptions {
    NSDictionary *_featureFlags;
    NSDictionary *_config;
}

#pragma mark - Internal initializer

- (instancetype)initWithBuilder:(JitsiMeetConferenceOptionsBuilder *)builder {
    if (self = [super init]) {
        _serverURL = builder.serverURL;
        _room = builder.room;
        _token = builder.token;
        _waitingAreaText = builder.waitingAreaText;
        _meetingTitle = builder.meetingTitle;
        _lobyTitle = builder.lobyTitle;
        _lobyDescription = builder.lobyDescription;
        _minBitrate = builder.minBitrate;
        _stdBitrate = builder.stdBitrate;
        _maxBitrate = builder.maxBitrate;

        _config = builder.config;

        _featureFlags = [NSDictionary dictionaryWithDictionary:builder.featureFlags];

        _userInfo = builder.userInfo;
    }

    return self;
}

#pragma mark - API

+ (instancetype)fromBuilder:(void (^)(JitsiMeetConferenceOptionsBuilder *))initBlock {
    JitsiMeetConferenceOptionsBuilder *builder = [[JitsiMeetConferenceOptionsBuilder alloc] init];
    initBlock(builder);
    return [[JitsiMeetConferenceOptions alloc] initWithBuilder:builder];
}

#pragma mark - Private API

- (NSDictionary *)asProps {
    NSMutableDictionary *props = [[NSMutableDictionary alloc] init];

    props[@"flags"] = [NSMutableDictionary dictionaryWithDictionary:_featureFlags];

    NSMutableDictionary *urlProps = [[NSMutableDictionary alloc] init];

    // The room is fully qualified.
    if (_room != nil && [_room containsString:@"://"]) {
        urlProps[@"url"] = _room;
    } else {
        if (_serverURL != nil) {
            urlProps[@"serverURL"] = [_serverURL absoluteString];
        }

        if (_room != nil) {
            urlProps[@"room"] = _room;
        }
    }

    if (_token != nil) {
        urlProps[@"jwt"] = _token;
    }

    if (_waitingAreaText != nil){
        urlProps[@"waitingAreaText"] = _waitingAreaText;
    }
    
    if (_meetingTitle != nil){
        urlProps[@"meetingTitle"] = _meetingTitle;
    }
    
    if (_lobyTitle != nil){
        urlProps[@"lobyTitle"] = _lobyTitle;
    }

    if (_lobyDescription != nil){
        urlProps[@"lobyDescription"] = _lobyDescription;
    }

    if(_minBitrate != nil){
        urlProps[@"minBitrate"] = _minBitrate;
    }
    
    if(_stdBitrate != nil){
        urlProps[@"stdBitrate"] = _stdBitrate;
    }
    
    if(_maxBitrate != nil){
        urlProps[@"maxBitrate"] = _maxBitrate;
    }

    if (_userInfo != nil) {
        props[@"userInfo"] = [self.userInfo asDict];
    }

    urlProps[@"config"] = _config;
    props[@"url"] = urlProps;

    return props;
}

@end
