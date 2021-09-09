/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OAuthResponse } from './OAuthResponse';
import cookie from 'cookie';
import { v4 } from '@lukeed/uuid';
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import type { OAuthSession } from './OAuthSession';

export interface CookieSettings {
	httpOnly: boolean;
	maxAge: number;
	sameSite: boolean | 'lax' | 'strict' | 'none';
	path: string;
}

export const DefaultCookieName = 'passport_cookie_id';

export const DefaultCookieSettings: CookieSettings = {
	httpOnly: true,
	maxAge: 60 * 60 * 24,
	sameSite: 'lax',
	path: '/'
};

export function OAuthCreateCookie(
	cookieName = DefaultCookieName,
	cookieSettings?: CookieSettings
): any {
	return async function (
		request: ServerRequest,
		accessToken: string,
		refreshToken: string,
		user: any,
		done: (err, createCookie: (response: OAuthResponse) => void) => any
	): Promise<any> {
		cookieName = cookieName ?? DefaultCookieName;
		return done(null, (response: OAuthResponse) => {
			const _cookieSettings = cookieSettings ?? { ...DefaultCookieSettings };
			const cookies = cookie.parse(request.headers.cookie || '');
			const cookieId = cookies[cookieName] || v4();

			if (user) {
				request.locals = {
					accessToken,
					authenticated: true,
					cookieId,
					refreshToken,
					user,
					userId: user.id
				} as OAuthSession;
			} else {
				_cookieSettings.maxAge = 0;
			}
			response.headers['set-cookie'] = cookie.serialize(cookieName, cookieId, _cookieSettings);
		});
	};
}
