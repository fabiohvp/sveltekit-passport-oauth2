import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import type { OAuthResponse } from './OAuthResponse';

export interface OAuthHandleInput {
	request: ServerRequest;
	resolve(request: ServerRequest<unknown>): Promise<OAuthResponse>;
}
