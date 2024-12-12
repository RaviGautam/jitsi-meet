/* eslint-disable lines-around-comment,  no-undef, no-unused-vars  */

// NB: This import must always come first.
import './react/bootstrap.native';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState
} from 'react';
import { View, ViewStyle } from 'react-native';

import type { IRoomsInfo } from '../react/features/breakout-rooms/types';

import { appNavigate } from './react/features/app/actions.native';
import { App } from './react/features/app/components/App.native';
import { setAudioOnly } from './react/features/base/audio-only/actions';
import { setAudioMuted, setVideoMuted } from './react/features/base/media/actions';
import { getRoomsInfo } from './react/features/breakout-rooms/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface IEventListeners {
    onAudioMutedChanged?: Function;
    onVideoMutedChanged?: Function;
    onConferenceBlurred?: Function;
    onConferenceFocused?: Function;
    onConferenceJoined?: Function;
    onConferenceLeft?: Function;
    onConferenceWillJoin?: Function;
    onEnterPictureInPicture?: Function;
    onEndpointMessageReceived?: Function;
    onParticipantJoined?: Function;
    onParticipantLeft?: ({ id }: { id: string }) => void;
    onReadyToClose?: Function;
}

interface IUserInfo {
    avatarURL: string;
    displayName: string;
    email: string;
}

interface IFlags {
    "prejoinpage.enabled"?: boolean;
    "directJoin.enabled"?: boolean;
    "backButtonHandler.enabled"?: boolean;
    "endMeetingOptions.enabled"?: boolean;
    "moderatorEnable.enabled"?: boolean;
}

interface IAppProps {
    config: object;
    eventListeners?: IEventListeners;
    flags?: IFlags;
    room: string;
    serverURL?: string;
    waitingAreaText?: string;
    meetingTitle?: string;
    lobyTitle?: string;
    lobyDescription?: string;
    minBitrate: number;
    stdBitrate: number;
    maxBitrate: number;
    style?: Object;
    token?: string;
    userInfo?: IUserInfo;
}

export interface JitsiRefProps {
    close: Function;
    setAudioOnly?: (value: boolean) => void;
    setAudioMuted?: (muted: boolean) => void;
    setVideoMuted?: (muted: boolean) => void;
    getRoomsInfo?: () => IRoomsInfo;
}

/**
 * Main React Native SDK component that displays a Jitsi Meet conference and gets all required params as props
 */
export const JitsiMeeting = forwardRef<JitsiRefProps, IAppProps>((props, ref) => {
    const [ appProps, setAppProps ] = useState({});
    const app = useRef(null);
    const {
        config,
        eventListeners,
        flags= {},
        room,
        serverURL,
        style,
        token,
        userInfo,
        waitingAreaText,
        meetingTitle,
        lobyTitle,
        lobyDescription,
        minBitrate,
        stdBitrate,
        maxBitrate
    } = props;

    flags["prejoinpage.enabled"] =  flags["directJoin.enabled"] ?  false : true

    // eslint-disable-next-line arrow-body-style
    useImperativeHandle(ref, () => ({
        close: () => {
            const dispatch = app.current.state.store.dispatch;

            dispatch(appNavigate(undefined));
        },
        setAudioOnly: value => {
            const dispatch = app.current.state.store.dispatch;

            dispatch(setAudioOnly(value));
        },
        setAudioMuted: muted => {
            const dispatch = app.current.state.store.dispatch;

            dispatch(setAudioMuted(muted));
        },
        setVideoMuted: muted => {
            const dispatch = app.current.state.store.dispatch;

            dispatch(setVideoMuted(muted));
        },
        getRoomsInfo: () => {
            const state = app.current.state.store.getState();

            return getRoomsInfo(state);
        }
    }));

    useEffect(
        () => {
            const urlObj = {
                config,
                jwt: token
            };

            let urlProps;

            if (room.includes('://')) {
                urlProps = {
                    ...urlObj,
                    url: room
                };
            } else {
                urlProps = {
                    ...urlObj,
                    room,
                    serverURL
                };
            }

            saveBitrateValues(minBitrate, stdBitrate, maxBitrate);
            saveTitleValues(meetingTitle, waitingAreaText, lobyTitle, lobyDescription);

            setAppProps({
                'flags': flags,
                'rnSdkHandlers': {
                    onAudioMutedChanged: eventListeners?.onAudioMutedChanged,
                    onVideoMutedChanged: eventListeners?.onVideoMutedChanged,
                    onConferenceBlurred: eventListeners?.onConferenceBlurred,
                    onConferenceFocused: eventListeners?.onConferenceFocused,
                    onConferenceJoined: eventListeners?.onConferenceJoined,
                    onConferenceWillJoin: eventListeners?.onConferenceWillJoin,
                    onConferenceLeft: eventListeners?.onConferenceLeft,
                    onEnterPictureInPicture: eventListeners?.onEnterPictureInPicture,
                    onEndpointMessageReceived: eventListeners?.onEndpointMessageReceived,
                    onParticipantJoined: eventListeners?.onParticipantJoined,
                    onParticipantLeft: eventListeners?.onParticipantLeft,
                    onReadyToClose: eventListeners?.onReadyToClose
                },
                'url': urlProps,
                'userInfo': userInfo,
                'waitingAreaText': waitingAreaText,
                'meetingTitle': meetingTitle,
                'minBitrate': minBitrate,
                'stdBitrate': stdBitrate,
                'maxBitrate': maxBitrate,
                'lobyTitle': lobyTitle,
                'lobyDescription': lobyDescription,
            });
        }, []
    );

    const saveBitrateValues = async(minBitrate: number, stdBitrate: number, maxBitrate: number)=> {
        try {
            await AsyncStorage.setItem("minBitrate", minBitrate.toString());
            await AsyncStorage.setItem("stdBitrate", stdBitrate.toString());
            await AsyncStorage.setItem("maxBitrate", maxBitrate.toString());
     
        } catch (error) {
            console.error("Set the value of minBitrate, stdBitrate, maxBitrate", error);
        }
    }

    const saveTitleValues = async(meetingTitle: string, waitingAreaText: string, lobyTitle: string, lobyDescription: string) =>{
        try {
            await AsyncStorage.setItem("meetingTitle", meetingTitle.toString());
            await AsyncStorage.setItem("waitingText", waitingAreaText.toString());
            await AsyncStorage.setItem("lobyTitle", lobyTitle.toString());
            await AsyncStorage.setItem("lobyDescription", lobyDescription.toString());
        } catch (error) {
            console.error("Error saving bitrate values:", error);
        }
    }

    // eslint-disable-next-line arrow-body-style
    useLayoutEffect(() => {
        /**
         * When you close the component you need to reset it.
         * In some cases it needs to be added as the parent component may have been destroyed.
         * Without this change the call remains active without having the jitsi screen.
        */
        return () => {
            const dispatch = app.current?.state?.store?.dispatch;

            dispatch && dispatch(appNavigate(undefined));
        };
    }, []);

    return (
        <View style = { style as ViewStyle }>
            <App
                { ...appProps }
                ref = { app } />
        </View>
    );
});
