import { IStateful } from '../app/types';
import { toState } from '../redux/functions';
import { toURLString } from '../util/uri';

import { getURLWithoutParams } from './utils';

/**
 * Figures out what's the current conference URL which is supposed to indicate what conference is currently active.
 * When not currently in any conference and not trying to join any then 'undefined' is returned.
 *
 * @param {Object|Function} stateful - Either the whole Redux state object or the Redux store's {@code getState} method.
 * @returns {string|undefined}
 * @private
 */
export function getCurrentConferenceUrl(stateful: IStateful) {
    const state = toState(stateful);
    console.log("--state-17-", state)
    let currentUrl;


    if (isInviteURLReady(state)) {
        currentUrl = toURLString(getInviteURL(state));
        console.log("--currentUrl-23-", currentUrl)
    }

    // Check if the URL doesn't end with a slash
    if (currentUrl && currentUrl.substr(-1) === '/') {
        currentUrl = undefined;
    }

    console.log("--currentUrl-31-", currentUrl)
    return currentUrl ? currentUrl : undefined;
}

/**
 * Retrieves a simplified version of the conference/location URL stripped of URL params (i.e. Query/search and hash)
 * which should be used for sending invites.
 * NOTE that the method will throw an error if called too early. That is before the conference is joined or before
 * the process of joining one has started. This limitation does not apply to the case when called with the URL object
 * instance. Use {@link isInviteURLReady} to check if it's safe to call the method already.
 *
 * @param {Function|Object} stateOrGetState - The redux state or redux's {@code getState} function or the URL object
 * to be stripped.
 * @returns {string}
 */
export function getInviteURL(stateOrGetState: IStateful): string {
    const state = toState(stateOrGetState);
    console.log("--state-48-", state)
    let locationURL
        = state instanceof URL
            ? state
            : state['features/base/connection'].locationURL;
            console.log("--locationURL-48-", locationURL)

    // If there's no locationURL on the base/connection feature try the base/config where it's set earlier.
    if (!locationURL) {
        locationURL = state['features/base/config'].locationURL;
    }

    if (!locationURL) {
        throw new Error('Can not get invite URL - the app is not ready');
    }

    const { inviteDomain } = state['features/dynamic-branding'];
    console.log("--inviteDomain-59-", inviteDomain)
    const urlWithoutParams = getURLWithoutParams(locationURL);
    console.log("--urlWithoutParams-61-", urlWithoutParams)
    if (inviteDomain) {
        const meetingId
            = state['features/base/config'].brandingRoomAlias || urlWithoutParams.pathname.replace(/\//, '');
        console.log("---meetingId-67-", meetingId)
        return `${inviteDomain}/${meetingId}`;
    }
    console.log("--urlWithoutParams-73-", urlWithoutParams.href)
    return urlWithoutParams.href;
}

/**
 * Checks whether or not is safe to call the {@link getInviteURL} method already.
 *
 * @param {Function|Object} stateOrGetState - The redux state or redux's {@code getState} function.
 * @returns {boolean}
 */
export function isInviteURLReady(stateOrGetState: IStateful): boolean {
    const state = toState(stateOrGetState);
console.log("--state-85-", state)
    return Boolean(state['features/base/connection'].locationURL || state['features/base/config'].locationURL);
}

/**
 * Converts a specific id to jid if it's not jid yet.
 *
 * @param {string} id - User id or jid.
 * @param {Object} configHosts - The {@code hosts} part of the {@code config}
 * object.
 * @returns {string} A string in the form of a JID (i.e.
 * {@code user@server.com}).
 */
export function toJid(id: string, { authdomain, domain }: {
    anonymousdomain?: string;
    authdomain?: string;
    domain?: string;
    focus?: string;
    muc?: string;
    visitorFocus?: string;
}): string {
    return id.indexOf('@') >= 0 ? id : `${id}@${authdomain || domain}`;
}
