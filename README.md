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
));
```

Usage
------------
You can still register your routes as usual, but if you want you can

```sh
app.namedRoute('contacts', {via: 'get', path: '/contact', handler: routes.contact.index, middlewares: []});
```

In your app.locals, you will find contactsPath = '/contacts', which you can use in your views. For your node scripts, use namedRouter.get('contacts') for the same purpose.

Work in progress
-----
Adding parameters mapping to add query string key values to paths at runtime

Status
---
UNSTABLE (work in progress)

Notes
-------------
express-named-router assumes well formed utf-8 YAML files. Do not mess up.

License
-----------------
Released under BSD license.