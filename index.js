var _ = require('underscore');

//    app.namedRoute('rootPath', {
//        via: 'get',
//        path: '/',
//        middlewares: [...],
//        handler: function(req,res){...}
//    });

var namedRouter = function namedRouter() {
    var _map = {};
    var applicationInstance = undefined;
    var _allowedVerbs = ['all', 'get', 'post', 'put', 'del'];
    var _options = {};
    var _pCheck = /:[a-zA-Z0-9_]+(\?)?(\/)?/

    this.initForApplication = function(appInstance, options) {
        options = options || {};
        options.registerAppHelpers = options.registerAppHelpers || true;
        _options = options;
        if (typeof appInstance === 'undefined' || !appInstance) {
            throw new Error('[NamedRouter] applicationInstance option not specified');
        } else {            
            applicationInstance = appInstance;
            appInstance.namedRoute = this.namedRoute;
        }        
    };

    this.get = function(name) {
        return _map[name];
    };

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

                routeData.via = typeof routeData.via !== 'undefined' ? routeData.via.toLowerCase() : 'get';
                
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

    var addNamedRouteToAppLocals = function(routeName, path) {
        var installPoint = appHelpersInstallPoint();
        installPoint[routeName + "Path"] = function(routeOptions) {
            var p = path;
            var qs = {};
            var qsString = "";
            routeOptions = routeOptions || {};

            _.map(routeOptions, function(val, key) {                
                var _pCheck = new RegExp(":" + key + "+(\\?)?", "i");
                if (p.search(_pCheck) !== -1) {
                    // Replace parameter
                    p = p.replace(_pCheck, val);    
                } else {
                    // Add to querystring
                    qs[key] = val;
                }
                
            });

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
    };

    var appHelpersInstallPoint = function() {
        if (typeof applicationInstance.locals.routes === 'undefined') {
            applicationInstance.locals.routes = {};
        }

        return applicationInstance.locals.routes;
    }


}

namedRouter.instance = null;
namedRouter.getInstance = function() {
    if (this.instance == null) {
        this.instance = new namedRouter();
    }

    return this.instance;
};

module.exports = exports = namedRouter.getInstance();