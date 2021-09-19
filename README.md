# sveltekit-passport-oauth2

Easy way to use passport (with OAuth2 authentication) in your svelte-kit projects

```
npm install sveltekit-passport-oauth2
```

## Configure hooks.ts
The example bellow uses Google but it should work for other strategies (also tested with facebook).

```ts
export const handle = sequence(
	OAuthPassportHandler([
		{
			strategy: new GoogleStrategy(
			{
				callbackURL: 'http://localhost:3000/auth/google/callback.json',
				clientID: 'use-your-google-client-id',
				clientSecret: 'use-your-google-client-secret',
				passReqToCallback: true
			},
			OAuthCreateCookie(/*cookieName = DefaultCookieName, cookieSettings?: CookieSettings*/))

		}
	]),
	addUserToRequest
);

//this is optional (just an example of how to add the user info to request)
async function addUserToRequest({ request, resolve }: OAuthHandleInput) {
	const cookies = cookie.parse(request.headers.cookie || '');
	const cookieId = cookies[DefaultCookieName];
	if (cookieId) {
		request.locals = Database[cookieId]; //change this to retrieve from database
	}
	const response = await resolve(request);
	return response;
}

//this is optional (it will allow you to use session in .svelte file) like:
//<script lang="ts">
//	import {session} from '$app/stores';
//	session.subscribe(console.log) //this will print user data when authenticated
//</script>
export function getSession(request: ServerRequest<Locals>): Locals {
	return request.locals;
}
```

## Create authentication routes

```ts
//login.ts
//first parameter is the strategy name
//second paramater are passport options (usually you'll only use the "scope" property)
export const get = loginMethod('google', { scope: ['email', 'profile'] });

//callback.ts
//first parameter is the strategy name
//second parameter is a callback in case you want to redirect. If you don't pass a callback the response will
//be only headers to set cookie to maxAge={DefaultCookieSettings.maxAge} and an empty body
export const get = callbackMethod(
	'google',
	(request: ServerRequest<OAuthSession>, response: OAuthResponse) => {
		if (request.locals.authenticated) {
			Database[request.locals.cookieId] = request.locals; //change this to save in database
			return response.redirect('/');
		}
		return response.redirect('/about');
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
