#React-Server Quickstart Guide using `react-server-cli`
This will be a step-by-step guide to getting react-server up and running and serving a page as fast as possible.  If you are interested in exactly what is happening take a look at [react-server](../../packages/react-server) itself, some of the steps are repeated here but modified to work with the `react-server-cli`.

If you are just looking for the tool, install it with these [installation instructions](##Just).


##What is `react-server-cli`?
It is a simple command line app that will compile a routes file and its dependencies for the client and start up express to run `react-server`.

The CLI builds and runs a `react-server` project, using Express. It compiles JS(X-with support from babel) and CSS into efficiently loadable bundles with code splitting using webpack, and it supports hot reloading of React components on the client-side during development.

##Getting Started

1. We need to install node.js.	We recommend installing node v4.2.3 with [n](https://github.com/tj/n) a version manager for node.js. See their [installation instructions](https://github.com/tj/n#installation) and [usage](https://github.com/tj/n#usage) for more details. If you already have node and npm installed, just go ahead install the correct version:

		npm install -g n && n 4.2.3

2. Create a new project folder and add some basic folders that will be used for your site:

		mkdir example-react-server-site && cd example-react-server-site
		mkdir pages

3. Create a new npm project (follow the helpful [npm prompts](https://docs.npmjs.com/cli/init)).

		npm init

4. Install `react-server` and `react-server-cli`
 
		npm install --save react-server-cli react-server

5. Create a page object:

		touch pages/HelloWorld.js

	And add the page class:
	```javascript
		// "use strict" required to use `class` and `let`, but not strictly required
		// for using react-server.
		"use strict";

		var React = require("react");

		// TODO: jsx support
		module.exports = class HelloWorldPage {
			getElements() {
				return React.createElement("div", null, "Hello, World!");
			}
		}
```
If you are interested in what else a page is capable of doing take a look here: [page-docs](../../packages/react-server/docs/page-api.md#page)


6. Create the routes -- This file will tell the server where to find the page classes to render, [route-docs](../../packages/react-server/docs/page-api.md#route):

		touch routes.js

	And add a HelloWorld route:
	
	```javascript
module.exports = {

	// this maps URLs to modules that export a Page class.
	routes: {
		BazRoute: {
			path: ["/"],
			method: "get",
			page: "./pages/HelloWorld"
		},
	}
};
```

7. Add `./node_modules/react-server-cli/bin/react-server-cli` as the value for `scripts.start` in package.json.
8. `npm start` from the directory that has your routes.js file.
    * This will compile all of your objects and start the server listening on port 3000.
9. Navigate to {host:3000} to see your page!

## Just Give Me The Tool
1. Install the cli: `npm install --save react-server-cli`
2. Add `./node_modules/react-server-cli/bin/react-server-cli` as the value for `scripts.start` in package.json.
3. `npm start` from the directory that has your routes.js file.

## Routes Format

Note that the routes file needs to be in a bit different format than what we have used in the past in `react-server`. Rather than `routes.route.page` being a function, it needs to be a path to a file that exports a page class. Middleware also needs to be an array of file paths. For example:

```javascript
module.exports = {
	// these will be applied to every page in the site.
	middleware: ["./FooMiddleware", "./BarMiddleware"],

	// this maps URLs to modules that export a Page class.
	routes: {
		BazRoute: {
			path: ["/"],
			method: "get",
			page: "./BazPage"
		},
		BakRoute: {
			path: ["/bak"],
			method: "get",
			page: "./BakPage"
		}
	}
};
```

##Built-in Features

###Babel Compilation
It's rare to see a project these days in the JavaScript world that isn't at least experimenting with ES2015 and ES7. To make this easier, all code in your project will be run through Babel, and source maps will be generated back to the original file.

To take advantage of the Babel compilation, you need to install the Babel plugins and presets you want and reference them in a `.babelrc` file in your code directory. For more on the `.babelrc` format, see [its documentation here](https://babeljs.io/docs/usage/babelrc/).

##Options
Smart defaults are the goal, and `react-server-cli` has two base modes: **development** and **production**. `react-server-cli` will determine which base mode it's in by looking at the NODE_ENV environment variable. If it's not "production", then `react-server-cli` will assume we are in development mode.

###Ways to add options

There are three ways to pass options to the CLI, through the command line, `.reactserverrc` JSON files, or as a `reactServer` entry in `package.json` files. It searches for options this way:

1. If there are any options arguments on the command line, they are used. For the options which aren't specified:
1. `react-server-cli` looks at the current directory.
 1. If there is a JSON file named `.reactserverrc` in the directory, its settings are used and we skip to step #4. Otherwise:
 1. If there is a `package.json` file in the current directory with an entry named `reactServer`, its settings are used and we skip to step #4. Otherwise:
1. Go back to step 2 in the parent of the current directory. Repeat until you either find a config or hit the root directory.
1. If there are any options that still aren't specified, the defaults are used.

Note that the programmatic API also searches for config files, although options sent in explicitly to the API function override the config file.

###JSON options can be set per environment

If you are using either `.reactserverrc` or `package.json` to set your react-server options, you can provide environment-specific values in a sub-object at the key `env`. It looks like this:

```json
{
	"port": "5000",
	"env": {
		"staging": {
			"port": "4000"
		},
		"production": {
			"port": "80"
		}
	}
}
```

The values in a particular environment override the main settings. In this example configuration `port` will be set to 80 if `process.env.NODE_ENV` is `production`, 4000 if `process.env.NODE_ENV` is `staging`, and 5000 for any other situation.

###Development mode: making a great DX

Development mode is the default, and its goals are rapid startup and code-test loops. Hot mode is enabled for all code, although at this time, editing the routes file or modules that export a Page class still requires a browser reload to see changes. Modules that export a React component should reload without a browser refresh.

In development mode, code is not minified in order to speed up startup time, so please do not think that the sizes of bundles in development mode is indicative of how big they will be in production. In fact, it's really best not to do any kind of perf testing in development mode; it will just lead you astray.

We are also considering completely getting rid of server-side rendering in development mode by default to speed startup.

###Production mode: optimizing delivery

Production mode's priority is optimization at the expense of startup time. A separate code bundle is generated for every entry point into your app so that there is at most just one JS and one CSS file loaded by the framework. All code is minified, and hot reloading is turned off.

####Building static files for production use

In many production configurations, you may not want `react-server-cli` to serve up your static JavaScript and CSS files. Typically, this is because you have a more performant static file server already set up or because you upload all your static files to a CDN server.

To use `react-server-cli` in this sort of production setup, follow these steps:

1. `react-server-cli --production --compile-only` compiles the JavaScript and CSS files into the directory `__clientTemp/build`.
1. Upload the contents of `__clientTemp/build` to your static file server.
1. `react-server-cli --production --js-url="http://mystaticfileserver.com/somedirectory/"` to start your HTML server depending on JavaScript and CSS files from your static file server.

###Setting Options Manually

While development and production mode are good starting points, you can of course choose to override any of the setup by setting the following options:

#### --routes
The routes file to load.

Defaults to **"./routes.js"**.

#### --host
The hostname to use when starting up the server. If `jsUrl` is set, then this argument is ignored, and any host name can be used.

Defaults to **localhost**.

#### --port, -p
The port to start up the main server, which will serve the pre-rendered HTML files.

Defaults to **3000**.

#### --js-port
The port to use when `react-server-cli` is serving up the client JavaScript.

Defaults to **3001**.

#### --hot, -h
Use hot reloading of client JavaScript. Modules that export React components will reload without refreshing the browser.

Defaults to **true** in development mode and **false** in production mode.

#### --minify, -m
Minify client JavaScript and CSS.

Defaults to **false** in development mode and **true** in production.

#### --compile-only
Compile the client JavaScript only, and don't start any servers. This is what you want to do if you are building the client JavaScript to be hosted on a CDN or separate server. Unless you have a very specific reason, it's almost always a good idea to only do this in production mode.

Defaults to **false**.

#### --js-url
A URL base for the pre-compiled client JavaScript; usually this is a base URL on a CDN or separate server. Setting a value for js-url means that react-server-cli will not compile the client JavaScript at all, and it will not serve up any of the client JavaScript. Obviously, this means that --js-url overrides and ignores all of the options related to JavaScript compilation and serving: --hot, --js-port, and --minify.

Defaults to **null**.


#### --https

If true, the server will start up using https with a self-signed certificate. Note that browsers do not trust self-signed certificates by default, so you will have to click through some warning screens. This is a quick and dirty way to test HTTPS, but it has some limitations and should never be used in production. Requires OpenSSL to be installed.

Defaults to **false**.

#### --https-key

Start the server using HTTPS with this private key file in PEM format. Requires `https-cert` to be set as well.

 Default is **none**.

#### --https-cert

Start the server using HTTPS with this cert file in PEM format. Requires `https-key` to be set as well.

Default is **none**.

#### --https-ca

Start the server using HTTPS with this certificate authority file in PEM format. Also requires `https-key` and `https-cert` to start the server.

Default is **none**.

#### --https-pfx

Start the server using HTTPS with this file containing the private key, certificate and CA certs of the server in PFX or PKCS12 format. Mutually exclusive with `https-key`, `https-cert`, and `https-ca`.

Default is **none**.

#### --https-passphrase

A passphrase for the private key or pfx file. Requires `https-key` or `https-pfx` to be set.

Default is **none**.

#### --log-level
Sets the severity level for the logs being reported. Values are, in ascending order of severity: 'debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'.

Default is **'debug'** in development mode and **'notice'** in production.

#### --help, -?
Shows command line options.

## API

You can also call `react-server-cli` programmatically. The module has a single named export, `start`, which takes has the following signature:

```javascript
import {start} from `react-server-cli`

start(routesRelativePath, {
		port: 3000,
		jsPort: 3001,
		hot: true,
		minify: false,
		compileOnly: false,
		jsUrl: null,
})
```

All of the values in the second argument are optional, and they have the same defaults as the corresponding CLI arguments explained above. (Also note that if an option isn't present, the programmatic API will search for a config file in the same way as the CLI.)

##Future Directions

Here are a few of the things on the unordered wishlist to add to `react-server-cli`:

* Default to https, with http as a special case. If no cert & key specified, make a self-signed cert/key combo.
* Ability to output a completely static site, if the user wants to forgo server-side rendering.
* Ability to forgo server rendering in development mode.
* A programmatic API.
* Automatic compilation of SASS and LESS.
* Ability to opt out of Babel compilation.
* Inclusion of CSS Modules
* Best practices for static file HTTP caching (last-mod, filename hashes, etags, etc.)
* Help with proxying API endpoints.
