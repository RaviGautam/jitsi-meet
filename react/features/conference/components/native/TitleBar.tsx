import React, { useEffect, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { IReduxState } from "../../../app/types";
import {
    getConferenceName,
    getConferenceTimestamp,
} from "../../../base/conference/functions";
import {
    CONFERENCE_TIMER_ENABLED,
    MEETING_TITLE,
} from "../../../base/flags/constants";
import { getFeatureFlag } from "../../../base/flags/functions";
import AudioDeviceToggleButton from "../../../mobile/audio-mode/components/AudioDeviceToggleButton";
import PictureInPictureButton from "../../../mobile/picture-in-picture/components/PictureInPictureButton";
import ParticipantsPaneButton from "../../../participants-pane/components/native/ParticipantsPaneButton";
import { isParticipantsPaneEnabled } from "../../../participants-pane/functions";
import { isRoomNameEnabled } from "../../../prejoin/functions";
import ToggleCameraButton from "../../../toolbox/components/native/ToggleCameraButton";
import { isToolboxVisible } from "../../../toolbox/functions.native";
import ConferenceTimer from "../ConferenceTimer";
import Labels from "./Labels";
import styles from "./styles";

interface IProps {
    _meetingTitle: string;
    _conferenceTimerEnabled: boolean;
    _isMeetingTitleEnabled: boolean;
    _createOnPress: Function;
    _isParticipantsPaneEnabled: boolean;
    _meetingName: string;
    _roomNameEnabled: boolean;
    _visible: boolean;
}

const TitleBar = (props: IProps) => {
    const [Title, setTitle] = useState<string>("");
    const { _isParticipantsPaneEnabled, _visible } = props;
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTitle = async () => {
            try {
                let title = "";

                if (props._isMeetingTitleEnabled) {
                    if (
                        typeof props._meetingTitle === "string" &&
                        props._meetingTitle.trim() !== ""
                    ) {
                        console.log("--_meetingTitle--54-", props._meetingTitle)
                        title = props._meetingTitle;
                    } else {
                        const myTitle = await AsyncStorage.getItem(
                            "meetingTitle"
                        );
                        console.log("--_meetingTitle--60-", myTitle)
                        title =
                            myTitle && myTitle.trim() !== ""
                                ? myTitle
                                : props._meetingName;
                    }
                } else {
                    console.log("--_meetingTitle--67-", props._meetingName)
                    title = props._meetingName;
                }

                // Ensure title is a string
                setTitle(typeof title === "string" ? title : "");
            } catch (error) {
                console.error("Error fetching title:", error);
            }
        };

        fetchTitle();
    }, [props._isMeetingTitleEnabled, props._meetingTitle, props._meetingName]);

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

function _mapStateToProps(state: IReduxState) {
    const { hideConferenceTimer } = state["features/base/config"];
    const { meetingTitle } = state["features/base/conference"];
    const startTimestamp = getConferenceTimestamp(state);

    return {
        _conferenceTimerEnabled: Boolean(
            getFeatureFlag(state, CONFERENCE_TIMER_ENABLED, true) &&
                !hideConferenceTimer &&
                startTimestamp
        ),
        _isParticipantsPaneEnabled: isParticipantsPaneEnabled(state),
        _meetingName: getConferenceName(state),
        _roomNameEnabled: isRoomNameEnabled(state),
        _visible: isToolboxVisible(state),
        _meetingTitle: meetingTitle,
        _isMeetingTitleEnabled: Boolean(
            getFeatureFlag(state, MEETING_TITLE, true)
        ),
    };
}

export default connect(_mapStateToProps)(TitleBar);