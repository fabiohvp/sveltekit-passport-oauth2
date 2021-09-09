import type { OAuthSetting } from './OAuthSettings';
import type { OAuthResponse } from './OAuthResponse';
import passport from 'passport';

export function OAuthPassportHandler(
	oauthSettings: OAuthSetting[]
): ({ request, resolve }) => Promise<OAuthResponse> {
	for (const setting of oauthSettings) {
		passport.use(setting.strategy);
	}

	return async function OAuthPassportHandler({ request, resolve }): Promise<OAuthResponse> {
		const response = await resolve(request);
		return response;
	};
}
