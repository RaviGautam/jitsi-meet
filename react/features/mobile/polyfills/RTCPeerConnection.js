// import { RTCPeerConnection as PC, RTCSessionDescription } from 'react-native-webrtc';
// import { synthesizeIPv6Addresses } from './ipv6utils';

// /**
//  * Override PeerConnection to synthesize IPv6 addresses and adjust the SDP bitrate.
//  */
// export default class RTCPeerConnection extends PC {

//     /**
//      * Modify the bitrate and synthesize IPv6 addresses before calling the underlying setRemoteDescription.
//      *
//      * @param {Object} description - SDP.
//      * @returns {Promise<undefined>} A promise which is resolved once the operation is complete.
//      */
//     async setRemoteDescription(description) {
//         console.log("---Original description---", description);

//         // Modify the SDP to adjust bitrate settings (Min: 100kbps, Max: 256kbps, Current: 256kbps)
//         const modifiedSDP = this.modifyBitrateInSDP(description.sdp, 100, 256, 256);
//         const updatedDescription = new RTCSessionDescription({
//             type: description.type,
//             sdp: modifiedSDP
//         });

//         console.log("---Modified description---", updatedDescription);

//         // Synthesize IPv6 addresses in the SDP and pass to setRemoteDescription
//         const finalDescription = await synthesizeIPv6Addresses(updatedDescription);
        
//         // Log the stats after setting the remote description
//         this.logStats();

//         return super.setRemoteDescription(finalDescription);
//     }

//     /**
//      * Function to modify the SDP for bitrate settings.
//      *
//      * @param {string} sdp - The SDP string to modify.
//      * @param {number} minBitrate - The minimum bitrate in kbps.
//      * @param {number} maxBitrate - The maximum bitrate in kbps.
//      * @param {number} startBitrate - The standard (target) bitrate in kbps.
//      * @returns {string} The modified SDP string with bitrate settings.
//      */
//     modifyBitrateInSDP(sdp, minBitrate, maxBitrate, startBitrate) {
//         // Insert min, max, and start bitrates in the video section of the SDP
//         const videoBitrateConfig = [
//             `b=AS:${maxBitrate}`,  // Sets the maximum bitrate for the video stream
//             `a=x-google-min-bitrate:${minBitrate}`,  // Sets the minimum bitrate
//             `a=x-google-max-bitrate:${maxBitrate}`,  // Sets the maximum bitrate
//             `a=x-google-start-bitrate:${startBitrate}`  // Sets the standard/target bitrate
//         ].join('\r\n');

//         // Regex to find the video media section and inject bitrate settings
//         return sdp.replace(/(m=video .+\r\n)/g, (match) => {
//             return `${match}${videoBitrateConfig}\r\n`;
//         });
//     }

//     /**
//      * Logs the stats for the peer connection.
//      * Call this method to check the current stats like bitrate.
//      */
//     async logStats() {
//         try {
//             const stats = await this.getStats();
//             stats.forEach(report => {
//                 console.log("--report--",report)
//                 if (report.type === 'media-source') {
//                     console.log("Video stats report:", report);
//                     console.log("Video bitrate:", report.bytesSent);
//                     // You can add more details here depending on what information you need from the stats
//                 }
//             });
//         } catch (error) {
//             console.error("Error fetching stats:", error);
//         }
//     }
// }

import { RTCPeerConnection as PC, RTCSessionDescription } from 'react-native-webrtc';
import { synthesizeIPv6Addresses } from './ipv6utils';

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
        console.log("---Original description---", description);

        // Modify the SDP to adjust bitrate settings (Min: 100kbps, Max: 256kbps, Current: 256kbps)
        const modifiedSDP = this.modifyBitrateInSDP(description.sdp, 100, 256, 256);
        const updatedDescription = new RTCSessionDescription({
            type: description.type,
            sdp: modifiedSDP
        });

        console.log("---Modified description---", updatedDescription);

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
    // modifyBitrateInSDP(sdp, minBitrate, maxBitrate, startBitrate) {
    //     // Insert min, max, and start bitrates in the video section of the SDP
    //     const videoBitrateConfig = [
    //         `b=AS:${maxBitrate}`,  // Sets the maximum bitrate for the video stream
    //         `a=x-google-min-bitrate:${minBitrate}`,  // Sets the minimum bitrate
    //         `a=x-google-max-bitrate:${maxBitrate}`,  // Sets the maximum bitrate
    //         `a=x-google-std-bitrate:${startBitrate}`  // Sets the standard/target bitrate
    //     ].join('\r\n');

    //     // Regex to find the video media section and inject bitrate settings
    //     return sdp.replace(/(m=video .+\r\n)/g, (match) => {
    //         return `${match}${videoBitrateConfig}\r\n`;
    //     });
    // }
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

// import { RTCPeerConnection as PC, RTCSessionDescription } from 'react-native-webrtc';
// import { synthesizeIPv6Addresses } from './ipv6utils';

// /**
//  * Override PeerConnection to synthesize IPv6 addresses and adjust the SDP bitrate.
//  */
// export default class RTCPeerConnection extends PC {

//     /**
//      * Modify the bitrate and synthesize IPv6 addresses before calling the underlying setRemoteDescription.
//      *
//      * @param {Object} description - SDP.
//      * @returns {Promise<undefined>} A promise which is resolved once the operation is complete.
//      */
//     async setRemoteDescription(description) {
//         console.log("---Original description---", description);

//         // Modify the SDP to adjust bitrate settings (Min: 100kbps, Max: 256kbps, Current: 256kbps)
//         const modifiedSDP = this.modifyBitrateInSDP(description.sdp, 100, 256, 256);
//         const updatedDescription = new RTCSessionDescription({
//             type: description.type,
//             sdp: modifiedSDP
//         });

//         console.log("---Modified description---", updatedDescription);

//         return super.setRemoteDescription(await synthesizeIPv6Addresses(updatedDescription));
//     }

//     /**
//      * Function to modify the SDP for bitrate settings.
//      *
//      * @param {string} sdp - The SDP string to modify.
//      * @param {number} minBitrate - The minimum bitrate in kbps.
//      * @param {number} maxBitrate - The maximum bitrate in kbps.
//      * @param {number} startBitrate - The standard (target) bitrate in kbps.
//      * @returns {string} The modified SDP string with bitrate settings.
//      */
//     modifyBitrateInSDP(sdp, minBitrate, maxBitrate, startBitrate) {
//         // Insert min, max, and start bitrates in the video section of the SDP
//         const videoBitrateConfig = [
//             `b=AS:${minBitrate}`,  // Sets the maximum bitrate for the video stream
//             `a=x-google-min-bitrate:${minBitrate}`,  // Sets the minimum bitrate
//             `a=x-google-max-bitrate:${maxBitrate}`,  // Sets the maximum bitrate
//             `a=x-google-start-bitrate:${startBitrate}`  // Sets the standard/target bitrate
//         ].join('\r\n');

//         // Replace the video section with the new bitrate configuration
//         return sdp.replace(/(m=video .+\r\n)/g, `$1${videoBitrateConfig}\r\n`);
//     }
// }

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
