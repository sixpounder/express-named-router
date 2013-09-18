express-named-router
====================

A wrapper for Express JS routes definition which defines named routes

Installation
--------------

```sh
npm install express-named-router
```

Setup
--------------
Just initialize the wrapper like this

```sh
var namedRouter = require('express-named-router');

...

namedRouter.initForApplication(app, {
    registerAppHelpers: true //Makes named routes accessibles in app.locals
});
```

Usage
------------
You can still register your routes as usual, but if you want you can

```sh
app.namedRoute('contacts', {via: 'get', path: '/contact', handler: routes.contact.index, middlewares: []});
```

In your app.locals, you will find contactsPath() = '/contacts', which you can use in your views. For your node scripts, use namedRouter.get('contacts') for the same purpose.

Route parameters
-----
When calling, let's say with the previous example, contactsPath(), and the associated route have parameters (i.e. contacts/:type would have the :type parameter in it), you can specify them like this

```sh
contactsPath({
	type: 'cellPhone'
});
```

This would return '/contacts/cellPhone'. If 'type' is not found in the parameters, it will be appended as query string parameter.

Parameters with non-matching arguments will be ignored.

Status
---
UNSTABLE (work in progress)

Notes
-------------
This is usefull for "static" routes, but not so usefull when dealing with complex regexp routes. You can still use the named routes to register routes with regexp in the express router, but the returned string (the regexp) would be pointless for view rendering purposes.

License
-----------------
Released under BSD license.