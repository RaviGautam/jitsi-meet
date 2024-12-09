// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { CONFERENCE_JOINED } from "../base/conference/actionTypes";
// import { SET_CONFIG } from "../base/config/actionTypes";
// import MiddlewareRegistry from "../base/redux/MiddlewareRegistry";

// import { setPreferredVideoQuality } from "./actions";
// import logger from "./logger";

// import "./subscriber";

// /**
//  * Implements the middleware of the feature video-quality.
//  *
//  * @param {Store} store - The redux store.
//  * @returns {Function}
//  */
// MiddlewareRegistry.register(({ dispatch, getState }) => (next) => async (action) => {
//     const result = next(action);

//     switch (action.type) {
//         case CONFERENCE_JOINED: {
//             if (navigator.product === "ReactNative") {
//                 const { resolution } = getState()["features/base/config"];
//                 if (typeof resolution !== "undefined") {
//                     dispatch(setPreferredVideoQuality(Number.parseInt(`${resolution}`, 10)));
//                     logger.info(`Configured preferred receiver video frame height to: ${resolution}`);
//                 }
//             }
//             break;
//         }
//         case SET_CONFIG: {
//             const state = getState();
//             const { videoQuality = {} } = state["features/base/config"];
//             console.log("--videoQuality-33-", videoQuality, videoQuality.persist)
//             const minBitrate = await AsyncStorage.getItem("minBitrate")
//             const stdBitrate = await AsyncStorage.getItem("stdBitrate")
//             const maxBitrate = await AsyncStorage.getItem("maxBitrate")
//             // const { stdBitrate, minBitrate, maxBitrate } = state.initialProps; // Assuming initialProps are in the state
//             console.log("--stdBitrate, minBitrate, maxBitrate-35-", stdBitrate, minBitrate, maxBitrate)
//             // Set video quality parameters based on initial props
//             const updatedVideoQuality = {
//                 ...videoQuality,
//                 maxBitratesVideo: {
//                     high: maxBitrate || 1000000,     // default max bitrate
//                     standard: stdBitrate || 300000,  // default standard bitrate
//                     low: minBitrate || 100000       // default min bitrate
//                 },
//                 // codecPreferenceOrder: codecPreference ? [codecPreference] : ["VP8", "H264", "VP9"],
//                 // codecPreferenceOrder: ["VP9"],
//                 // mobileCodecPreferenceOrder: ["VP9"],
//                 persist: videoQuality.persist
//             };

//             console.log("--Updated videoQuality settings--", updatedVideoQuality, updatedVideoQuality.maxBitratesVideo.high);

//             // Dispatch the updated video quality settings if necessary
//             if (
//                 updatedVideoQuality.persist &&
//                 typeof updatedVideoQuality.maxBitratesVideo.high !== "undefined"
//             ) {
//                 dispatch(setPreferredVideoQuality(updatedVideoQuality.maxBitratesVideo.high));
//             }

//             break;
//         }
//     }
//     console.log("---result--67-", result)
//     return result;
// });

import { CONFERENCE_JOINED } from "../base/conference/actionTypes";
import { SET_CONFIG } from "../base/config/actionTypes";
import MiddlewareRegistry from "../base/redux/MiddlewareRegistry";

import { setPreferredVideoQuality } from "./actions";
import logger from "./logger";

import "./subscriber";

/**
 * Implements the middleware of the feature video-quality.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(({ dispatch, getState }) => (next) => (action) => {
    const result = next(action);

    switch (action.type) {
        case CONFERENCE_JOINED: {
            if (navigator.product === "ReactNative") {
                const { resolution } = getState()["features/base/config"];
                console.log("--resolution--23--", resolution);
                if (typeof resolution !== "undefined") {
                    dispatch(
                        setPreferredVideoQuality(
                            Number.parseInt(`${resolution}`, 10)
                        )
                    );
                    logger.info(
                        `Configured preferred receiver video frame height to: ${resolution}`
                    );
                }
            }
            break;
        }
        case SET_CONFIG: {
            const state = getState();
            const { videoQuality = {} } = state["features/base/config"];
            console.log("--videoQuality-40-");
            const { persistedPrefferedVideoQuality } =
                state["features/video-quality-persistent-storage"];
            
            if (
                videoQuality.persist &&
                typeof persistedPrefferedVideoQuality !== "undefined"
            ) {
                
                dispatch(
                    setPreferredVideoQuality(persistedPrefferedVideoQuality)
                );
            }

            break;
        }
    }

    return result;
});
