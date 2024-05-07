// NB: This import must always come first.
import "./bootstrap.native";

import React, { PureComponent } from "react";
import { AppRegistry } from "react-native";

import { App } from "./features/app/components/App.native";
import { _initLogging } from "./features/base/logging/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * React Native doesn't support specifying props to the main/root component (in
 * the JS/JSX source code). So create a wrapper React Component (class) around
 * features/app's App instead.
 *
 * @augments Component
 */
class Root extends PureComponent {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    componentDidMount() {
        
        const { minBitrate, stdBitrate, maxBitrate} = this.props;
        this.saveBitrateValues(minBitrate, stdBitrate, maxBitrate);
    }

    async saveBitrateValues(minBitrate, stdBitrate, maxBitrate) {
        console.log("--minBitrate, stdBitrate, maxBitrate--32---", minBitrate, stdBitrate, maxBitrate)
        try {
            await AsyncStorage.setItem("minBitrate", minBitrate.toString());
            await AsyncStorage.setItem("stdBitrate", stdBitrate.toString());
            await AsyncStorage.setItem("maxBitrate", maxBitrate.toString());
     
        } catch (error) {
            console.error("Error saving bitrate values:", error);
        }
    }
    render() {
        return <App {...this.props} />;
    }
}

// Initialize logging.
_initLogging();

// Register the main/root Component of JitsiMeetView.
AppRegistry.registerComponent("App", () => Root);
