// NB: This import must always come first.
import './bootstrap.native';

import React, { PureComponent } from 'react';
import { AppRegistry, Platform } from 'react-native';

import { App } from './features/app/components/App.native';
import { _initLogging } from './features/base/logging/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * React Native doesn't support specifying props to the main/root component (in
 * the JS/JSX source code). So create a wrapper React Component (class) around
 * features/app's App instead.
 *
 * @augments Component
 */

const extractCustomParams = (initialProps) => {

    if (Platform.OS === "ios") {
        // Extract custom params from URL object for iOS
        return initialProps.url?.config ?? {};
    } else if (Platform.OS === "android") {
        // Directly access custom params for Android
        return {
            minBitrate: initialProps.minBitrate,
            stdBitrate: initialProps.stdBitrate,
            maxBitrate: initialProps.maxBitrate,
            meetingTitle: initialProps.meetingTitle,
            waitingAreaText: initialProps.waitingAreaText,
            lobyTitle: initialProps.lobyTitle,
            lobyDescription: initialProps.lobyDescription
        };
    } else {
        // Handle other platforms if needed
        return {};
    }
};
class Root extends PureComponent {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    componentDidMount() {
        const customParams = extractCustomParams(this.props);
        const {
            minBitrate,
            stdBitrate,
            maxBitrate,
            meetingTitle,
            waitingAreaText,
            lobyTitle,
            lobyDescription
        } = customParams;
        this.saveBitrateValues(minBitrate, stdBitrate, maxBitrate);
        this.saveTitleValues(meetingTitle, waitingAreaText, lobyTitle, lobyDescription);
    }

    async saveBitrateValues(minBitrate, stdBitrate, maxBitrate) {
    
        try {
            await AsyncStorage.setItem("minBitrate", minBitrate.toString());
            await AsyncStorage.setItem("stdBitrate", stdBitrate.toString());
            await AsyncStorage.setItem("maxBitrate", maxBitrate.toString());
        } catch (error) {
            console.error("Error saving bitrate values:", error);
        }
    }

    async saveTitleValues(meetingTitle, waitingAreaText, lobyTitle,lobyDescription) {
      console.log("--waitingAreaText---", waitingAreaText,)
      console.log("--meetingTitle---", meetingTitle,)
      console.log("--lobyTitle---", lobyTitle,)
      console.log("--lobyDescription---", lobyDescription,)
      
        try {
            await AsyncStorage.setItem("waitingText", waitingAreaText.toString());
            await AsyncStorage.setItem("meetingTitle", meetingTitle.toString());
            await AsyncStorage.setItem("lobyTitle", lobyTitle.toString());
            await AsyncStorage.setItem("lobyDescription", lobyDescription.toString());
        } catch (error) {
            console.error("Error saving bitrate values:", error);
        }
    }
    render() {
        return (
            <App { ...this.props } />
        );
    }
}

// Initialize logging.
_initLogging();

// Register the main/root Component of JitsiMeetView.
AppRegistry.registerComponent('App', () => Root);
