/**
 * @fileoverview Utility functions for the backend.
 */

import outgoingEvents from './constants/outgoing-events.js';

/**
 * Generates a random string of specified length and type.
 *
 * @param {Integer} len - The desired length of the random string.
 * @param {String} an - Optional alphanumeric type: "a" (alpha), "n" (numeric)
 * @returns {String} - The generated random string.
 */
function randomString(len, an) {
	an = an && an.toLowerCase();
	var str = "",
		i = 0,
		min = an == "a" ? 10 : 0,
		max = an == "n" ? 10 : 62;
	for (; i++ < len;) {
		var r = Math.random() * (max - min) + min << 0;
		str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
	}
	return str;
}

/**
 * Sends a request to the bot service.
 *
 * @param {Object} params - The parameters for the request.
 * @param {String} params.roomId - The ID of the room.
 * @param {Object} params.owner - The owner object for emitting events.
 * @param {String} params.baseUrl - The base URL of the bot service.
 * @param {String} params.path - The API path for the request.
 * @param {Object} params.payload - The payload to send in the request body.
 * @param {String} [params.method='POST'] - The HTTP method to use.
 * @param {String} [params.actionDescription] - Description for logging the action.
 * @param {String} [params.successDescription] - Description for logging success.
 * @param {String} [params.failureMessage] - Message for failure notification.
 * @param {Number} [params.timeoutMs] - Timeout in milliseconds for the request.
 */
async function sendBotServiceRequest({
	roomId,
	owner,
	baseUrl,
	path,
	payload,
	method = 'POST',
	actionDescription,
	successDescription,
	failureMessage,
	timeoutMs,
	fetchImpl = globalThis?.fetch
}) {
	const resolvedBase = typeof baseUrl === 'string' && baseUrl.trim().length
		? baseUrl.trim()
		: '';
	const normalizedPath = path?.startsWith('/') ? path : `/${path || ''}`;
	const endpoint = `${resolvedBase.replace(/\/+$/, '')}${normalizedPath}`;
	const logAction = actionDescription || 'Sending request to bot service';
	const successLog = successDescription || 'Bot service request succeeded';
	const failureLogMessage = failureMessage || 'Bot service request failed';
	const controller = typeof AbortController === 'function' ? new AbortController() : null;
	const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined;
	let timeoutId = null;

	console.log(`[${roomId}] ${logAction} via ${endpoint}`);

	const notifyFailure = () => {
		if (owner?.emit) {
			owner.emit(outgoingEvents.ERROR, JSON.stringify({
				message: failureLogMessage
			}));
		}
	};

	if (controller && timeout)
		timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		if (typeof fetchImpl !== 'function')
			throw new Error('fetch API is not available in this runtime');

		const response = await fetchImpl(endpoint, {
			method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload),
			signal: controller?.signal
		});

		const responseText = await response.text();
		let responseBody = null;
		if (responseText) {
			try {
				responseBody = JSON.parse(responseText);
			} catch {
				responseBody = responseText;
			}
		}

		if (!response.ok) {
			console.error(`[${roomId}] Bot service responded with ${response.status}`, responseBody);
			notifyFailure();
			return { ok: false, status: response.status, body: responseBody };
		}

		if (responseBody !== null)
			console.log(`[${roomId}] ${successLog}`, responseBody);
		else
			console.log(`[${roomId}] ${successLog}`);

		return { ok: true, body: responseBody };
	} catch (error) {
		if (error?.name === 'AbortError' && timeout)
			console.error(`[${roomId}] Bot service request timed out after ${timeout}ms`);
		else
			console.error(`[${roomId}] Bot service request failed`, error);
		notifyFailure();
		return { ok: false, error };
	} finally {
		if (timeoutId)
			clearTimeout(timeoutId);
	}
}

export default {
	randomString,
	sendBotServiceRequest
};
