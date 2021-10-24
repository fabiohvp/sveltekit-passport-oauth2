export * from './OAuthResponse';
export * from './OAuthSettings';
export * from './OAuthHandleInput';
export * from './OAuthCookie';
export * from './OAuthSession';
export * from './OAuthApis';
export * from './ExpressUtils';
import type { OAuthSetting } from './OAuthSettings';
import passport from 'passport';

export function ConfigurePassportOAuth2(oauthSettings: OAuthSetting[]): void {
	for (const setting of oauthSettings) {
		passport.use(setting.strategy);
	}
}
