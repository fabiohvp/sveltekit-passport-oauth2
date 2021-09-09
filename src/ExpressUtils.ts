/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ServerRequest } from '@sveltejs/kit/types/hooks';
import querystring from 'querystring';

export function makeExpressCompatible(request: ServerRequest): void {
	(request as any).originalUrl = `${request.host}${request.path}`;
	(request as any).query = querystring.parse(request.query?.toString());
}
