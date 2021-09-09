import type { RequestHandler } from '@sveltejs/kit';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import { OAuthResponse } from './OAuthResponse';
import type { OAuthSession } from './OAuthSession';
import cookie from 'cookie';
import passport from 'passport';
import { DefaultCookieName, DefaultCookieSettings } from './OAuthCookie';

export const callbackMethod: (
	provider: string,
	callback: (request: ServerRequest, response: OAuthResponse) => OAuthResponse
) => RequestHandler<OAuthSession> = (
	provider: string,
	callback: (request: ServerRequest, response: OAuthResponse) => OAuthResponse
) => {
	return async (request: ServerRequest) => {
		const response = new OAuthResponse(request);
		const promise = new Promise((resolve) => {
			passport.authenticate(provider, async (_, createCookie) => {
				createCookie(response);
				resolve(callback(request, response));
			})(request, response);
		});
		return promise;
	};
};

export const loginMethod: (provider: string, scope: string[]) => RequestHandler<OAuthSession> = (
	provider: string,
	scope: string[]
) => {
	return async (request: ServerRequest) => {
		const response = new OAuthResponse(request);
		passport.authenticate(provider, { scope: scope, session: false })(request, response);
		return response.send();
	};
};

export const logoutMethod: (
	cookieName?: string,
	callback?: (request: ServerRequest, response: OAuthResponse) => OAuthResponse
) => RequestHandler<OAuthSession> = (
	cookieName = DefaultCookieName,
	callback?: (request: ServerRequest, response: OAuthResponse) => OAuthResponse
) => {
	cookieName = cookieName ?? DefaultCookieName;

	return async (request: ServerRequest) => {
		const response = new OAuthResponse(request);
		const cookies = cookie.parse(request.headers.cookie || '');
		const cookieId = cookies[cookieName];
		if (cookieId) {
			response.headers['set-cookie'] = cookie.serialize(cookieName, cookieId, {
				...DefaultCookieSettings,
				maxAge: 0
			});
		}
		if (callback) {
			return callback(request, response);
		}
		return response.send();
	};
};
