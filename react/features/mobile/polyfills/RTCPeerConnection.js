// import { RTCPeerConnection as PC } from 'react-native-webrtc';

// import { synthesizeIPv6Addresses } from './ipv6utils';

// /**
//  * Override PeerConnection to synthesize IPv6 addresses.
//  */
// export default class RTCPeerConnection extends PC {

//     /**
//      * Synthesize IPv6 addresses before calling the underlying setRemoteDescription.
//      *
//      * @param {Object} description - SDP.
//      * @returns {Promise<undefined>} A promise which is resolved once the operation is complete.
//      */
//     async setRemoteDescription(description) {
//         return super.setRemoteDescription(await synthesizeIPv6Addresses(description));
//     }
// }


import { RTCPeerConnection as PC, RTCSessionDescription } from 'react-native-webrtc';
import { synthesizeIPv6Addresses } from './ipv6utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Override PeerConnection to synthesize IPv6 addresses and adjust the SDP bitrate.
 */
export default class RTCPeerConnection extends PC {

    /**
     * Modify the bitrate and synthesize IPv6 addresses before calling the underlying setRemoteDescription.
     *
     * @param {Object} description - SDP.
     * @returns {Promise<undefined>} A promise which is resolved once the operation is complete.
     */
    async setRemoteDescription(description) {
        console.log("---Original description---");
        const minBitrateValue = await AsyncStorage.getItem("minBitrate")
        console.log("---minBitrateValue---", minBitrateValue);
        const min = parseInt(await AsyncStorage.getItem("minBitrate")) || 100;
        const max = parseInt(await AsyncStorage.getItem("maxBitrate")) || 256;
        const std = parseInt(await AsyncStorage.getItem("stdBitrate")) || 256;
    
        // Modify the SDP to adjust bitrate settings (Min: 100kbps, Max: 256kbps, Current: 256kbps)
        const modifiedSDP = this.modifyBitrateInSDP(description.sdp, min, max, std);
        const updatedDescription = new RTCSessionDescription({
            type: description.type,
            sdp: modifiedSDP
        });

        console.log("---Modified description---");

        // Synthesize IPv6 addresses in the SDP and pass to setRemoteDescription
        const finalDescription = await synthesizeIPv6Addresses(updatedDescription);
        return super.setRemoteDescription(finalDescription);
    }

    /**
     * Function to modify the SDP for bitrate settings.
     *
     * @param {string} sdp - The SDP string to modify.
     * @param {number} minBitrate - The minimum bitrate in kbps.
     * @param {number} maxBitrate - The maximum bitrate in kbps.
     * @param {number} startBitrate - The standard (target) bitrate in kbps.
     * @returns {string} The modified SDP string with bitrate settings.
     */
 
    modifyBitrateInSDP(sdp, minBitrate, maxBitrate, startBitrate) {
        // Bitrate configuration for both audio and video
        const bitrateConfig = [
            `b=AS:${maxBitrate}`,  // Sets the maximum bitrate
            `a=x-google-min-bitrate:${minBitrate}`,  // Sets the minimum bitrate
            `a=x-google-max-bitrate:${maxBitrate}`,  // Sets the maximum bitrate
            `a=x-google-std-bitrate:${startBitrate}`  // Sets the target bitrate
        ].join('\r\n');
    
        // Modify the SDP for both audio and video sections
        const modifiedSDP = sdp
            .replace(/(m=audio .+\r\n)/g, (match) => {
                return `${match}${bitrateConfig}\r\n`;  // Insert bitrate config for audio
            })
            .replace(/(m=video .+\r\n)/g, (match) => {
                return `${match}${bitrateConfig}\r\n`;  // Insert bitrate config for video
            });
    
        return modifiedSDP;
    }
}
