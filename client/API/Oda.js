/* global er */
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
        
        , _connectionRest = false
        
        , _dependeciesFeedback = null
        
        , _menuSlide = false
        
        , _menu = false
        
        , _i8n = []
        
        , _routesAllowed = ["contact","404","auth","support","home","forgot","subscrib"]
        
        , _routes = {
            "contact" : {
                "path" : "API/partial/contact.html"
                , "title" : "oda-main.contact"
                , "urls" : ["contact"]
                , "middleWares" : ["support"]
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "404" : {
                "path" : "API/partial/404.html"
                , "title" : "oda-main.404-title"
                , "urls" : ["404"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "auth" : {
                "path" : "API/partial/auth.html"
                , "title" : "oda-main.authentification"
                , "urls" : ["auth"]
                , "middleWares" : ["support"]
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "forgot" : {
                "path" : "API/partial/forgot.html"
                , "title" : "oda-main.forgot-title"
                , "urls" : ["forgot"]
                , "middleWares" : ["support"]
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "subscrib" : {
                "path" : "API/partial/forgot.html"
                , "title" : "oda-main.subscrib-title"
                , "urls" : ["subscrib"]
                , "middleWares" : ["subscrib"]
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "support" : {
                "path" : "API/partial/support.html"
                , "title" : "oda-main.support-title"
                , "urls" : ["support"]
                , "middleWares" : []
                , "dependencies" : []
                , "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "home" : {
                "path" : "API/partial/home.html"
                , "title" : "oda-main.home-title"
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
                        $.Oda.Session = session;
                        return true;
                    }
                }
                //check if log by url
                var params = $.Oda.Router.getParams();
                if((params.hasOwnProperty("getUser"))&&(params.hasOwnProperty("getPass"))){
                    var auth = $.Oda.auth({"login" : params.getUser, "mdp" : params.getPass, "reload" : false});
                    if(auth){
                        return true;
                    }
                }
                        
                //session ko
                _RouterExit = true;
                $.Oda.logout();
                return false;
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
                        this.statut = _routeDependenciesStatus.loading();
                        $('<link/>', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: "API/lib/DataTables/css/dataTables.bootstrap.css"
                        }).appendTo('head');
                        $.getScript("API/lib/DataTables/js/jquery.dataTables.min.js",function(){
                            $.getScript("API/lib/DataTables/js/dataTables.bootstrap.js",function(){
                                $.Oda.Router.dependencieLoaded("dataTables");
                            });
                        });
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
            
            //rewrite hash
            if(!p_params.system){
                var urlRoute = _routeCurrent.route;
                var urlArg = "";
                if(_routeCurrent.args.length > 0){
                    for(var indice in _routeCurrent.args){
                        if((_routeCurrent.args[indice].name !== "getUser")&&(_routeCurrent.args[indice].name !== "getPass")){
                            if(urlArg === ""){
                                urlArg += "?";
                            }else{
                                urlArg += "&";
                            }
                            urlArg += _routeCurrent.args[indice].name + "=" + _routeCurrent.args[indice].value;
                        }
                    }
                }
                $.Oda.Context.window.location.hash = urlRoute + urlArg;
                
                var decoded = $('<div/>').html($.Oda.getI8nByString(p_params.routeDef.title)).text();
                
                $.Oda.Context.window.document.title = $.Oda.Context.projectLabel + " - " + decoded;
            }
            
            //load dependencies
            if(p_params.routeDef.dependencies.length > 0){
                for(var indice in p_params.routeDef.dependencies){
                    _routeDependencies[p_params.routeDef.dependencies[indice]].load();
                }
            }
            
            if(p_params.routeDef.dependencies.length > 0){
                for(var indice in p_params.routeDef.dependencies){
                    if(_routeDependencies[p_params.routeDef.dependencies[indice]].statut !== _routeDependenciesStatus.loaded()){
                        _trace("Waiting : "+p_params.routeDef.dependencies[indice]);
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
            
            if($.Oda.Session.code_user !== ""){
                $.Oda.MenuSlide.show();
                $.Oda.Menu.show();
            }

            //call content
             _loadPartial({"routeDef" : p_params.routeDef});
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
            $.get(p_params.routeDef.path, function(data) {
                $('#content').html(data);
                $.Oda.Scope.init();
                $.Oda.Tuto.start();
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
    
    /**
    * _checkParams
    * @param {json} p_params
    * @param {json} p_def ex : {attr1 : null, attr2 : "truc"}
    */
    function _checkParams(p_params, p_def) {
        try {
            var params = $.Oda.clone(p_params);
            
            var param_return = {};
            
            for (var key in p_def) {
                if(p_def[key] == null){
                    if(typeof params[key] == "undefined"){
                        var myUserException = new UserException("Param : "+key+" missing");
                        throw myUserException;
                    }else{
                        param_return[key] = params[key];
                    }
                }else{
                    if(typeof params[key] == "undefined"){
                        param_return[key] = p_def[key];
                    }else{
                        param_return[key] = params[key];
                    }
                }
                delete params[key];
            }
            
            for (var key in params) {
                param_return[key] = params[key];
            }
            
            return param_return;
        } catch (er) {
            $.Oda.log(0, "ERROR(_checkParams):" + er.message);
            return null;
        }
    };

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda = {
        /* Version number */
        version: VERSION
        
        , Color : {
            INFO : "#5882FA",
            WARNING : "#f7931e",
            ERROR : "#B9121B",
            SUCCESS : "#AEEE00"
        }
        
        , Session : {
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
        
        , Context : {
            projectLabel : "Project"
            , host : ""
            , rest : ""
            , resources : ""
            , window : window
        }
        
        //for the application project
        , App : {}
        
        , Worker : {
            
            lib : function(){
                var $ = {};
                $.Oda = {
                    Context : {
                        rest : "$$REST$$"
                    }
                    
                    , Session : {
                        code_user : "$$CODEUSER$$"
                        , key : "$$ODAKEY$$"
                    }
                    
                    ,message : function(cmd, parameter){
                        try {
                            this.cmd = cmd;
                            this.parameter = parameter;
                        } catch (er) {
                            this.log("ERROR($Oda.message):" + er.message);
                        }
                    }   
                    
                    , log : function(msg){
                        console.log(msg);
                    } 
                    
                    , callRest: function(p_url, p_tabSetting, p_tabInput) {
                        try {
                            var jsonAjaxParam = {
                                url : p_url
                                , contentType : 'application/x-www-form-urlencoded; charset=UTF-8'
                                , dataType : 'json'
                                , type : 'GET'
                            };

                            p_tabInput.milis = this.getMilise();
                            p_tabInput.ctrl = "OK";
                            p_tabInput.keyAuthODA = this.Session.key;

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

                            //Utilisé notament pour les workers qui ne peuvent avoir Jquey et donc Ajax
                            var xhr_object = new XMLHttpRequest();

                            switch (jsonAjaxParam.type){ 
                                case "GET": 
                                case "get": 
                                    var url = jsonAjaxParam.url+"?tag=1";
                                    
                                    for(var key in jsonAjaxParam.data){
                                       var param = jsonAjaxParam.data[key].toString();
                                       url += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type, url, false);
                                    xhr_object.send(null);
                                    break;  
                                case "POST": 
                                case "post": 
                                default: 
                                    var params = "tag=1";
                                    for(var key in jsonAjaxParam.data){
                                       var param = jsonAjaxParam.data[key].toString();
                                        params += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type,jsonAjaxParam.url, false);
                                    xhr_object.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                                    xhr_object.send(params);
                                    break; 
                            }

                            v_retourSync = "Vide";
                            switch (jsonAjaxParam.dataType) { 
                                case "json": 
                                    if (xhr_object.readyState == 4 && xhr_object.status == 200) {
                                        v_retourSync = JSON.parse(xhr_object.responseText);
                                    } else {
                                        v_retourSync = "ERROR";
                                    }
                                    break;   
                                case "text": 
                                default: 
                                    if (xhr_object.readyState == 4) {
                                        v_retourSync = xhr_object.responseText;
                                    } else {
                                        v_retourSync = "ERROR";
                                    }
                                break; 
                            }

                            delete self.xhr_object;

                            return v_retourSync;
                        } catch (er) {
                            var msg = "ERROR($.Oda.callRest):" + er.message;
                            this.log(msg);
                            return null;
                        }
                    },

                    /**
                    * @name getMilise
                    * @returns {string}
                    */
                    getMilise : function() {
                        try {
                            var d = new Date();
                            return d.getTime();
                        } catch (er) {
                            this.log("ERROR(µ.functionsOda.getMilise):" + er.message);
                            return null;
                        }
                    }
                    
                    /**
                    * arrondir
                    * @param {float|int} p_value
                    * @param {int} p_precision
                    * @returns {float|int}
                    */
                    , arrondir : function(p_value, p_precision){
                        try {
                            var retour = 0;
                            var coef = Math.pow(10, p_precision);

                            if(coef != 0){
                                retour = Math.round(p_value*coef)/coef;
                            }else{
                                retour = Math.round(p_value);
                            }

                            return retour;
                        } catch (er) {
                            this.log("ERROR($.Oda.arrondir):" + er.message);
                            return null;
                        }
                    }
                };
            }
            
            , message : function(cmd, parameter){
                try {
                    this.cmd = cmd;
                    this.parameter = parameter;
                } catch (er) {
                    this.log("ERROR($Oda.message):" + er.message);
                }
            }  
            
            /**
            * @name initWorker
            * @desc pour initialiser un worker 
            * @param {string} p_nameWorker
            * @param {string} p_fonctionRetour
            * @returns {Worker}
            */
            , initWorker : function(p_nameWorker, p_dataInit, p_functionCore, p_fonctionRetour) {
                try {
                    var strFunctionLib = $.Oda.Worker.lib.toString();
                    strFunctionLib = strFunctionLib.substring(12);
                    strFunctionLib = strFunctionLib.substring(0, strFunctionLib.length - 1);
                    strFunctionLib = strFunctionLib.replace("$$CODEUSER$$",$.Oda.Session.code_user);
                    strFunctionLib = strFunctionLib.replace("$$ODAKEY$$",$.Oda.Session.key);
                    strFunctionLib = strFunctionLib.replace("$$REST$$",$.Oda.Context.rest);
                    
                    var strFunctionCore = p_functionCore.toString();
                    strFunctionCore = strFunctionCore.substring(12);
                    strFunctionCore = strFunctionCore.substring(0, strFunctionCore.length - 1);
                    
                    var blob = new Blob([strFunctionLib+strFunctionCore], {type: 'application/javascript'});

                    var monWorker = new Worker(window.URL.createObjectURL(blob));

                    monWorker.addEventListener("message", function (event) {
                        p_fonctionRetour(event.data);
                    }, false);

                    return monWorker;
                } catch (er) {
                    $.Oda.log(0, "ERROR($.Oda.Worker.initWorker):" + er.message);
                }
            }

            /**
            * @name terminateWorker
            * @desc pour finir le worker
            * @param {type} p_worker
            * @returns {undefined}
            */
            , terminateWorker : function(p_worker) {
                try {
                    // On aurait pu créer une commande 'stop' qui aurait été traitée
                    // au sein du worker qui se serait fait hara-kiri via .close()
                    p_worker.terminate();
                } catch (er) {
                    $.Oda.log(0, "ERROR($.Oda.Worker.terminateWorker):" + er.message);
                }
            }
        }
        
        , Tuto : {
            enable : true
            
            , currentElt : ""
            
            , listElt : []
            
            , start : function (){
                try {
                    if($.Oda.Tuto.enable){
                        $('[oda-tuto]').each(function(index, value){
                            var theTuto = {};
                            var def = $(value).attr("oda-tuto");
                            var tabDef = def.split(";");
                            for(var indice in tabDef){
                                var elt = tabDef[indice];
                                var prop = elt.split(":");
                                if(prop[1] !== undefined){
                                    theTuto[prop[0]] = prop[1];
                                }
                            }

                            if(!$.Oda.Tuto.listElt.hasOwnProperty(theTuto.id)){
                                $.Oda.Tuto.listElt[theTuto.id] = {"id" : theTuto.id, "enable" : true, "props" : theTuto};
                            }
                            
                            var sessionTuto = $.Oda.Storage.get("ODA-SESSION-TUTO-"+$.Oda.Session.code_user, {});
                            if(sessionTuto.hasOwnProperty(theTuto.id)){
                                $.Oda.Tuto.listElt[theTuto.id].enable = sessionTuto[theTuto.id];
                            }else{
                                sessionTuto[theTuto.id] = true;
                                $.Oda.Storage.set("ODA-SESSION-TUTO-"+$.Oda.Session.code_user, sessionTuto);
                            }
                            
                            if(($.Oda.Tuto.listElt[theTuto.id].enable)&&($.Oda.Tuto.currentElt === "")){
                                $.Oda.Tuto.show(theTuto.id);
                            }
                        });
                    }
                } catch (er) {
                    $.Oda.log(0,"ERROR($.Oda.Tuto.start):" + er.message);
                }
            }
            
            , readed : function(id){
                try {
                    $.Oda.Tuto.listElt[id].enable = false;
                    
                    var sessionTuto = $.Oda.Storage.get("ODA-SESSION-TUTO-"+$.Oda.Session.code_user);
                    sessionTuto[id] = false;
                    $.Oda.Storage.set("ODA-SESSION-TUTO-"+$.Oda.Session.code_user, sessionTuto);
                    
                    $("[oda-tuto^='id:"+id+"']").tooltip('destroy');
                    for(var elt in $.Oda.Tuto.listElt){
                        if($.Oda.Tuto.listElt[elt].enable){
                            this.show(elt);
                            break;
                        }
                    }
                } catch (er) {
                    $.Oda.log(0,"ERROR($.Oda.Tuto.readed):" + er.message);
                }
            }
            
            , show : function (id){
                try {
                    var elt = $("[oda-tuto^='id:"+id+"']");
                    
                    $.Oda.Tuto.currentElt = id;
                                
                    elt.attr("data-toggle","tooltip");
                    if($.Oda.Tuto.listElt[id].props.hasOwnProperty("location")){
                        elt.attr("data-placement",$.Oda.Tuto.listElt[id].props.location);
                    }
                    elt.attr("data-html",true);

                    var strHtml = $('[oda-tuto-content='+id+']').html();

                    if($.Oda.Tuto.listElt[id].props.hasOwnProperty("bt-next")){
                        strHtml += "";
                    }
                    strHtml += '<br><button type="button" onclick="$.Oda.Tuto.readed(\''+id+'\');" class="btn btn-info btn-xs">Readed</button >';
                    elt.attr("title",strHtml);
                    elt.on('hidden.bs.tooltip', function () {
                        $.Oda.Tuto.enable = false;
                        elt.tooltip('destroy');
                    });

                    elt.tooltip('show');
                } catch (er) {
                    $.Oda.log(0,"ERROR($.Oda.Tuto.show):" + er.message);
                }
            }
        }
        
        , Scope : {
            /**
             * 
             * @returns {undefined}
             */
            init : function(){
                try {
                    $('[oda-input-text]').each(function(index, value){
                        var id = $(value).attr("oda-input-text");
                        
                        $(value).attr("id",id);
                        
                        $(value).keyup(function(elt){
                            $.Oda.Scope.refresh();
                           
                            var odaCheck = $(value).attr("oda-input-text-check");
                            if(odaCheck !== undefined){
                                var patt = new RegExp(odaCheck, "g");
                                var res = patt.test($(value).val());
                                if(res){
                                    $(value).data("isOk", true);
                                    $(value).css("border-color","#04B404");
                                }else{
                                    $(value).data("isOk", false);
                                    $(value).css("border-color","#FF0000");
                                }
                            }
                        });
                        
                        var placeHolder = $(value).attr("oda-input-text-placeholder");
                        if(placeHolder !== undefined){
                            var tab = placeHolder.split(".");
                            if((tab.length > 1) && ($.Oda.getI8n(tab[0], tab[1]) !== "Not define")){
                                $(value).attr("placeholder", $.Oda.getI8n(tab[0], tab[1]));
                            }
                        }
                        
                        var odaTips = $(value).attr("oda-input-text-tips");
                        if(odaTips !== undefined){
                            var tab = odaTips.split(".");
                            if((tab.length > 1) && ($.Oda.getI8n(tab[0], tab[1]) !== "Not define")){
                                $(value).after('<span style="color : #a1a1a1;" id="span-'+id+'">&nbsp;</span>');
                                $(value).focus(function() {
                                    $("#span-"+id).html($.Oda.getI8n(tab[0], tab[1]));
                                });
                                $(value).focusout(function() {
                                    $("#span-"+id).html("&nbsp;");
                                });
                            }
                        }
                    });
                    
                    $('[oda-label]').each(function(index, value){
                        var labelName = $(value).attr("oda-label");
                        var tab = labelName.split(".");
                        $(value).html($.Oda.getI8n(tab[0], tab[1]));
                    });
                    
                    $('[oda-submit]').each(function(index, value){
                        var id = $(value).attr("oda-submit");
                        
                        $(value).attr("id",id);
                        
                        $(document).keypress(function(e) {
                            if(e.which == 13) {
                                if(!$(value).hasClass("disabled")){
                                    $(value).click();
                                }
                            }
                        });
                    });
                } catch (er) {
                    $.Oda.log.log(0,"ERROR($.Oda.Scope.init):" + er.message);
                }
            }
            /**
             * 
             * @returns {undefined}
             */
            , refresh : function(){
                try {
                    
                } catch (er) {
                    $.Oda.log.log(0,"ERROR($.Oda.Scope.refresh):" + er.message);
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
                    $('#oda-popup').modal("hide");
                    _RouterExit = false;
                    
                    if($.Oda.isUndefined(p_request)){
                        p_request = _routeCurrent;
                    }
                    
                    var founded = false;
                    for(var name in _routes){
                        for(var indice in _routes[name].urls){
                            var url = _routes[name].urls[indice];
                            if(url === p_request.route){
                                
                                if(!$.Oda.isInArray(name, _routesAllowed)){
                                    $.Oda.logout();
                                    return this;
                                }
                                
                                _routeCurrent = p_request;
                                _routes[name].go(p_request);
                                
                                $("#wrapper").removeClass("toggled");
                                return this;
                            }
                        }
                    }

                    $.Oda.log(0, p_request.route + " not found.");
                    _routes["404"].go(p_request);
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
                    $("#projectLabel").text($.Oda.Context.projectLabel);
                    
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
        
        , Google : {
            
            gapi : false
            
            , clientId : "249758124548-fgt33dblm1r8jm0nh9snn53pkghpjtsu.apps.googleusercontent.com"
            
            , apiKey : "PgCsKeWAsVGdOj3KjPn-JPS3"
            
            , scopes : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
            
            , methodeSessionAuthKo : null
            
            , methodeSessionAuthOk : null
            
            , sessionInfo : null
            
            , gaips : []
            
            , init : function () {
                try {
                    if(!$.Oda.Google.gapi) {
                        $.getScript("https://apis.google.com/js/client.js?onload=handleClientLoad",$.Oda.Google.handleClientLoad);
                    }else{
                        _trace("gapi.client already load.");
                    }
                    _trace("$.Oda.Google.init finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.init :" + er.message);
                }
            },
            handleClientLoad : function() {
                try {
                    if(gapi.client === null) {
                        $.Oda.Context.window.setTimeout($.Oda.Google.handleClientLoad,500);
                    }else{
                        $.Oda.Google.gapi = gapi;
                    }
                    _trace("$.Oda.Google.handleClientLoad finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.handleClientLoad :" + er.message);
                }
            },
            startSessionAuth : function(methodOk, methodKo){
                try {
                    if(!$.Oda.isUndefined(methodOk)){
                        $.Oda.Google.methodeSessionAuthOk = methodOk;
                    }
                    if(!$.Oda.isUndefined(methodKo)){
                        $.Oda.Google.methodeSessionAuthKo = methodKo;
                    }
                    if($.Oda.Google.gapi) {
                        $.Oda.Google.loadGapis([{"api":"oauth2","version":"v2"}], $.Oda.Google.callbackAuthSession);
                    }else{
                        setTimeout($.Oda.Google.startSessionAuth,500);
                    }
                    _trace("$.Oda.Google.startSessionAuth finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.startSessionAuth :" + er.message);
                }
            },
            loadGapis : function(tabApi, callbackFunction) {
                try {
                    if(tabApi.length>0){
                        for(var indice in $.Oda.Google.gaips){
                            if(($.Oda.Google.gaips[indice].api === tabApi[0].api) && ($.Oda.Google.gaips[indice].version === tabApi[0].version)){
                                _trace('Already ok pour : '+tabApi[0].api + " en "+tabApi[0].version);
                                tabApi.splice(0,1);
                                $.Oda.Google.loadGapis(tabApi,callbackFunction);
                                return true;
                            }
                        }
                        
                        $.Oda.Google.gapi.client.load(tabApi[0].api, tabApi[0].version,function(resp){
                            if(typeof resp == "undefined"){
                                $.Oda.Google.gaips.push({"api":tabApi[0].api, "version" : tabApi[0].version});
                                _trace('Chargement ok pour : '+tabApi[0].api + " en "+tabApi[0].version);
                                tabApi.splice(0,1);
                                $.Oda.Google.loadGapis(tabApi,callbackFunction);
                            }else{
                                _trace('Chargement ko pour : '+tabApi[0].api + " en "+tabApi[0].version + "("+resp.error.message+")");
                            }
                        });
                    }else{
                        callbackFunction();
                    }
                    _trace("$.Oda.Google.loadGapis finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.loadGapis :" + er.message);
                }
            },
            callbackAuthSession : function(){
                try {
                    $.Oda.Google.gapi.client.setApiKey($.Oda.Google.apiKey);
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": true}, $.Oda.Google.handleAuthResult);
                    _trace("$.Oda.Google.callbackLaodGapis finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.callbackLaodGapis :" + er.message);
                }
            },
            handleAuthResult : function(authResult) {
                try {
                    if ((authResult) && (!authResult.error) && (authResult.access_token != undefined)) {
                        $.Oda.Google.sessionInfo = authResult;
                        $.Oda.Google.methodeSessionAuthOk();
                    } else {
                        $.Oda.Google.methodeSessionAuthKo();
                    }
                    _trace("$.Oda.Google.handleAuthResult finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.handleAuthResult :" + er.message);
                }
            },
            callServiceGoogleAuth : function(callMethodeOk) {
                try {
                    $.Oda.Google.methodeSessionAuthOk = callMethodeOk;
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": false}, $.Oda.Google.handleAuthResult);
                    _trace("$.Oda.Google.callServiceGoogleAuth finish.");
                } catch (er) {
                    $.Oda.log(0, "ERROR - $.Oda.Google.callServiceGoogleAuth :" + er.message);
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
         * 
         * @param {type} p_depends
         * @param {type} p_functionFeedback
         * @returns {Boolean}
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
         * @name getI8nByString
         * @param {string} p_group
         * @returns {String}
        */
        , getI8nByString: function(p_tag) {
            try {
                var returnvalue = p_tag;
                
                var tab = p_tag.split(".");
                if((tab.length > 1) && ($.Oda.getI8n(tab[0], tab[1]) !== "Not define")){
                    return $.Oda.getI8n(tab[0], tab[1]);
                }

                return returnvalue;
            } catch (er) {
                this.log(0, "ERROR($.Oda.getI8nByString):" + er.message);
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
                        var trad = grp[$.Oda.Session.userInfo.locale][p_tag];
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
                if(returns["strErreur"] === ""){
                    var code_user = returns["data"]["resultat"]["code_user"].toUpperCase();
                    var key = returns["data"]["resultat"]["keyAuthODA"];

                    var session = {
                        "code_user" : code_user
                        , "key" : key
                    };
                    
                    var tabSetting = { };
                    var tabInput = { 
                        code_user : code_user
                    };
                    var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getAuthInfo.php", tabSetting, tabInput);
                    if(retour.strErreur === ""){
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
                        $.Oda.Storage.set("ODA-SESSION",session,43200);
                        $.Oda.Session = session;
                    }else{
                        $.Oda.Storage.remove("ODA-SESSION");
                        $.Oda.Notification.create(returns["strErreur"],$.Oda.Notification.danger());
                    }
                    _RouterExit = false;
                    if(p_params.reload){
                        $.Oda.Router.navigateTo();
                    }
                }else {
                   $.Oda.Notification.create(returns["strErreur"],$.Oda.Notification.danger());
                }
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
                $.Oda.Session = {
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
                };
                $.Oda.MenuSlide.remove();
                $.Oda.Menu.remove();
                _routes.auth.go();
           } catch (er) {
               this.log(0, "ERROR($.Oda.logout):" + er.message);
           }
        }
        
        , MenuSlide : {
            /**
            * @name : show
            */
            show : function(){
                try {
                    if(!_menuSlide){
                        var strHtml = "";
                        strHtml += '<li class="sidebar-brand"><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'profile\',\'args\':[]});">'+$.Oda.Session.userInfo.firstName + " " + $.Oda.Session.userInfo.lastName+'</a></li>';
                        strHtml += '<li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'profile\',\'args\':[]});" oda-label="oda-main.profile">Your profile</a></li>';
                        strHtml += '<li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'contact\',\'args\':[]});" oda-label="oda-main.contact">Contact</a></li>';
                        strHtml += '<li><a href="javascript:$.Oda.logout();" oda-label="oda-main.logout">Logout</a></li>';
                        $('#menuSlide').html(strHtml);
                        _menuSlide = true;
                    }
                } catch (er) {
                    this.log(0, "ERROR($.Oda.MenuSlide.show):" + er.message);
                }
            }

            /**
            * @name : remove
            */
            , remove : function(){
                try {
                    $("#wrapper").removeClass("toggled");
                    $('#menuSlide').html('<li class="sidebar-brand" id="profileDisplay"><span oda-label="oda-project.userLabel">Profile Name</span></li><li class="divider"></li><li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'contact\',\'args\':[]});" oda-label="oda-main.contact">Contact</a></li>');
                    _menuSlide = false;
                } catch (er) {
                   this.log(0, "ERROR($.Oda.MenuSlide.remove):" + er.message);
                }
            }
        }
        
        , Menu : {
            /**
            * @name : show
            */
            show : function(){
                try {
                    if(!_menu){
                        var tabInput = { rang : $.Oda.Session.userInfo.profile, id_page : 0 };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getMenu.php", {"functionRetour" : function(retour){
                                var strHTML = "";
                                if(retour["strErreur"] === ""){
                                    var datas = retour["data"]["resultat"]["data"];

                                    var cate = "";
                                    
                                    for (var indice in datas) {
                                        if((datas[indice]["id_categorie"] !== "98") && ((datas[indice]["id_categorie"] !== "1"))){
                                            if(datas[indice]["id_categorie"] != cate){
                                                cate = datas[indice]["id_categorie"];
                                                if(indice != "0"){
                                                    strHTML += "</ul></li>";
                                                }
                                                
                                                strHTML += '<li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'+datas[indice]["Description_cate"]+'<span class="caret"></span></a><ul class="dropdown-menu" role="menu">';
                                            }else{
                                                strHTML += "<li><a href=\"javascript:$.Oda.Router.navigateTo({'route':'"+datas[indice]["Lien"]+"','args':[]});\">"+datas[indice]["Description_courte"]+"</a></li>";
                                                _routesAllowed[datas[indice]["Lien"]] = true;
                                            }
                                        }
                                    }
                                    
                                    $('#menu').html(strHTML);
                                }
                            }
                        }, tabInput);
                        _menu = true;
                    }
                } catch (er) {
                    $.Oda.log(0, "ERROR($.Oda.Menu.show):" + er.message);
                }
            }

            /**
            * @name : remove
            */
            , remove : function(){
                try {
                    $('#menu').html('');
                    _menu = false;
                } catch (er) {
                   $.Oda.log.log(0, "ERROR($.Oda.Menu.remove):" + er.message);
                }
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
            * @param {string} p_type
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
                        $.Oda.log(0, msg);
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
        * arrondir
        * @param {float|int} p_value
        * @param {int} p_precision
        * @returns {float|int}
        */
        , arrondir : function(p_value, p_precision){
            try {
                var retour = 0;
                var coef = Math.pow(10, p_precision);

                if(coef != 0){
                    retour = Math.round(p_value*coef)/coef;
                }else{
                    retour = Math.round(p_value);
                }

                return retour;
            } catch (er) {
                this.log(0, "ERROR($.Oda.arrondir):" + er.message);
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
        
        /**
        * objDataTableFromJsonArray
        * 
        * @param {object} p_JsonArray
        * @returns {object}
        */
        , objDataTableFromJsonArray : function(p_JsonArray){
            try {
                var objRetour = { statut : "ok"};

                var arrayEntete = {};
                var i = 0;
                for(var key in p_JsonArray[0]){
                    arrayEntete[key] = i;
                    i++;
                }
                objRetour.entete = arrayEntete;

                var arrayData = new Array();
                for(var indice in p_JsonArray){
                    var subArrayData = new Array();
                    for(var key in p_JsonArray[indice]){
                        subArrayData[subArrayData.length] = p_JsonArray[indice][key];
                    } 
                    arrayData[arrayData.length] = subArrayData;
                }

                objRetour.data = arrayData;

                return objRetour;
            } catch (er) {
                this.log(0, "ERROR($.Oda.objDataTableFromJsonArray):" + er.message);
                var objRetour = { statut : "ko"};
                return objRetour;
            }
        }
        
        /**
        * affichePopUp
        * @param {object} p_params
        */
        , affichePopUp : function(p_params){
            try {
                $('#oda-popup_label').html("<b>"+p_params.label+"</b>");
                $('#oda-popup_content').html(p_params.details);
                
                if(p_params.hasOwnProperty("footer")){
                    $('#oda-popup_footer').html(p_params.footer);
                }
                
                $('#oda-popup').modal("show");
            } catch (er) {
                this.log(0, "ERROR($.Oda.affichePopUp):" + er.message);
            }
        }
        
        /**
         * saisirContact
         * 
         * @param {type} p_reponse
         * @param {type} p_message
         */
        , contact : function(p_reponse, p_message) {
            try {
                var contact_mail_administrateur = this.getParameter("contact_mail_administrateur");
                if(contact_mail_administrateur != ""){
                    var tabInput = { "reponse" : p_reponse, "message" : p_message, "code_user" : $.Oda.Session.code_user };
                    var result = this.callRest(this.Context.rest+"API/phpsql/insertContact.php", {}, tabInput);
                    if(result["strErreur"] === ""){
                        var message_html = "";
                        var sujet = "";

                        message_html = "";
                        message_html += "<html><head></head><body>";
                        message_html += "De : <pre>"+$.Oda.Session.code_user+"</pre>";
                        message_html += "</br></br>";
                        message_html += "Contact : <pre>"+p_reponse+"</pre>";
                        message_html += "</br></br>";
                        message_html += "Message : <pre>"+p_message+"</pre>";
                        message_html += "</body></html>";

                        sujet = "[ODA-"+this.getParameter("nom_site")+"]Nouveau contact.";

                        var paramsMail = {
                            email_mail_ori : contact_mail_administrateur
                            , email_labelle_ori : "Service Mail ODA"
                            , email_mail_reply : contact_mail_administrateur
                            , email_labelle_reply : "Service Mail ODA"
                            , email_mails_dest : contact_mail_administrateur
                            , message_html : message_html
                            , sujet : sujet
                        };

                        var retour = this.sendMail(paramsMail);

                        $("#mail").val("");
                        $("#name").val("");
                        $("#msg").val("");

                        if(retour){
                            this.Notification.create("Demande bien soummise sous l'identifiant n&ordm;"+result["data"]["resultat"]+".",this.Notification.success());
                        }
                    }else{
                        this.Notification.create(result["strErreur"],this.Notification.danger());
                    }
                }else{
                    this.Notification.create("Mail du service non définie.",this.Notification.danger());
                }
            } catch (er) {
                this.log(0, "ERROR($.Oda.contact()):" + er.message);
            }
        }
        
        /**
        * sendMail
        * @ex $.Oda.sendMail({email_mails_dest:'fabrice.rosito@gmail.com',message_html:'HelloContent',sujet:'HelloSujet'});
        * @param {json} p_params
        * @returns {boolean}
        */
        , sendMail : function(p_params) {
           try {
                var params_attempt = {
                     email_mails_dest : null
                     , message_html : null
                     , sujet : null
                 };

                var params = _checkParams(p_params, params_attempt);
                if(params == null){
                    return false;
                }

                var returns = this.callRest(this.Context.rest+"API/scriptphp/send_mail.php", {type : 'POST'}, params);

                return returns;
           } catch (er) {
               this.log(0, "ERROR($.Oda.sendMail) :" + er.message);
               return null;
           }
        }
    };

    // Initialize
    _init();

})();
