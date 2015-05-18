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
        
        , _projectLabel = "Project"
        
        , _debug = true
        
        , _dependecies = null
        
        , _dependeciesFeedback = null
        
        , _connectionRest = false
        
        , _i8n = []
        
        , _session = {
            "code_user" : ""
            , "key" : ""
            , "userInfo" : {
                "locale" : "fr"
                , "firstName" : ""
                , "lastName" : ""
                , "mail" : ""
                , "profile" : 0
                , "profileLabel" : ""
                , "showTooltip" : 0
            }
        }
        
        , _routes = {
            "contact" : {
                "name" : "API/partial/contact"
                , "title" : "Contact"
                , "urls" : ["contact"]
                , "middleWares" : ["support", "auth"]
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
                , "middleWares" : ["support"]
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
                , "middleWares" : ["support", "auth"]
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
                _trace("MiddleWares : auth");
                var checkLogGet = false;
                var session = $.Oda.Storage.get("ODA-SESSION");
                if(session != null){
                    //session exist
                    var tabSetting = { };
                    var tabInput = { 
                        "code_user" : session.code_user
                        , "key" : session.key
                    };
                    var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/checkSession.php", tabSetting, tabInput); 
                    if(retour.data){
                        return true;
                    }
                }
                //check if log by url
                var params = $.Oda.Router.getParams();
                if((params.hasOwnProperty("getUser"))&&(params.hasOwnProperty("getPass"))){
                    var auth = $.Oda.auth({"login" : params.getUser, "mdp" : params.getPass});
                    if(auth){
                        return true;
                    }
                }
                        
                //session ko
                _RouterExit = true;
                $.Oda.logout();
            }
            , "support" : function(args){
                _trace("MiddleWares : support");
                var maintenance = $.Oda.getParameter("maintenance");
                if(typeof maintenance === "undefined"){
                    _connectionRest = false;
                    _RouterExit = true;
                    _routes["support"].go();
                }else{
                    _connectionRest = true;
                    if(maintenance){
                        _RouterExit = true;
                        _routes["support"].go();
                    }
                }
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
            // init from config
            if (typeof g_urlHostClient !== "undefined"){
                $.Oda.Context.host = g_urlHostClient;
                $.Oda.Storage.storageKey = "ODA__"+g_urlHostClient+"__";
            }
            
            if (typeof g_urlHostServer !== "undefined"){
                $.Oda.Context.rest = g_urlHostServer;
            }
            
            if (typeof g_resources !== "undefined"){
                $.Oda.Context.resources = g_resources;
            }
            
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
            var tableau = decodeURI($.Oda.Context.window.location.hash).split("?");
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
            _trace("RouterGo : ");
            _trace(p_params);
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
                $.Oda.Context.window.location.hash = urlRoute + urlArg;
                $.Oda.Context.window.document.title = _projectLabel + " " + p_params.routeDef.title;
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
        , Context : {
            host : ""
            , rest : ""
            , resources : ""
            , window : window
        }
        
        //for the application project
        , App : {}
        
        , Scope : {
            /**
             * 
             * @returns {undefined}
             */
            init : function(){
                try {
                    $('[oda-io-text]').each(function(index, value){
                        $(value).attr("id",$(value).attr("oda-io-text"));
                        $(value).change(function(elt){
                           $.Oda.Scope.refresh();
                        });
                        $(value).keyup(function(elt){
                           $.Oda.Scope.refresh();
                        });
                        var placeHolder = $(value).attr("placeholder");
                        if(placeHolder !== undefined){
                            var tab = placeHolder.split(".");
                            if((tab.length > 1) && ($.Oda.getI8n(tab[0], tab[1]) !== "Not define")){
                                $(value).attr("placeholder", $.Oda.getI8n(tab[0], tab[1]));
                            }
                        }
                    });
                    
                    $('[oda-label]').each(function(index, value){
                        var labelName = $(value).attr("oda-label");
                        var tab = labelName.split(".");
                        $(value).html($.Oda.getI8n(tab[0], tab[1]));
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
            storageKey : "ODA__default__",

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
                        $.Oda.log(0, p_request.route + " not found.");
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
                    var hash = $.Oda.Context.window.location.hash;
                    
                    _routeCurrent = {
                        route : _clearSlashes(decodeURI(hash)).substring(1).replace(/\?(.*)$/, '')
                        , args : _getListParamsGet()
                    };

                    this.navigateTo(_routeCurrent);
                    return this;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.startRooter):" + er.message);
                    return null;
                }
            }
            /**
             * 
             * @returns {object}
             */
            , getParams : function() {
                try {
                    var params = {};
                    
                    for(var indice in _routeCurrent.args){
                        params[_routeCurrent.args[indice].name] = _routeCurrent.args[indice].value;
                    }
                    
                    return params;
                } catch (er) {
                    $.Oda.log(0,"ERROR($.ODa.Router.getParams):" + er.message);
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
                        var trad = grp[_session.userInfo.locale][p_tag];
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
                var tabInput = { "login" : p_params.login, "mdp" : p_params.mdp };
                var returns = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getAuth.php", {}, tabInput); 
                if(returns["strErreur"] == ""){
                    var code_user = returns["data"]["resultat"]["code_user"].toUpperCase();
                    var key = returns["data"]["resultat"]["keyAuthODA"];

                    var session = {
                        "code_user" : code_user
                        , "key" : key
                    };

                    $.Oda.Storage.set("ODA-SESSION",session,43200);
                    
                    var tabSetting = { };
                    var tabInput = { 
                        code_user : code_user
                    };
                    var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getAuthInfo.php", tabSetting, tabInput);
                    if(retour.strErreur == ""){
                        var userInfo = {
                            "locale" : "fr"
                            , "firstName" : retour.data.resultat.nom
                            , "lastName" : retour.data.resultat.prenom
                            , "mail" : retour.data.resultat.mail
                            , "profile" : retour.data.resultat.profile
                            , "profileLabel" : retour.data.resultat.labelle
                            , "showTooltip" : retour.data.resultat.montrer_aide_ihm
                        };
                        session.userInfo = userInfo;
                        _session = session;
                    }else{
                        $.Oda.Storage.remove("ODA-SESSION");
                        $.Oda.Notification.create(returns["strErreur"],$.Oda.Notification.danger());
                        return this;
                    }
                    _RouterExit = false;
                    $.Oda.Router.navigateTo();
                }else {
                   $.Oda.Notification.create(returns["strErreur"],$.Oda.Notification.danger());
                }
                return this;
            } catch (er) {
                this.log(0, "ERROR($.Oda.auth):" + er.message);
                return null;
            }
        }
        
        /**
         * login
         * @param {object} p_params
         * @returns {$.Oda}
         */
        , login : function(p_params) {
            try {
                var auth = $.Oda.auth({ "login" : p_params.login, "mdp" : p_params.mdp });
                if(auth){
                    $.Oda.Router.navigateTo();
                }
                return true;
            } catch (er) {
                this.log(0, "ERROR($.Oda.login):" + er.message);
                return null;
            }
        }
        
        /**
        * @name : logout
        */
        , logout : function(){
           try {
                var session = $.Oda.Storage.get("ODA-SESSION");
                if(session !== null){
                    var tabInput = { 
                        "key" : session.key
                    };
                    var retour = this.callRest(this.Context.rest+"API/phpsql/deleteSession.php", {}, tabInput); 
                    $.Oda.Storage.remove("ODA-SESSION");
                }
                _routes.auth.go();
           } catch (er) {
               this.log(0, "ERROR($.Oda.logout):" + er.message);
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
        
        /**
         * @name callRest
         * @desc Hello
         * @param{string} p_url
         * @param{json} p_tabSetting
         * @param{json} p_tabInput
         * @returns {json}
         */
        , callRest: function(p_url, p_tabSetting, p_tabInput) {
            try {
                var jsonAjaxParam = {
                    url : p_url
                    , contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
                    , dataType : 'json'
                    , type : 'GET'
                };
                
                //cr�ation du jeton pour la secu
                var session = $.Oda.Storage.get("ODA-SESSION");
                var key = null;
                if(session != null){
                    key = session.key;
                } else{
                    key = p_tabInput["keyAuthODA"];
                    delete p_tabInput["keyAuthODA"];
                }

                p_tabInput.milis = $.Oda.getMilise();
                p_tabInput.ctrl = "OK";
                p_tabInput.keyAuthODA = key;

                jsonAjaxParam.data = p_tabInput;

                //traitement determinant async ou pas
                var async = true;
                if(p_tabSetting.functionRetour == null){
                    async = false;
                    jsonAjaxParam.async = false;        
                }

                for(var indice in p_tabSetting){
                    jsonAjaxParam[indice] = p_tabSetting[indice];
                }

                //si retour synchron init retour
                var v_retourSync = null;

                jsonAjaxParam.success = function(p_retour, p_statut){
                    try {
                        if(typeof p_retour == 'object'){
                            //object
                            var returns = p_retour;
                            
                            if((returns.strErreur == "key auth expiree.")||(returns.strErreur == "key auth invalid.")){
                                $.Oda.Notification.create("Session invalid.", $.Oda.Notification.warning());
                                $.Oda.logout();
                            }
                        }else{
                            var returns = p_retour;
                        }

                        if(async){
                            p_tabSetting.functionRetour(p_retour);
                        }else{
                            v_retourSync = p_retour;
                        }
                    } catch (er) {
                        var msg = "ERROR($.Oda.callRest.success):" + er.message;
                        this.log(0, msg);
                    }
                };

                jsonAjaxParam.error = function(p_resultat, p_statut, p_erreur){
                    var msg = p_resultat.responseText + " - " + p_statut + " - " + p_erreur.message;
                    if(async){
                        p_tabSetting.functionRetour(msg);
                    }else{
                        v_retourSync = msg;
                    }
                };

                var ajax = $.ajax(jsonAjaxParam);

                return v_retourSync;
            } catch (er) {
                var msg = "ERROR($.Oda.callRest):" + er.message;
                $.Oda.log(0, msg);
                return null;
            } 
        }
        
        /**
         * @name clone
         * @desc Clone an object JS
         * @param{object} p_params
         * @returns {object}
         */
        , clone : function(p_params) {
            if (null == p_params || "object" != typeof p_params) return p_params;
            var copy = p_params.constructor();
            for (var attr in p_params) {
                if (p_params.hasOwnProperty(attr)) copy[attr] = p_params[attr];
            }
            return copy;
        }
        
        /**
        * isInArray
        * @param {string} p_value
        * @param {array} p_array
        * @returns {Boolean}
        */
        , isInArray :  function(p_value, p_array) {
            try {
                var boolRetour = false;

                for(var indice in p_array){
                    if(p_value == p_array[indice]){
                        boolRetour = true;
                        break;
                    }
                }

                return boolRetour;
            } catch (er) {
                this.log(0, "ERROR($.Oda.isInArray):" + er.message);
                return null;
            }
        }
        
        /**
        * @name getMilise
        * @returns {string}
        */
        , getMilise : function() {
            try {
                var d = new Date();
                return d.getTime();
            } catch (er) {
                this.log(0, "ERROR($.Oda.getMilise):" + er.message);
                return null;
            }
        }
        
        /**
        * getParameter
        * #ex $.Oda.getParameter("contact_mail_administrateur");
        * @param {string} p_param_name
        * @returns { int|varchar }
        */
        , getParameter : function(p_param_name) {
           try {
                var strResponse;

                var tabInput = { param_name : p_param_name };
                var json_retour = this.callRest(this.Context.rest+"API/phpsql/getParam.php", {}, tabInput);   
                if(json_retour["strErreur"] == ""){
                    var type = json_retour["data"]["leParametre"]["param_type"];
                    var value = json_retour["data"]["leParametre"]["param_value"];
                    switch (type) {
                        case "int":
                            strResponse = parseInt(value);
                            break;
                        case "float":
                            strResponse = this.arrondir(parseFloat(value),2);
                            break;
                        case "varchar":
                            strResponse =  value;
                            break;
                        default:
                            strResponse =  value;
                            break;
                    }
                } 

               return strResponse;
           } catch (er) {
               this.log(0, "ERROR($.Oda.getParameter):" + er.message);
               return null;
           }
        }
    };

    // Initialize
    _init();

})();
