export interface OAuthSession {
	authenticated: boolean;
	accessToken: string;
	cookieId: string;
	refreshToken: string;
	userId: string;
	user: unknown;
}
