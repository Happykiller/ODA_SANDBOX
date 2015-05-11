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
        
        , _debug = true
        
        , _dependecies = null
        
        , _dependeciesFeedback = null
        
        , _i8n = []
        
        , _local = "fr"
        
        , _routes = {
            "contact" : {
                "name" : "API/partial/contact"
                , "title" : "Contact"
                , "urls" : ["contact"]
                , "middleWares" : ["auth", "support"]
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "404" : {
                "name" : "API/partial/404"
                , "title" : "Not found !"
                , "urls" : ["404"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "auth" : {
                "name" : "API/partial/auth"
                , "title" : "Login"
                , "urls" : ["auth"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "support" : {
                "name" : "API/partial/support"
                , "title" : "Support"
                , "urls" : ["support"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "home" : {
                "name" : "partial/home"
                , "title" : "Home"
                , "urls" : ["","home"]
                , "middleWares" : ["auth", "support"]
                , "dependencies" : []
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
                var session = $.Oda.Storage.get("ODA-SESSION");
                if(session != null){
                    
                }else{
                    _RouterExit = true;
                    _routes["auth"].go();
                }
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
                        _trace(this.name + " loaded.");
                        this.statut = _routeDependenciesStatus.loaded();
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        _trace(this.name +  " loading.");
                    }else{
                        _trace(this.name +  " already loaded.");
                    }
                }
            }
            , "hightcharts" : {
                "name" : "hightcharts"
                , "statut" : _routeDependenciesStatus.notLoaded()
                , "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        this.statut = _routeDependenciesStatus.loading();
                        $.getScript("API/lib/Highcharts/highcharts.js",function(){
                            $.Oda.Router.dependencieLoaded("hightcharts");
                        });
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        _trace(this.name +  " loading.");
                    }else{
                        _trace(this.name +  " already loaded.");
                    }
                }
            }
        }
        , _RouterExit = false
    ;


    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() { 
        try {
            //for testU
            if(typeof customWindowODA != 'undefined'){
                $.Oda.currentWindow = customWindowODA;
            }

            //depdends
            $.Oda.loadDepends([
                {"name" : "style" , ordered : false, "list" : [
                    , { "elt" : "API/css/css.css", "type" : "css" }
                    , { "elt" : "css/css.css", "type" : "css" }
                ]}
                , {"name" : "datas" , ordered : false, "list" : [
                    { "elt" : "API/i8n/i8n.json", "type" : "json", "target" : function(p_json){_i8n = _i8n.concat(p_json);}}
                    , { "elt" : "i8n/i8n.json", "type" : "json", "target" : function(p_json){_i8n = _i8n.concat(p_json);}}
                ]}
                , {"name" : "include" , ordered : true, "list" : [
                    { "elt" : "include/config.js", "type" : "script" }
                ]}
            ],_loaded);
        } catch (er) {
           $.Oda.log(0, "ERROR(_init):" + er.message);
        }
    };
    
    /**
     * @name _loaded
     */
    function _loaded() {
        try {
            //Pour localstorage
            $.Oda.Storage.storageKey = "ODA__"+g_urlHostServer+"__";
            
            $.Oda.loadDepends([
                {"name" : "app" , ordered : true, "list" : [
                    { "elt" : "OdaApp.js", "type" : "script" }
                ]}
            ],_appStarted);
        } catch (er) {
           $.Oda.log(0, "ERROR(_loaded):" + er.message);
        }  
    };
    
    /**
     * @name _appStarted
     */
    function _appStarted() {
        try {
            
        } catch (er) {
           $.Oda.log(0, "ERROR(_appStarted):" + er.message);
        }  
    };
    
    /**
     * 
     * @param {type} path
     * @returns {unresolved}
     */
    function _clearSlashes(path) {
        try {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        } catch (er) {
            $.Oda.log(0, "ERROR(_clearSlashes):" + er.message);
            return null;
        }
    };

    /**
     * 
     * @returns {Array}
     */
    function _getListParamsGet() {
        try {
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
        } catch (er) {
            $.Oda.log(0, "ERROR(_getListParamsGet):" + er.message);
            return null;
        }
    };
    
    /**
     * go
     * @param {object} p_params description
     * @returns {$.Oda.Router}
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

            if((_RouterExit)&&(!p_params.system)){
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
            $.Oda.log(0,"ERROR(_RouterGo):" + er.message);
            return null;
        }
    };
        
    /**
     * 
     * @param {type} p_params
     * @returns {Boolean}
     */
    function _loadPartial(p_params) {
        try {
            $.get(p_params.routeDef.name+".html", function(data) {
                $('#content').html(data);
                $.Oda.Scope.init();
            });
            return true;
        } catch (er) {
            $.Oda.log(0,"ERROR(_loadPartial):" + er.message);
            return null;
        }
    };
    
    /**
     * 
     * @param {type} p_msg
     * @returns {}
     */
    function _trace(p_msg) {
        try {
            if(_debug){
                console.log(p_msg);
            }
        } catch (er) {
            console.log("ERROR(_trace):" + er.message);
        }
    };
    
    /**
     * 
     * @param {type} p_elt
     * @param {type} p_mode
     * @returns {Boolean}
     */
    function _loadDepend(p_elt, p_mode) {
        try {
            var retour = true;

            _trace("Loading : "+p_elt.elt);
            
            switch(p_elt.type) {
                case "css":
                    $('<link/>', {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: p_elt.elt
                    }).appendTo('head');
                    p_elt.status = "done";
                    _trace( "Sucess for : "+p_elt.elt );
                    
                    if(p_mode == "serie"){
                        _loadListDependsOrdoned();
                    }
                    _allDependsLoaded();
                    break;
                case "script":
                    $.ajax({
                    url: p_elt.elt,
                    dataType: "script",
                    context : {"lib" : p_elt.elt},
                    success: function( script, textStatus, jqxhr) {
                        _trace( "Sucess for : "+$(this)[0].lib+" ("+textStatus+")" );
                        p_elt.status = "done";
                    
                        if(p_mode == "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    },
                    error : function( jqxhr, settings, exception ) {
                        _trace( "Triggered ajaxError handler for : "+$(this)[0].lib+"." );
                        p_elt.status = "fail";
                    
                        if(p_mode == "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    }
                });
                    break;
                case "json":
                    $.ajax({
                    dataType: "json",
                    url: p_elt.elt,
                    context : {"lib" : p_elt.elt},
                    success: function( json, textStatus, jqxhr) {
                        p_elt.target(json);
                        _trace( "Sucess for : "+$(this)[0].lib+" ("+textStatus+")" );
                        p_elt.status = "done";
                        
                        if(p_mode == "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    },
                    error : function( jqxhr, settings, exception ) {
                        _trace( "Triggered ajaxError handler for : "+$(this)[0].lib+"." );
                        p_elt.status = "fail";
                        
                        if(p_mode == "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    }
                    });
                    break;
                default:
                    _trace( "Type unknown for : "+p_elt.elt+"." );
            }

            return retour;
        } catch (er) {
            $.Oda.log(0, "ERROR(_loadDepend):" + er.message);
            return null;
        }
    };
    
    /**
     * 
     * @returns {Boolean}
     */
    function _loadListDependsOrdoned() {
        try {
            var retour = true;

            for (var indice in _dependecies) {
                if((!$.Oda.isUndefined(_dependecies[indice].status)) && (_dependecies[indice].status == "doing")){
                    var gardian = true;
                    for (var indiceList in _dependecies[indice].list) {
                        var elt = _dependecies[indice].list[indiceList];
                        if(($.Oda.isUndefined(elt.status)) || (elt.status == "doing")){
                            elt.status = "doing";
                            _loadDepend(elt,"serie");
                            gardian = false;
                            break;
                        }
                    }
                    if(gardian){
                        _dependecies[indice].status = "done";
                        $.Oda.loadDepends();
                    }
                }
            }

            return retour;
        } catch (er) {
            $.Oda.log(0, "ERROR(_loadListDependsOrdoned):" + er.message);
            return null;
        }
    };
    
    /**
     * 
     * @returns {Boolean}
     */
    function _allDependsLoaded() {
        try {
            var retour = true;
            
            if(_dependecies != null){
                for (var indice in _dependecies) {
                    if(($.Oda.isUndefined(_dependecies[indice].status)) || (_dependecies[indice].status == "doing")){
                        retour = false;
                        break;
                    }else{
                        for (var indiceList in _dependecies[indice].list) {
                            var elt = _dependecies[indice].list[indiceList];
                            if(($.Oda.isUndefined(elt.status)) || (elt.status == "doing")){
                                retour = false;
                                break;
                            }
                        }
                    }
                }
            }

            if((retour)&&(_dependecies!=null)){
                _dependecies = null;
                var methode = _dependeciesFeedback;
                _dependeciesFeedback = null;
                methode();
            }

            return retour;
        } catch (er) {
            $.Oda.log(0, "ERROR(_allDependsLoaded):" + er.message);
            return null;
        }
    };

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda = {
        /* Version number */
        version: VERSION
        
        //for the application project
        , App : {}
        
        , Scope : {
            /**
             * 
             * @returns {undefined}
             */
            init : function(){
                try {
                    $('[oda-id]').each(function(index, value){
                        $(value).attr("id",$(value).attr("oda-id"));
                        $(value).change(function(elt){
                           $.Oda.Scope.refresh();
                        });
                        $(value).keyup(function(elt){
                           $.Oda.Scope.refresh();
                        });
                    });
                } catch (er) {
                    console.log("ERROR($.Oda.Scope.init):" + er.message);
                }
            }
            /**
             * 
             * @returns {undefined}
             */
            , refresh : function(){
                try {
                    
                } catch (er) {
                    console.log("ERROR($.Oda.Scope.refresh):" + er.message);
                }
            }
            
        }
        
        , Storage : {
            /* Version number */
            version : VERSION,
            ttl_default : 86400, //24H
            storageKey : "",

            /**
             * 
             * @returns {Boolean}
             */
            isStorageAvaible: function(){
                try {
                    var boolRetour = false;

                    if (localStorage) {
                        boolRetour = true;
                    } 

                    return boolRetour;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.isStorageAvaible):" + er.message);
                    return null;
                }
            },

            /**
             * 
             * @param {string} p_key
             * @param {json} p_value
             * @param {integer} p_ttl in seconde
             * @returns {Boolean}
             */
            set: function(p_key, p_value, p_ttl) {
                try {
                    var boolRetour = true;

                    var d = new Date();
                    var date = d.getTime();

                    var ttl = 0;
                    if(typeof(p_ttl) != 'undefined'){
                        ttl = p_ttl;
                    }

                    var storage = {
                        "value" : p_value
                        , "recordDate" : date
                        , "ttl" : ttl
                    };

                    if(boolRetour){
                        var json_text = JSON.stringify(storage);

                        localStorage.setItem(this.storageKey+p_key, json_text);
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.log(0, "ERROR($.Oda.Storage.set):" + er.message);
                    return null;
                }
            },

            get: function(p_key, p_default) {
                try {
                    var myStorage = JSON.parse(localStorage.getItem(this.storageKey+p_key));
                    var myValue = null;
                    if(myStorage != null){
                        myValue = myStorage.value;

                        if((myStorage.value != null)&&(myStorage.ttl != 0)){
                            var d = new Date();
                            var date = d.getTime();

                            var dateTimeOut = myStorage.recordDate + (myStorage.ttl*1000);

                            if(date > dateTimeOut){
                                this.remove(p_key);
                                myValue = null;
                            }
                        }

                        if((myValue == null)&&(typeof(p_default) != 'undefined')){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }else{
                        if(typeof(p_default) != 'undefined'){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }

                    return myValue;
                } catch (er) {
                    $.Oda.log(0, "ERROR($.Oda.Storage.get):" + er.message);
                    return null;
                }
            },

            setTtl: function(p_key, p_ttl) {
                try {
                    var myValue = this.get(p_key);

                    var d = new Date();
                    var date = d.getTime();

                    var storage = {
                        "value" : myValue
                        , recordDate : date
                        , ttl : p_ttl
                    };

                    var myReturn = this.set(this.storageKey+p_key, storage);

                    return myReturn;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.setTtl):" + er.message);
                    return null;
                }
            },

            getTtl: function(p_key) {
                try {
                    var myReturn = 0;

                    var myStorage = this.get(this.storageKey+p_key);

                    if(myStorage != null){

                        var d = new Date();
                        var date = d.getTime();

                        var dateTimeOut = myValue.recordDate + (myValue.ttl*1000);

                        myReturn = dateTimeOut - date;

                        if(myReturn < 0){
                            myReturn = 0;
                        }
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.getTtl):" + er.message);
                    return null;
                }
            },

            remove: function(p_key) {
                try {
                    var myReturn = true;

                    localStorage.removeItem(this.storageKey+p_key);

                    return myReturn;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.setTtl):" + er.message);
                    return null;
                }
            },

            reset: function() {
                try {
                    var myReturn = true;

                    for (var indice in localStorage) {
                        localStorage.removeItem(indice);
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.reset):" + er.message);
                    return null;
                }
            },

            getIndex: function(p_filtre) {
                try {
                    var myReturn = [];

                    var patt = new RegExp("ODA_"+p_filtre);

                    for (var indice in localStorage) {
                        var res = patt.test(indice);
                        if(res){
                            myReturn.push(indice);
                        }
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.log(0, "ERROR(Oda.Storage.getIndex):" + er.message);
                    return null;
                }
            }
        }
        
        , Router : {
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
             * @returns {$.Oda.Router}
             */
            , navigateTo : function(p_request) {
                try {
                    if($.Oda.isUndefined(p_request)){
                        p_request = _routeCurrent;
                    }
                    
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
                    $.Oda.log(0,"ERROR($.ODa.Router.navigateTo):" + er.message);
                    return null;
                }
            }
            /**
             * addRoute
             * @param {String} name description
             * @param {object} p_routeDef
             * @returns {$.Oda.Router}
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
                    $.Oda.log(0,"ERROR($.ODa.Router.addRoute):" + er.message);
                    return null;
                }
            }
            /**
             * addMiddleWare
             * @param {string} p_name
             * @param {object} p_midlleWareDef
             * @returns {$.Oda.Router}
             */
            , addMiddleWare : function(p_name, p_midlleWareDef) {
                try {
                    _routeMiddleWares[p_name] = p_midlleWareDef;
                    _routeMiddleWares[p_name].name = p_name;
                    return this;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.addMiddleWare):" + er.message);
                    return null;
                }
            }
            /**
             * addDependencies
             * @param {string} p_name
             * @param {object} p_dependenciesLoad
             * @returns {$.Oda.Router}
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
                                _trace(this.name +  " loading.");
                            }else{
                                _trace(this.name +  " already loaded.");
                            }
                        }
                    } 
                    return this;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.addDependencies):" + er.message);
                    return null;
                }
            }
            /**
             * 
             * @param {type} p_name
             * @returns {$.Oda.Router}
             */
            , dependencieLoaded : function(p_name) {
                try {
                    _routeDependencies[p_name].statut = _routeDependenciesStatus.loaded();
                    _trace(p_name+" loaded");
                    return this;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.dependencieLoaded):" + er.message);
                    return null;
                }
            }
            /**
             * 
             * @returns {$.Oda.Router}
             */
            , startRooter : function() {
                try {
                    _routeCurrent = {
                        route : _clearSlashes(decodeURI(window.location.hash)).substring(1).replace(/\?(.*)$/, '')
                        , args : _getListParamsGet()
                    };

                    this.navigateTo(_routeCurrent);
                    return this;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.dependencieLoaded):" + er.message);
                    return null;
                }
            }
        }
        
        /**
        * log
        * @param {int} p_type
        * @param {string} p_msg
        * @returns {boolean}
        */
        , log : function(p_type, p_msg) {
           try {
                _trace(p_msg);
               
                return this;
           } catch (er) {
                throw new Error("ERROR($.Oda.log):" + er.message);
                return null;
           }
        }
        
        /**
        * @name : loadDepends
        */
        , loadDepends : function(p_depends, p_functionFeedback){
            try {
                if(_dependecies == null){
                    _dependecies = p_depends;
                }
                
                if(_dependeciesFeedback == null){
                    _dependeciesFeedback = p_functionFeedback;
                }
                
                var retour = true;

                for (var indice in _dependecies) {
                    if((this.isUndefined(_dependecies[indice].status)) || (_dependecies[indice].status != "done")){
                        _trace("Loading list of dependecies : "+_dependecies[indice].name+".");
                        _dependecies[indice].status = "doing";
                        if(_dependecies[indice].ordered){
                            _loadListDependsOrdoned();
                            retour = false;
                            break;
                        }else{
                            for (var indiceList in _dependecies[indice].list) {
                                var elt = _dependecies[indice].list[indiceList];
                                _loadDepend(elt,"paral");
                            }
                            _dependecies[indice].status = "done";
                        }
                    }
                }

                return retour;
            } catch (er) {
               this.log(0, "ERROR($.Oda.loadDepends):" + er.message);
            }
        }
        
        /**
        * @name isUndefined
        * @desc is ndefined N
        * @param {object} p_object
        * @returns {Worker}
        */
        , isUndefined : function(p_object) {
            try {
                var boolReturn = true;
                
                if(typeof p_object != "undefined"){
                    boolReturn = false;
                }

                return boolReturn;
            } catch (er) {
                this.log(0, "ERROR($.Oda.isUndefined):" + er.message);
                return null;
            }
        }
        
        /**
         * @name getI8n
         * @param {string} p_group
         * @param {string} p_tag
         * @returns {String}
        */
        , getI8n: function(p_group, p_tag) {
            try {
                var returnvalue = "Not define";
                
                for (var grpId in _i8n) {
                    var grp = _i8n[grpId];
                    if(grp.groupName == p_group){
                        var trad = grp[_local][p_tag];
                        if(!$.Oda.isUndefined(trad)){
                            returnvalue = trad;
                        }
                        break;
                    }
                }

                return returnvalue;
            } catch (er) {
                this.log(0, "ERROR($.Oda.getI8n):" + er.message);
                return null;
            }
        }

        /**
         * auth
         * @param {object} p_params
         * @returns {$.Oda}
         */
        , auth : function(p_params) {
            try {
                $.Oda.Storage.set("ODA-SESSION",{"hello":"moi"});
                _RouterExit = false;
                $.Oda.Router.navigateTo();
                return this;
            } catch (er) {
                this.log(0, "ERROR($.Oda.auth):" + er.message);
                return null;
            }
        }
        
        , Notification : {
            success : function(){
                return "success";
            }
            ,
            info : function(){
                return "info";
            }
            ,
            warning : function(){
                return "warning";
            }
            ,
            danger : function(){
                return "danger";
            }
            /**
            * notification
            * @Desc Show notification
            * @param {string} p_message
            * @param {string} p_color
            * @returns {boolean}
            */
            ,create : function(p_message, p_type) {
                try {
                    var strHtml = "";
                    strHtml += '';
                    strHtml += '<div class="alert alert-'+p_type+' alert-dismissible" style="width:95%;margin-left: auto;margin-right: auto;" role="alert">';
                    strHtml += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
                    strHtml += p_message;
                    strHtml += '</div>';
                    $("#content").before(strHtml);
                    return this;
                } catch (er) {
                    this.log(0, "ERROR($.Oda.Notification.notification) :" + er.message);
                    return null;
                }
            }
        }
    };

    // Initialize
    _init();

})();
