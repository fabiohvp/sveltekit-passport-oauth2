/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ServerRequest, ServerResponse, StrictBody } from '@sveltejs/kit/types/hooks';
import { makeExpressCompatible } from './ExpressUtils';

export class OAuthResponse implements ServerResponse {
	body?: StrictBody;
	headers: Record<string, string | string[]> = {};
	status: number;

	constructor(public request: ServerRequest) {
		makeExpressCompatible(request);
	}

	end(status: number): OAuthResponse {
		this.status = status;
		return this.send();
	}

	redirect(redirectUrl: string): OAuthResponse {
		this.status = 302;
		this.headers['Content-Length'] = '0';
		this.headers['Location'] = redirectUrl;
		return this.send();
	}

	send(body?: any): OAuthResponse {
		return {
			...this,
			body,
			status: this['statusCode'] || this.status
		} as OAuthResponse;
	}

	setHeader(key: string, value: string): void {
		this.headers[key] = value;
	}
}
