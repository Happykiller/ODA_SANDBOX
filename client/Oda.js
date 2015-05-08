// Library of tools for the exemple

/**
 * @author FRO
 * @date 15/05/08
 */
(function() {
    'use strict';

    var
        /* version */
        VERSION = '0.1'
        , _routes = {
            "404" : {
                "name" : "404"
                , "title" : "Not found !"
                , "urls" : ["404"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "auth" : {
                "name" : "auth"
                , "title" : "Login"
                , "urls" : ["auth"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "support" : {
                "name" : "support"
                , "title" : "Support"
                , "urls" : ["support"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "home" : {
                "name" : "home"
                , "title" : "Home"
                , "urls" : ["","home"]
                , "middleWares" : ["auth", "support"]
                , "dependencies" : ["angular"]
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "chart" : {
                "name" : "chart"
                , "title" : "Chart"
                , "urls" : ["chart"]
                , "middleWares" : ["support", "auth"]
                , "dependencies" : ["dataTables", "hightcharts"]
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            }
        }
        , _routeCurrent = {
            route : "home"
            , args : []
        }
        , _routeMiddleWares = {
            "auth" : function(args){
                //if not log
                //_routes["auth"].go({});
            }
            , "support" : function(args){
                //if in support
                //_routes["support"].go({});
            }
        }
        , _routeDependenciesStatus = {
            "notLoaded" : function(){
                return "notLoaded";
            }
            , "loading" : function(){
                return "loading";
            }
            , "loaded" : function(){
                return "loaded";
            }
        }
        , _routeDependencies = {
            "dataTables" : {
                "name" : "dataTables"
                , "statut" : _routeDependenciesStatus.notLoaded()
                , "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        console.log(this.name + " loaded.");
                        this.statut = _routeDependenciesStatus.loaded();
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        console.log(this.name +  " loading.");
                    }else{
                        console.log(this.name +  " already loaded.");
                    }
                }
            }
            , "hightcharts" : {
                "name" : "hightcharts"
                , "statut" : _routeDependenciesStatus.notLoaded()
                , "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        this.statut = _routeDependenciesStatus.loading();
                        $.getScript("lib/Highcharts/highcharts.js",function(){
                            $.Oda.router.dependencieLoaded("hightcharts");
                        });
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        console.log(this.name +  " loading.");
                    }else{
                        console.log(this.name +  " already loaded.");
                    }
                }
            }
        }
        , _routerExit = false
    ;


    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() {
        
        _routeCurrent = {
            route : _clearSlashes(decodeURI(window.location.hash)).substring(1).replace(/\?(.*)$/, '')
            , args : _getListParamsGet()
        };
        
        $.Oda.router.addRoute("partials/hello", {
            "title" : "Hello"
            , "urls" : ["hello", "truc/hello"]
            , "dependencies" : ["angular"]
            , "middleWares":[$.Oda.router.routeMiddleWares.support(),$.Oda.router.routeMiddleWares.auth()]
        });
        
        $.Oda.router.addDependencies("angular", function(){
            console.log("Angular loading !"); 
            $.Oda.router.dependencieLoaded("angular");
        });
        
        $.Oda.router.navigateTo(_routeCurrent);
    }
    
    function _clearSlashes(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    function _getListParamsGet() {
        var result = [];
        var tableau = decodeURI(window.location.hash).split("?");
        if(tableau.length > 1){
            tableau = tableau[1];
            tableau = tableau.split("&");
            for (var indice in tableau){
                var tmp = tableau[indice].split("=");
                var elt = {
                    "name" : tmp[0]
                    , "value" : tmp[1]
                };
                result.push(elt);
            } 
        }
        return result;
    }
    
    /**
     * go
     * @param {object} p_params description
     * @returns {$.Oda.router}
     */
    function _routerGo(p_params) {
        try {
            //load dependencies
            if(p_params.routeDef.dependencies.length > 0){
                for(var indice in p_params.routeDef.dependencies){
                    _routeDependencies[p_params.routeDef.dependencies[indice]].load();
                }
            }
            
            if(p_params.routeDef.dependencies.length > 0){
                for(var indice in p_params.routeDef.dependencies){
                    if(_routeDependencies[p_params.routeDef.dependencies[indice]].statut !== _routeDependenciesStatus.loaded()){
                        setTimeout(function(){_routerGo(p_params);}, 100);
                        return true;
                    }
                }
            }
            
            //exec middleware
            if(p_params.routeDef.middleWares.length > 0){
                for(var indice in p_params.routeDef.middleWares){
                    _routeMiddleWares[p_params.routeDef.middleWares[indice]]();
                }
            }

            if((_routerExit)&&(!p_params.system)){
                return this;
            }

            //call content
             _loadPartial({"routeDef" : p_params.routeDef});

            //rewrite hash
            if(!p_params.system){
                var urlRoute = _routeCurrent.route;
                var urlArg = "";
                if(_routeCurrent.args.length > 0){
                    if(urlArg === ""){
                        urlArg += "?";
                    }else{
                        urlArg += "&";
                    }
                    for(var indice in _routeCurrent.args){
                        urlArg += _routeCurrent.args[indice].name + "=" + _routeCurrent.args[indice].value;
                    }
                }
                window.location.hash = urlRoute + urlArg;
            }
            return true;
        } catch (er) {
            console.log("ERROR(_routerGo):" + er.message);
            return null;
        }
    }
        
    function _loadPartial(p_params) {
        try {
            $.get(p_params.routeDef.name+".html", function(data) {
                $('#content').html(data);
            });
            return true;
        } catch (er) {
            console.log("ERROR(_loadPartial):" + er.message);
            return null;
        }
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda = {
        /* Version number */
        version: VERSION
        
        ,router : {
            routeMiddleWares : {
                "auth" : function(){
                   return "auth";
                }
                , "support" : function(){
                   return "support";
                }
            }
            /**
             * navigateTo
             * @param {object} p_request
             * @returns {$.Oda.router}
             */
            , navigateTo : function(p_request) {
                try {
                    var founded = false;
                    for(var name in _routes){
                        for(var indice in _routes[name].urls){
                            var url = _routes[name].urls[indice];
                            if(url === p_request.route){
                                _routeCurrent = p_request;
                                _routes[name].go(p_request);
                                founded = true;
                                break;
                            }
                        }
                        if(founded){
                            break;
                        }
                    }

                    if(founded === false){
                        _routes["404"].go(p_request);
                    }
                    return this;
                } catch (er) {
                    console.log("ERROR($.ODa.router.navigateTo):" + er.message);
                    return null;
                }
            }
            /**
             * addRoute
             * @param {String} name description
             * @param {object} p_routeDef
             * @returns {$.Oda.router}
             */
            , addRoute : function(p_name, p_routeDef) {
                try {
                    p_routeDef.name = p_name;
                    p_routeDef.go = function(p_request){
                        _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                    };
                    if(!p_routeDef.hasOwnProperty("middleWares")){
                        p_routeDef.middleWares = [];
                    }
                    if(!p_routeDef.hasOwnProperty("dependencies")){
                        p_routeDef.dependencies = [];
                    }
                    _routes[p_name] = p_routeDef;
                    return this;
                } catch (er) {
                    console.log("ERROR($.ODa.router.addRoute):" + er.message);
                    return null;
                }
            }
            /**
             * addMiddleWare
             * @param {string} p_name
             * @param {object} p_midlleWareDef
             * @returns {$.Oda.router}
             */
            , addMiddleWare : function(p_name, p_midlleWareDef) {
                try {
                    _routeMiddleWares[p_name] = p_midlleWareDef;
                    _routeMiddleWares[p_name].name = p_name;
                    return this;
                } catch (er) {
                    console.log("ERROR($.ODa.router.addMiddleWare):" + er.message);
                    return null;
                }
            }
            /**
             * addDependencies
             * @param {string} p_name
             * @param {object} p_dependenciesLoad
             * @returns {$.Oda.router}
             */
            , addDependencies : function(p_name, p_dependenciesLoad) {
                try {
                    _routeDependencies[p_name] = {
                        "name" : p_name
                        , "statut" : _routeDependenciesStatus.notLoaded()
                        , "load" : function(){
                            if(this.statut === _routeDependenciesStatus.notLoaded()){
                                this.statut = _routeDependenciesStatus.loading();
                                p_dependenciesLoad();
                            }else if(this.statut === _routeDependenciesStatus.loading()){
                                console.log(this.name +  " loading.");
                            }else{
                                console.log(this.name +  " already loaded.");
                            }
                        }
                    } 
                    return this;
                } catch (er) {
                    console.log("ERROR($.ODa.router.addDependencies):" + er.message);
                    return null;
                }
            }
            , dependencieLoaded : function(p_name) {
                try {
                    _routeDependencies[p_name].statut = _routeDependenciesStatus.loaded();
                    console.log(p_name+" loaded");
                    return this;
                } catch (er) {
                    console.log("ERROR($.ODa.router.dependencieLoaded):" + er.message);
                    return null;
                }
            }
        }
    };

    // Initialize
    _init();

})();
