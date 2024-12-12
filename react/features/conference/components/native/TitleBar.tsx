import React, { useEffect, useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import { IReduxState } from '../../../app/types';
import { getConferenceName, getConferenceTimestamp } from '../../../base/conference/functions';
import { CONFERENCE_TIMER_ENABLED, MEETING_TITLE } from '../../../base/flags/constants';
import { getFeatureFlag } from '../../../base/flags/functions';
import AudioDeviceToggleButton from '../../../mobile/audio-mode/components/AudioDeviceToggleButton';
import PictureInPictureButton from '../../../mobile/picture-in-picture/components/PictureInPictureButton';
import ParticipantsPaneButton from '../../../participants-pane/components/native/ParticipantsPaneButton';
import { isParticipantsPaneEnabled } from '../../../participants-pane/functions';
import { isRoomNameEnabled } from '../../../prejoin/functions';
import ToggleCameraButton from '../../../toolbox/components/native/ToggleCameraButton';
import { isToolboxVisible } from '../../../toolbox/functions.native';
import ConferenceTimer from '../ConferenceTimer';

import Labels from './Labels';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface IProps {

    /**
     * Whether displaying the current conference timer is enabled or not.
     */
    _conferenceTimerEnabled: boolean;

    _isMeetingTitleEnabled: boolean;

    /**
     * Creates a function to be invoked when the onPress of the touchables are
     * triggered.
     */
    _createOnPress: Function;

    /**
     * Whether participants feature is enabled or not.
     */
    _isParticipantsPaneEnabled: boolean;

    /**
     * Name of the meeting we're currently in.
     */
    _meetingName: string;

    /**
     * Whether displaying the current room name is enabled or not.
     */
    _roomNameEnabled: boolean;

    /**
     * True if the navigation bar should be visible.
     */
    _visible: boolean;
}

/**
 * Implements a navigation bar component that is rendered on top of the
 * conference screen.
 *
 * @param {IProps} props - The React props passed to this component.
 * @returns {JSX.Element}
 */
const TitleBar = (props: IProps) => {
    const [Title, setTitle] = useState<string>("");
    const { _isParticipantsPaneEnabled, _visible } = props;
    const [meetingTextValue, setMeetingTextValue] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTitle = async () => {
            try {
                let title = "";
                const myTitle = await AsyncStorage.getItem(
                    "meetingTitle"
                );
                setMeetingTextValue(myTitle)
                if (props._isMeetingTitleEnabled) {
                    if (
                        typeof meetingTextValue === "string" &&
                        meetingTextValue.trim() !== ""
                    ) {
                        title = meetingTextValue;
                    } else {
                        const myTitle = await AsyncStorage.getItem(
                            "meetingTitle"
                        );

                        title =
                        meetingTextValue && meetingTextValue.trim() !== ""
                                ? meetingTextValue
                                : props._meetingName;
                    }
                } else {
                    title = props._meetingName;
                }

                // Ensure title is a string
                setTitle(typeof title === "string" ? title : "");
            } catch (error) {
                console.error("Error fetching title:", error);
            }
        };

        fetchTitle();
    }, [props._isMeetingTitleEnabled, meetingTextValue, props._meetingName]);

    if (!_visible) {
        return null;
    }

    let displayedTitle = Title;
    try {
        // Explicit type check to avoid rendering objects
        if (typeof displayedTitle !== "string") {
            throw new Error("Title is not a string");
        }
    } catch (error) {
        console.error("Error rendering title:", error);
        displayedTitle = "";
    }

    return (
        <View style={styles.titleBarWrapper as ViewStyle}>
        <View style={styles.pipButtonContainer as ViewStyle}>
            <PictureInPictureButton styles={styles.pipButton} />
        </View>
        <View
            pointerEvents="box-none"
            style={styles.roomNameWrapper as ViewStyle}
        >
            {props._conferenceTimerEnabled && (
                <View style={styles.roomTimerView as ViewStyle}>
                    <ConferenceTimer textStyle={styles.roomTimer} />
                </View>
            )}
            {props._roomNameEnabled && !props._isMeetingTitleEnabled && (
                <View style={styles.roomNameView as ViewStyle}>
                    <Text numberOfLines={1} style={styles.roomName}>
                        {props._meetingName}
                    </Text>
                </View>
            )}
            {props._isMeetingTitleEnabled && (
                <Text numberOfLines={1} style={styles.roomName}>
                    {displayedTitle}
                </Text>
            )}
            <Labels createOnPress={props._createOnPress} />
        </View>
        <View style={styles.titleBarButtonContainer}>
            <ToggleCameraButton styles={styles.titleBarButton} />
        </View>
        <View style={styles.titleBarButtonContainer}>
            <AudioDeviceToggleButton styles={styles.titleBarButton} />
        </View>
        {_isParticipantsPaneEnabled && (
            <View style={styles.titleBarButtonContainer}>
                <ParticipantsPaneButton styles={styles.titleBarButton} />
            </View>
        )}
    </View>
    );
};

/**
 * Maps part of the Redux store to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {IProps}
 */
function _mapStateToProps(state: IReduxState) {
    const { hideConferenceTimer } = state['features/base/config'];
    const startTimestamp = getConferenceTimestamp(state);

    return {
        _conferenceTimerEnabled:
            Boolean(getFeatureFlag(state, CONFERENCE_TIMER_ENABLED, true) && !hideConferenceTimer && startTimestamp),
        _isParticipantsPaneEnabled: isParticipantsPaneEnabled(state),
        _meetingName: getConferenceName(state),
        _roomNameEnabled: isRoomNameEnabled(state),
        _visible: isToolboxVisible(state),
        _isMeetingTitleEnabled: Boolean(
            getFeatureFlag(state, MEETING_TITLE, true)
        ),
    };
}

export default connect(_mapStateToProps)(TitleBar);
