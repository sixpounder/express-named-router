var _ = require('underscore');

var namedRouter = function namedRouter() {
    var _map = {};
    var applicationInstance = undefined;
    var _allowedVerbs = ['all', 'get', 'post', 'put', 'del'];
    var _options = {};
    var _pCheck = /:[a-zA-Z0-9_]+(\?)?(\/)?/

    /**
     * Installs named router to appInstance
     */
    this.initForApplication = function(appInstance, options) {
        options = options || {};
        options.registerAppHelpers = options.registerAppHelpers || true;
        options.baseURL = options.baseURL || "";
        _options = options;
        if (typeof appInstance === 'undefined' || !appInstance) {
            throw new Error('[NamedRouter] applicationInstance option not specified');
        } else {            
            applicationInstance = appInstance;
            appInstance.namedRoute = this.namedRoute;
        }

        // Register a middleware to store base URL
        applicationInstance.use(function(req,res,next) {
            
            if (_options.baseURL == "") {
                var hostname = (req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
                var port = (req.headers.host.match(/:/g)) ? req.headers.host.slice(req.headers.host.indexOf(":") + 1, req.headers.host.length) : 80;

                _options.hostname = hostname;
                _options.port = port;
                _options.protocol = req.protocol;
                _options.baseURL = req.protocol + "://" + hostname + (port == 80 ? "" : (":" + port) );
                
            }

            next();
        });
    };

    /**
     * Gets a named route
     */
    this.get = function(name) {
        return _map[name];
    };

    /**
     * Adds a named route with specified options
     */
    this.namedRoute = function(name,data) {
        var objs;
        if (typeof name === 'string' && typeof data === 'object') {
            // single objects passed
            objs = [];

            var e = {};
            e[name] = data;
            objs.push(e);

        } else if (typeof name === 'array') {
            // Array passed
            objs = name;
            //[name: {..data..}];
        } else {
            throw new Error('[NamedRouter] namedRoute::SpecifyTheGoddamnParams');
        }
        
        _.each(objs, function(elementInArray) {          
            // Key is route name, value are options
            _.map(elementInArray, function(value,key){
                var routeName = key;
                var routeData = value;    

                if (typeof routeName === 'undefined' || typeof routeData === 'undefined') {
                    throw new Error('[NamedRouter] namedRoute::SpecifyTheGoddamnParams');
                }

                // Check via or use get by default
                routeData.via = typeof routeData.via !== 'undefined' ? routeData.via.toLowerCase() : 'get';
                
                // Replace delete with del (more user friendly to use)
                if (routeData.via == 'delete') {
                    routeData.via = 'del';
                }

                // Check verb consistency
                if (_.indexOf(_allowedVerbs, routeData.via) === -1) {
                    throw new Error('[NamedRouter] namedRoute::' + routeData.via + 'VerbNotAllowed');
                }

                routeData.middlewares = routeData.middlewares || [];
                
                routeData.handler = routeData.handler || function(req,res) {
                    res.send(404);
                };                

                // Call to expressjs router to add the route
                applicationInstance[routeData.via](routeData.path, routeData.middlewares, routeData.handler);

                _map[routeName + "Path"] = routeData.path;
                if (_options.registerAppHelpers === true) {
                    addNamedRouteToAppLocals(routeName, routeData.path);
                }
            }); // map
            
        }); // each
        
    };

    /**
     * [PRIVATE] this is called by every helper installed in app locals
     */
    var namedRouteResolver = function(path,routeOptions) {
        var p = path;
        var qs = {};
        var qsString = "";
        routeOptions = routeOptions || {};

        // Options parsing
        _.map(routeOptions, function(val, key) {                
            var _pCheck = new RegExp(":" + key + "+(\\?)?", "i");
            if (p.search(_pCheck) !== -1) {
                // Replace found parameter
                p = p.replace(_pCheck, val);    
            } else {
                // Parameter not found, will be added to querystring (see below)
                qs[key] = val;
            }
            
        });

        // Querystring parameters
         _.map(qs, function(v,k) {
            if (qsString === "") {
                qsString = "?"
            } else {
                qsString += "&"
            }
            qsString += k + "=" + v;
        });

        return p + qsString;
    };

    /**
     * [PRIVATE] Add route helper to app locals
     */
    var addNamedRouteToAppLocals = function(routeName, path) {
        var installPoint = appHelpersInstallPoint();

        installPoint[routeName + "Path"] = function(routeOptions) {
            return namedRouteResolver(path, routeOptions);
        };

        installPoint[routeName + "URL"] = function(routeOptions) {
            return _options.baseURL + namedRouteResolver(path, routeOptions);
        };
    };


    /**
     * [PRIVATE] Initializes and return the install point for helpers
     */
    var appHelpersInstallPoint = function() {
        if (typeof applicationInstance.locals.routes === 'undefined') {
            applicationInstance.locals.routes = {};
        }

        return applicationInstance.locals.routes;
    }


}

namedRouter.instance = null;

/**
 * Returns named router instance
 */
namedRouter.getInstance = function() {
    if (this.instance == null) {
        this.instance = new namedRouter();
    }

    return this.instance;
};

module.exports = exports = namedRouter.getInstance();