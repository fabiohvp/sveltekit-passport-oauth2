# sveltekit-passport-oauth2

Easy way to use passport (with OAuth2 authentication) in your svelte-kit projects

```
npm install sveltekit-passport-oauth2
```

## Configure backend
### Configure hooks.ts

The example bellow uses Google but it should work for other strategies (also tested with facebook).
Assuming the following file structure src/hooks.ts and src/routes/auth/google/(login|logout|callback).ts

```ts
import {
	ConfigurePassportOAuth2,
	OAuthHandleInput,
	OAuthCreateCookie,
	DefaultCookieName
} from 'sveltekit-passport-oauth2';

ConfigurePassportOAuth2([
	{
		strategy: new GoogleStrategy(
			{
				callbackURL: 'http://localhost:3000/auth/google/callback.json',
				clientID: 'use-your-google-client-id',
				clientSecret: 'use-your-google-client-secret',
				passReqToCallback: true
			},
			OAuthCreateCookie(/*cookieName = DefaultCookieName, cookieSettings?: CookieSettings*/)
		)
	}
]);
export const handle = sequence(addUserToRequest);

//add the user info to request (you can access this info in and endpoint using `request.locals`)
async function addUserToRequest({ request, resolve }: OAuthHandleInput) {
	const cookies = cookie.parse(request.headers.cookie || '');
	const cookieId = cookies[DefaultCookieName];
	if (cookieId) {
		request.locals = Database[cookieId]; //change this to retrieve from database
	}
	const response = await resolve(request);
	return response;
}

//this will expose user info in session and can be retrieved in the front end using $session
export function getSession(request: ServerRequest<Locals>): Locals {
	return request.locals;
}
```

### Create authentication routes

```ts
//login.ts
//first parameter is the strategy name
//second paramater are passport options (usually you'll only use the "scope" property)
export const get = loginMethod('google', { scope: ['email', 'profile'] });

//callback.ts
//first parameter is the strategy name
//second parameter is a callback in case you want to redirect. If you don't pass a callback the response will
//be only headers to set cookie to maxAge={DefaultCookieSettings.maxAge} and an empty body
//CHOOSE which kind you of callback you want (with redirect or popup)

//WITH REDIRECT
export const get = callbackMethod(
	'google',
	(request: ServerRequest<OAuthSession>, response: OAuthResponse) => {
		if (request.locals.authenticated) {
			Database[request.locals.cookieId] = {
				...request.locals,
				roles: ['guest', 'admin']
			}; //just an example
			return response.redirect('/');
		}
		return response.redirect('/about');
	}
);

//WITH POPUP (NO REDIRECT)
export const get = callbackMethod(
	'google',
	(request: ServerRequest<OAuthSession>, response: OAuthResponse) => {
		if (request.locals.authenticated) {
			Database[request.locals.cookieId] = {
				...request.locals,
				roles: ['guest', 'admin']
			}; //just an example
		}
		return response.send(
			`<script>window.opener.postMessage(${JSON.stringify({
				authentication: {
					success: true,
					data: Database[request.locals.cookieId]
				}
			})}, '*');window.close();</script>`
		);
	}
);

//logout.ts
//first parameter is the cookieName, if you pass 'undefined' it will use the {DefaultCookieName}
//second parameter is a callback in case you want to redirect, if you don't pass a callback the response will
//be only headers to set cookie to maxAge=0 and an empty body
export const get = logoutMethod(undefined, (request, response) => {
	return response.redirect('/');
});
```

## Configure frontend
```js
//WITH REDIRECT
//no javascript code required

//WITH POPUP (NO REDIRECT)
import { page, session } from '$app/stores';
import { onMount } from 'svelte';

onMount(() => {
	window.addEventListener(
		'message',
		(event) => {
			if (event.data.authentication) {
				if (event.data.authentication.success) {
					$session = event.data.authentication.data;
				} else {
					$session = {};
				}
			}
		},
		false
	);
});

async function authenticate() {
	const popup = window.open('/auth/google.json', 'Authentication', 'height=600,width=450');
	if (window.focus) {
		popup.focus();
	}
}
```
```html
<!--WITH REDIRECT-->
<a href="/auth/google.json">Login</a>
<a href="/auth/google/logout.json">Logout</a>
```

```html
<!--WITH POPUP (NO REDIRECT)-->
{#if $session.authenticated}
	<li>
		<a href="/auth/google/logout.json">Logout</a>
	</li>
{:else}
	<li>
		<a href="/" on:click={authenticate}>Login</a>
	</li>
{/if}
```
## UTILS: store with methods to check authenticated and permission
```js
import { session, page } from '$app/stores';
import { derived } from 'svelte/store';
import { Database } from '$lib/Storage';

export const authorization = derived([page, session], ([$page, $session]) => ({
	canAccess: () => {
		return (
			$session.authenticated &&
			$session.roles.some((role) => Database['roles'][role].test($page.path))
		);
	},
	canUse: (roles?: string[]) =>
		!roles || ($session.authenticated && $session.roles.some((role) => roles.includes(role)))
}));
```

```html
{#if $authorization.canAccess()}
	<h2 class="text-red-600">Can access</h2>
{/if}

{#if $authorization.canUse(['admin'])}
	<h2>can use</h2>
{/if}
```