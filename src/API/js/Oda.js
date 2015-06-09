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
        VERSION = '0.1',
        
        _debug = true,

        _mokup = true,
        
        _dependecies = null,
        
        _connectionRest = false,
        
        _dependeciesFeedback = null,
        
        _menuSlide = false,
        
        _menu = false,
        
        _i8n = [],
        
        _routesAllowedDefault = ["contact","404","auth","support","home","forgot","subscrib","profile","", "stats", "admin"],
        
        _routesAllowed = [],
        
        _routes = {
            "404" : {
                "path" : "API/partials/404.html",
                "title" : "oda-main.404-title",
                "urls" : ["404"],
                "middleWares" : [],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "auth" : {
                "path" : "API/partials/auth.html",
                "title" : "oda-main.authentification",
                "urls" : ["auth"],
                "middleWares" : ["support"],
                "dependencies" : [],
                "go" : function(p_request){
                  _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "support" : {
                "path" : "API/partials/support.html",
                "title" : "oda-main.support-title",
                "urls" : ["support"],
                "middleWares" : [],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : true});
                }
            },
            "contact" : {
                "path" : "API/partials/contact.html",
                "title" : "oda-main.contact",
                "urls" : ["contact"],
                "middleWares" : ["support"],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "forgot" : {
                "path" : "API/partials/forgot.html",
                "title" : "oda-main.forgot-title",
                "urls" : ["forgot"],
                "middleWares" : ["support"],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "subscrib" : {
                "path" : "API/partials/subscrib.html",
                "title" : "oda-main.subscrib-title",
                "urls" : ["subscrib"],
                "middleWares" : ["support"],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "home" : {
                "path" : "API/partials/home.html",
                "title" : "oda-main.home-title",
                "urls" : ["","home"],
                "middleWares" : ["support", "auth"],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "profile" : {
                "path" : "API/partials/profile.html",
                "title" : "oda-main.profile-title",
                "urls" : ["profile"],
                "middleWares" : ["support", "auth"],
                "dependencies" : [],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "stats" : {
                "path" : "API/partials/stats.html",
                "title" : "oda-stats.title",
                "urls" : ["stats"],
                "middleWares" : ["support", "auth"],
                "dependencies" : ["hightcharts"],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "admin" : {
                "path" : "API/partials/admin.html",
                "title" : "oda-admin.title",
                "urls" : ["admin"],
                "middleWares" : ["support", "auth"],
                "dependencies" : ["dataTables", "ckeditor"],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            },
            "supervision" : {
                "path" : "API/partials/supervision.html",
                "title" : "oda-supervision.title",
                "urls" : ["supervision"],
                "middleWares" : ["support", "auth"],
                "dependencies" : ["dataTables"],
                "go" : function(p_request){
                    _routerGo({"routeDef" : this, "request" : p_request, "system" : false});
                }
            }
        },
        _routeMiddleWares = {
            "auth" : function(){
                $.Oda.Log.debug("MiddleWares : auth");
                
                if(($.Oda.Session.hasOwnProperty("code_user"))&&($.Oda.Session.code_user !== "")){
                    if($.Oda.Tooling.isInArray($.Oda.Router.current.route, _routesAllowed)){
                        var tabSetting = { };
                        var tabInput = { 
                            "code_user" : $.Oda.Session.code_user,
                            "key" : $.Oda.Session.key
                        };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/checkSession.php", tabSetting, tabInput); 
                        if(retour.data){
                            return true;
                        }else{
                            //session ko
                            _RouterExit = true;
                            $.Oda.Security.logout();
                            return false;
                        }
                    }else{
                        //session ko
                        _RouterExit = true;
                        $.Oda.Security.logout();
                        return false;
                    }
                }else{
                    var session = $.Oda.Storage.get("ODA-SESSION");
                    
                    if(session !== null){
                        $.Oda.Session = session;
                        
                        var tabSetting = { };
                        var tabInput = { 
                            "code_user" : session.code_user,
                            "key" : session.key
                        };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/checkSession.php", tabSetting, tabInput); 
                        if(retour.data){
                            $.Oda.Security.loadRight();
                            if($.Oda.Tooling.isInArray($.Oda.Router.current.route, _routesAllowed)){
                                return true;
                            }else{
                                //session ko
                                _RouterExit = true;
                                $.Oda.Security.logout();
                                return false;
                            }
                        }else{
                            //session ko
                            _RouterExit = true;
                            $.Oda.Security.logout();
                            return false;
                        }
                    }else{
                        //check if log by url
                        var params = $.Oda.Router.current.args;
                        if((params.hasOwnProperty("getUser"))&&(params.hasOwnProperty("getPass"))){
                            var auth = $.Oda.Security.auth({"login" : params.getUser, "mdp" : params.getPass, "reload" : false});
                            if(auth){
                                if($.Oda.Tooling.isInArray($.Oda.Router.current.route, _routesAllowed)){
                                    return true;
                                }else{
                                    //session ko
                                    _RouterExit = true;
                                    $.Oda.Security.logout();
                                    return false;
                                }
                            }else{
                                //session ko
                                _RouterExit = true;
                                $.Oda.Security.logout();
                                return false;
                            }
                        }else{
                            //session ko
                            _RouterExit = true;
                            $.Oda.Security.logout();
                            return false;
                        }
                    }
                }
                        
                //session ko
                _RouterExit = true;
                $.Oda.Security.logout();
                return false;
            },
            "support" : function(){
                $.Oda.Log.debug("MiddleWares : support");
                var maintenance = $.Oda.getParameter("maintenance");
                if(typeof maintenance === "undefined"){
                    _connectionRest = false;
                    _RouterExit = true;
                    _routes.support.go();
                }else{
                    _connectionRest = true;
                    if(maintenance){
                        _RouterExit = true;
                        _routes.support.go();
                    }
                }
            }
        },
        _routeDependenciesStatus = {
            "notLoaded" : function(){
                return "notLoaded";
            },
            "loading" : function(){
                return "loading";
            },
            "loaded" : function(){
                return "loaded";
            }
        },
        _routeDependencies = {
            "dataTables" : {
                "name" : "dataTables",
                "statut" : _routeDependenciesStatus.notLoaded(),
                "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        this.statut = _routeDependenciesStatus.loading();
                        $('<link/>', {
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: "API/css/dataTables.bootstrap.css"
                        }).appendTo('head');
                        $.getScript("API/libs/datatables/media/js/jquery.dataTables.min.js",function(){
                            $.getScript("API/js/dataTables.bootstrap.js",function(){
                                $.Oda.Router.dependencieLoaded("dataTables");
                            });
                        });
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        $.Oda.Log.debug(this.name +  " loading.");
                    }else{
                        $.Oda.Log.debug(this.name +  " already loaded.");
                    }
                }
            },
            "hightcharts" : {
                "name" : "hightcharts",
                "statut" : _routeDependenciesStatus.notLoaded(),
                "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        this.statut = _routeDependenciesStatus.loading();
                        $.getScript("API/libs/highcharts-release/highcharts.js",function(){
                            $.Oda.Router.dependencieLoaded("hightcharts");
                        });
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        $.Oda.Log.debug(this.name +  " loading.");
                    }else{
                        $.Oda.Log.debug(this.name +  " already loaded.");
                    }
                }
            },
            "ckeditor" : {
                "name" : "ckeditor",
                "statut" : _routeDependenciesStatus.notLoaded(),
                "load" : function(){
                    if(this.statut === _routeDependenciesStatus.notLoaded()){
                        this.statut = _routeDependenciesStatus.loading();
                        $.getScript("//cdn.ckeditor.com/4.4.7/standard/ckeditor.js",function(){
                            $.Oda.Router.dependencieLoaded("ckeditor");
                        });
                    }else if(this.statut === _routeDependenciesStatus.loading()){
                        $.Oda.Log.debug(this.name +  " loading.");
                    }else{
                        $.Oda.Log.debug(this.name +  " already loaded.");
                    }
                }
            }
        },
        _RouterExit = false
    ;


    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() { 
        try {
            _routesAllowed = _routesAllowedDefault.slice(0);
            
            //depdends
            var listDepends = [
                {"name" : "style" , ordered : false, "list" : [
                    { "elt" : "API/css/css.css", "type" : "css" },
                    { "elt" : "css/css.css", "type" : "css" }
                ]},
                {"name" : "datas" , ordered : false, "list" : [
                    { "elt" : "API/i8n/i8n.json", "type" : "json", "target" : function(p_json){_i8n = _i8n.concat(p_json);}},
                    { "elt" : "i8n/i8n.json", "type" : "json", "target" : function(p_json){_i8n = _i8n.concat(p_json);}}
                ]},
                {"name" : "include" , ordered : true, "list" : [
                    { "elt" : "include/config.js", "type" : "script" }
                ]}
            ];

            if(_mokup){
                _mokup = [];
                var listDependsMokup = [
                    {"name" : "mokup" , ordered : false, "list" : [
                        { "elt" : "API/mokup/mokup.json", "type" : "json", "target" : function(p_json){_mokup = _mokup.concat(p_json);}},
                        { "elt" : "mokup/mokup.json", "type" : "json", "target" : function(p_json){_mokup = _mokup.concat(p_json);}}
                    ]}
                ];
                listDepends = listDepends.concat(listDependsMokup);
            }

            $.Oda.loadDepends(listDepends,_loaded);
        } catch (er) {
           $.Oda.Log.error("_init : " + er.message);
        }
    }
    
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
                    { "elt" : "js/OdaApp.js", "type" : "script" }
                ]}
            ],_appStarted);
        } catch (er) {
           $.Oda.Log.error("_loaded : " + er.message);
        }  
    }
    
    /**
     * @name _appStarted
     */
    function _appStarted() {
        try {
            $.Oda.Log.info("Oda fully loaded.");
        } catch (er) {
           $.Oda.Log.error("_appStarted : " + er.message);
        }  
    }

    /**
     * 
     * @returns {Array}
     */
    function _getListParamsGet() {
        try {
            var result = {};
            var tableau = decodeURI($.Oda.Context.window.location.hash).split("?");
            if(tableau.length > 1){
                tableau = tableau[1];
                tableau = tableau.split("&");
                for (var indice in tableau){
                    var tmp = tableau[indice].split("=");
                    result[tmp[0]] = tmp[1];
                } 
            }
            return result;
        } catch (er) {
            $.Oda.Log.error("_getListParamsGet : " + er.message);
            return null;
        }
    }
    
    /**
     * go
     * @param {object} p_params description
     * @returns {$.Oda.Router}
     */
    function _routerGo(p_params) {
        try {
            $.Oda.Log.debug("RouterGo : ");
            $.Oda.Log.debug(p_params);

            $('#' + $.Oda.Context.mainDiv).html('<img SRC="API/img/loading.gif" ALT="Chargement" TITLE="Chargement">');

            //rewrite hash
            if (!p_params.system) {
                var urlRoute = $.Oda.Router.current.route;
                var urlArg = "";
                for (var key in $.Oda.Router.current.args) {
                    if (($.Oda.Router.current.args[key] !== "getUser") && ($.Oda.Router.current.args[key] !== "getPass")) {
                        if (urlArg === "") {
                            urlArg += "?";
                        } else {
                            urlArg += "&";
                        }
                        urlArg += key + "=" + $.Oda.Router.current.args[key];
                    }
                }
                $.Oda.Context.window.location.hash = urlRoute + urlArg;

                var decoded = $.Oda.Tooling.decodeHtml($.Oda.I8n.getByString(p_params.routeDef.title));

                $.Oda.Context.window.document.title = $.Oda.Context.projectLabel + " - " + decoded;
            }

            //load dependencies
            if (p_params.routeDef.dependencies.length > 0) {
                for (var indice in p_params.routeDef.dependencies) {
                    _routeDependencies[p_params.routeDef.dependencies[indice]].load();
                }
            }

            if (p_params.routeDef.dependencies.length > 0) {
                for (var indice in p_params.routeDef.dependencies) {
                    if (_routeDependencies[p_params.routeDef.dependencies[indice]].statut !== _routeDependenciesStatus.loaded()) {
                        $.Oda.Log.debug("Waiting : " + p_params.routeDef.dependencies[indice]);
                        setTimeout(function () {
                            _routerGo(p_params);
                        }, 100);
                        return true;
                    }
                }
            }

            //exec middleware
            if (p_params.routeDef.middleWares.length > 0) {
                for (var indice in p_params.routeDef.middleWares) {
                    _routeMiddleWares[p_params.routeDef.middleWares[indice]]();
                }
            }

            if ((_RouterExit) && (!p_params.system)) {
                return true;
            }

            //load menus
            if (($.Oda.Session.hasOwnProperty("code_user")) && ($.Oda.Session.code_user !== "")) {
                $.Oda.Display.MenuSlide.show();
                $.Oda.Display.Menu.show();
            }

            //show message
            if ($.Oda.Session.code_user !== "") {
                $.Oda.Display.Message.show();
            }

            //call content
             _loadPartial({"routeDef" : p_params.routeDef});
            return true;
        } catch (er) {
            $.Oda.Log.error("_RouterGo : " + er.message);
            return null;
        }
    }
        
    /**
     * 
     * @param {type} p_params
     * @returns {Boolean}
     */
    function _loadPartial(p_params) {
        try {
            $.get(p_params.routeDef.path, function(data) {
                $('#'+$.Oda.Context.mainDiv).html(data);
                $.Oda.Scope.init({id:$.Oda.Context.mainDiv});
                if($.Oda.Session.code_user !== ""){
                    $.Oda.Tuto.start();
                }
            });
            return true;
        } catch (er) {
            $.Oda.Log.error("_loadPartial : " + er.message);
            return null;
        }
    }
    
    /**
     * 
     * @param {type} p_elt
     * @param {type} p_mode
     * @returns {Boolean}
     */
    function _loadDepend(p_elt, p_mode) {
        try {
            var retour = true;

            $.Oda.Log.debug("Loading : "+p_elt.elt);
            
            switch(p_elt.type) {
                case "css":
                    $('<link/>', {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: p_elt.elt
                    }).appendTo('head');
                    p_elt.status = "done";
                    $.Oda.Log.debug( "Sucess for : "+p_elt.elt );
                    
                    if(p_mode === "serie"){
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
                        $.Oda.Log.debug( "Sucess for : "+$(this)[0].lib+" ("+textStatus+")" );
                        p_elt.status = "done";
                    
                        if(p_mode === "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    },
                    error : function( jqxhr, settings, exception ) {
                        $.Oda.Log.debug( "Triggered ajaxError handler for : "+$(this)[0].lib+"." );
                        p_elt.status = "fail";
                    
                        if(p_mode === "serie"){
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
                        $.Oda.Log.debug( "Sucess for : "+$(this)[0].lib+" ("+textStatus+")" );
                        p_elt.status = "done";
                        
                        if(p_mode === "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    },
                    error : function( jqxhr, settings, exception ) {
                        $.Oda.Log.debug( "Triggered ajaxError handler for : "+$(this)[0].lib+"." );
                        p_elt.status = "fail";
                        
                        if(p_mode === "serie"){
                            _loadListDependsOrdoned();
                        }
                        _allDependsLoaded();
                    }
                    });
                    break;
                default:
                    $.Oda.Log.debug( "Type unknown for : "+p_elt.elt+"." );
            }

            return retour;
        } catch (er) {
            $.Oda.Log.error("_loadDepend : " + er.message);
            return null;
        }
    }
    
    /**
     * 
     * @returns {Boolean}
     */
    function _loadListDependsOrdoned() {
        try {
            var retour = true;

            for (var indice in _dependecies) {
                if((!$.Oda.Tooling.isUndefined(_dependecies[indice].status)) && (_dependecies[indice].status === "doing")){
                    var gardian = true;
                    for (var indiceList in _dependecies[indice].list) {
                        var elt = _dependecies[indice].list[indiceList];
                        if(($.Oda.Tooling.isUndefined(elt.status)) || (elt.status === "doing")){
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
            $.Oda.Log.error("_loadListDependsOrdoned : " + er.message);
            return null;
        }
    }
    
    /**
     * 
     * @returns {Boolean}
     */
    function _allDependsLoaded() {
        try {
            var retour = true;
            
            if(_dependecies !== null){
                for (var indice in _dependecies) {
                    if(($.Oda.Tooling.isUndefined(_dependecies[indice].status)) || (_dependecies[indice].status === "doing")){
                        retour = false;
                        break;
                    }else{
                        for (var indiceList in _dependecies[indice].list) {
                            var elt = _dependecies[indice].list[indiceList];
                            if(($.Oda.Tooling.isUndefined(elt.status)) || (elt.status === "doing")){
                                retour = false;
                                break;
                            }
                        }
                    }
                }
            }

            if((retour) && (_dependecies !== null)){
                _dependecies = null;
                var methode = _dependeciesFeedback;
                _dependeciesFeedback = null;
                methode();
            }

            return retour;
        } catch (er) {
            $.Oda.Log.error("_allDependsLoaded : " + er.message);
            return null;
        }
    }
    
    /**
    * _checkParams
    * @param {json} p_params
    * @param {json} p_def ex : {attr1 : null, attr2 : "truc"}
    */
    function _checkParams(p_params, p_def) {
        try {
            var params = $.Oda.Tooling.clone(p_params);
            
            var param_return = {};
            
            for (var key in p_def) {
                if(p_def[key] === null){
                    if(typeof params[key] === "undefined"){
                        var myUserException = new UserException("Param : "+key+" missing");
                        throw myUserException;
                    }else{
                        param_return[key] = params[key];
                    }
                }else{
                    if(typeof params[key] === "undefined"){
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
            $.Oda.Log.error("_checkParams : " + er.message);
            return null;
        }
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda = {
        /* Version number */
        version: VERSION,

        Color : {
            INFO : "#5882FA",
            WARNING : "#f7931e",
            ERROR : "#B9121B",
            SUCCESS : "#AEEE00"
        },

        Session : {
            "code_user" : "",
            "key" : "",
            "userInfo" : {
                "locale" : "fr",
                "firstName" : "",
                "lastName" : "",
                "mail" : "",
                "profile" : 0,
                "profileLabel" : "",
                "showTooltip" : 0
            }
        },

        Context : {
            projectLabel : "Project",
            mainDiv : "oda-content",
            host : "",
            rest : "",
            resources : "",
            window : window,
            console : console
        },

        Regexs : {
            mail : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|fr)\\b",
            login : "^[a-zA-Z0-9]{3,}$",
            pass : "^[a-zA-Z0-9]{4,}$",
            fristName : "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            lastName : "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            noInjection : "^(?!.*?function())"
        },

        /**
         * geRangs
         * @returns {json}
         */
        getRangs :  function() {
            try {
                var valeur = $.Oda.Storage.get("ODA_rangs");
                if(valeur === null){

                    var tabInput = { "sql" : "Select `labelle`,`indice` FROM `api_tab_rangs` ORDER BY `indice` desc" };
                    var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getSQL.php", {type : 'POST'}, tabInput);

                    if(retour.strErreur === ""){
                        valeur = retour.data.resultat.data;
                    }else{
                        $.Oda.Notification.error(retour.strErreur);
                    }

                    $.Oda.Storage.set("ODA_rangs",valeur,$.Oda.Storage.ttl_default);
                }

                return valeur;
            } catch (er) {
                $.Oda.Log.error("$.Oda.geRangs : " + er.message);
                return null;
            }
        },
        MokUp : {
            /**
             * @param params
             * @param params.url
             * @param params.tabInput
             * @returns {*}
             */
            get : function(params){
                try {
                    var strInterface = params.url.replace($.Oda.Context.rest,"");

                    var elt;
                    for(var indice in _mokup){
                        if(_mokup[indice].interface === strInterface){
                            elt = _mokup[indice];
                            break;
                        }
                    }

                    if($.Oda.Tooling.isUndefined(elt)){
                        return {"strErreur":"No mokup found for "+strInterface,"data":{},"statut":4};
                    }

                    return elt.value[0].return;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.MokUp.get : " + er.message);
                    return null;
                }
            }
        },
        /**
         *
         */
        Date : {
            getStrDateFR : function(){
                try {
                    var currentTime = new Date();
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var strDate = jour + "/" + mois + "/" + annee;
                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFR() : " + er.message);
                    return null;
                }
            },

            /**
             * getStrDateTimeFrFromUs
             * @param {String} p_strDateTime
             * @returns {String}
             */
            getStrDateTimeFrFromUs : function(p_strDateTime) {
                try {
                    var strDate = "";

                    strDate = p_strDateTime.substr(8,2) + "/" + p_strDateTime.substr(5,2) + "/" + p_strDateTime.substr(0,4) + " " + p_strDateTime.substr(10,(p_strDateTime.length - 10));

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTimeFrFromUs : " + er.message);
                    return null;
                }
            },

            /**
             * getStrDateFrFromUs
             * @param {String} p_strDate
             * @returns {String}
             */
            getStrDateFrFromUs : function(p_strDate) {
                try {
                    var strDate = "";

                    strDate = p_strDate.substr(8,2) + "/" + p_strDate.substr(5,2) + "/" + p_strDate.substr(0,4);

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFrFromUs : " + er.message);
                    return null;
                }
            },

            /**
             * @name convertSecondsToTime
             * @desc Seconds to hh:mm:ss
             * @param {int} p_second
             * @returns {String}
             */
            convertSecondsToTime : function(p_second) {
                try {
                    var sec_num = p_second;
                    var hours   = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);

                    if (hours   < 10) {hours   = "0"+hours;}
                    if (minutes < 10) {minutes = "0"+minutes;}
                    if (seconds < 10) {seconds = "0"+seconds;}
                    var time    = hours+':'+minutes+':'+seconds;
                    return time;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.convertSecondsToTime : " + er.message);
                    return null;
                }
            },

            /**
             * @name getStrDateTime
             * @returns {String}
             */
            getStrDateTime : function() {
                try {
                    var currentTime = new Date();
                    var hours = $.Oda.Tooling.pad2(currentTime.getHours());
                    var minutes = $.Oda.Tooling.pad2(currentTime.getMinutes());
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var secondes = $.Oda.Tooling.pad2(currentTime.getSeconds());
                    var strDateTime = annee + "/" + mois + "/" + jour + " " + hours + ":" + minutes + ":" + secondes;
                    return strDateTime;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTime : " + er.message);
                    return null;
                }
            }
        },

        Display : {
            MenuSlide : {
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
                            strHtml += '<li><a href="javascript:$.Oda.Security.logout();" oda-label="oda-main.logout">Logout</a></li>';
                            $('#menuSlide').html(strHtml);
                            _menuSlide = true;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.show : " + er.message);
                    }
                },

                /**
                 * @name : remove
                 */
                remove : function(){
                    try {
                        $("#wrapper").removeClass("toggled");
                        $('#menuSlide').html('<li class="sidebar-brand" id="profileDisplay"><span oda-label="oda-project.userLabel">Profile Name</span></li><li class="divider"></li><li><a href="javascript:$.Oda.Router.navigateTo({\'route\':\'contact\',\'args\':[]});" oda-label="oda-main.contact">Contact</a></li>');
                        _menuSlide = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.remove : " + er.message);
                    }
                }
            },
            Menu : {
                /**
                 * @name : show
                 */
                show : function(){
                    try {
                        if(!_menu){
                            var tabInput = { rang : $.Oda.Session.userInfo.profile, id_page : 0 };
                            var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getMenu.php", {"functionRetour" : function(retour){
                                var strHTML = "";
                                if(retour.strErreur === ""){
                                    var datas = retour.data.resultat.data;

                                    var cate = "";

                                    for (var indice in datas) {
                                        if((datas[indice].id_categorie !== "98") && ((datas[indice].id_categorie !== "1"))){
                                            if(datas[indice].id_categorie !== cate){
                                                cate = datas[indice].id_categorie;
                                                if(indice !== "0"){
                                                    strHTML += "</ul></li>";
                                                }

                                                strHTML += '<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'+datas[indice].Description_cate+'<span class="caret"></span></a><ul class="dropdown-menu" role="menu">';
                                            }
                                            var route = datas[indice].Lien;
                                            route = route.replace("api_page_","");
                                            route = route.replace("page_","");
                                            route = route.replace(".html","");
                                            strHTML += "<li><a href=\"javascript:$.Oda.Router.navigateTo({'route':'"+route+"','args':[]});\">"+datas[indice].Description_courte+"</a></li>";
                                        }
                                    }
                                    $('#menu').html(strHTML);
                                }
                            }
                            }, tabInput);
                            _menu = true;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.show : " + er.message);
                    }
                },

                /**
                 * @name : remove
                 */
                remove : function(){
                    try {
                        $('#menu').html('');
                        _menu = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.remove : " + er.message);
                    }
                }
            },
            Message : {
                /**
                 * @param {object} p_params
                 * @returns {$.Oda}
                 */
                show: function (p_params) {
                    try {
                        var tabInput = { code_user : $.Oda.Session.code_user };
                        var callback = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getMessagesToDisplay.php", { functionRetour : function(datas) {
                            if(datas.strErreur === ""){
                                for(var indice in datas.data.messages.data){
                                    var message = datas.data.messages.data[indice];
                                    if ( ! $( "#oda-message-"+message.id ).length ) {
                                        var strHtml = "";
                                        strHtml += '';
                                        strHtml += '<div class="alert alert-'+message.niveau+' alert-dismissible" id="oda-message-'+message.id+'" style="width:90%;margin-left:auto;margin-right:auto;">';
                                        strHtml += '<button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="$.Oda.Display.Message.hide({id:\''+message.id+'\'});"><span aria-hidden="true">&times;</span></button>';
                                        strHtml += message.message;
                                        strHtml += '</div>';
                                        $('#'+$.Oda.Context.mainDiv).before(strHtml);
                                    }
                                }

                            } else{
                                $.Oda.Notification.error(datas.strErreur);
                            }
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.show : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @returns {$.Oda}
                 */
                hide: function (p_params) {
                    try {
                        var tabInput = { code_user : $.Oda.Session.code_user, id : p_params.id };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/setMessagesLus.php", {functionRetour : function(datas) {
                            if(retour.strErreur === ""){
                                $('#oda-message-'+p_params.id).remove();
                            } else{
                                $.Oda.Notification.error(datas.strErreur);
                            }
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.hide  : " + er.message);
                        return null;
                    }
                }
            },
            Popup : {
                /**
                 * affichePopUp
                 * @param {object} p_params
                 */
                open : function(p_params){
                    try {
                        if(p_params.hasOwnProperty("size")){
                            $('#oda-popup .modal-dialog').addClass("modal-"+p_params.size);
                        }

                        $('#oda-popup_label').html("<b>"+p_params.label+"</b>");
                        $.Oda.Scope.init({id:'oda-popup_label'});

                        $('#oda-popup_content').html(p_params.details);
                        $.Oda.Scope.init({id:'oda-popup_content'});

                        if(p_params.hasOwnProperty("footer")){
                            $('#oda-popup_footer').html(p_params.footer);
                        }else{
                            $('#oda-popup_footer').html('<button type="button" class="btn btn-default" data-dismiss="modal" oda-label="oda-main.bt-close"></button>');
                        }
                        $.Oda.Scope.init({id:'oda-popup_footer'});

                        $('#oda-popup').modal("show");
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.open : " + er.message);
                    }
                },
                /**
                 * @param {object} p_params
                 * @returns {$.Oda.Display.Popup}
                 */
                close: function (p_params) {
                    try {
                        $('#oda-popup_label').html("");
                        $('#oda-popup_content').html("");
                        $('#oda-popup_footer').html("");
                        $('#oda-popup').modal("hide");
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.close : " + er.message);
                        return null;
                    }
                }
            },
            TemplateHtml : {
                /**
                 * @param {Object} p_params
                 * @param p_params.template
                 * @param p_params.scope
                 * @returns {$.Oda.Display.TemplateHtml}
                 */
                create: function (p_params) {
                    try {
                        var listExpression = $.Oda.Tooling.findBetweenWords({str : $('#'+p_params.template).html(), first : "{{", last : "}}" });

                        var strHtml = $('#'+p_params.template).html();
                        for(var indice in listExpression){
                            var resultEval = $.Oda.Display.TemplateHtml.eval({exrp : listExpression[indice], scope : p_params.scope});
                            strHtml = $.Oda.Tooling.replaceAll({str : strHtml, find : '{{'+listExpression[indice]+'}}', by : resultEval});
                        }
                        return strHtml;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.create : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @returns {String}
                 */
                eval: function (p_params) {
                    try {
                        'use strict'

                        var source = '(function(' + Object.keys(p_params.scope).join(', ') + ') { return ' + p_params.exrp + ';})';

                        var compiled = eval(source);

                        var result = [];
                        for (var property in p_params.scope)
                            if (p_params.scope.hasOwnProperty(property))
                                result.push(p_params.scope[property]);

                        var result = compiled.apply(p_params.scope, result);

                        return result;
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.eval : " + er.message);
                        return null;
                    }
                }
            }
        },
        
        //for the application project
        App : {},
        
        Tooling : {
            timeout : function(func, time, arg){
                try {
                    setTimeout(func, time, arg);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.timeout : " + er.message);
                    return null;
                }
            },
            /**
            * arrondir
            * @param {float|int} p_value
            * @param {int} p_precision
            * @returns {float|int}
            */
            arrondir : function(p_value, p_precision){
                try {
                    var retour = 0;
                    var coef = Math.pow(10, p_precision);

                    if(coef !== 0){
                        retour = Math.round(p_value*coef)/coef;
                    }else{
                        retour = Math.round(p_value);
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.arrondir : " + er.message);
                    return null;
                }
            },
            /**
             * @name clone
             * @desc Clone an object JS
             * @param{object} p_params
             * @returns {object}
             */
            clone : function(p_params) {
                try {
                    if (null === p_params || "object" !== typeof p_params) return p_params;
                    var copy = p_params.constructor();
                    for (var attr in p_params) {
                        if (p_params.hasOwnProperty(attr)) copy[attr] = p_params[attr];
                    }
                    return copy;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clone : " + er.message);
                    return null;
                }
            },
            /**
             * 
             * @param {string} html
             * @returns {string}
             */
            decodeHtml : function (html) {
                try {
                    var decoded = $('<div/>').html(html).text();
                    return decoded;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.decodeHtml : " + er.message);
                    return null;
                }
            },
            /**
             * @param {object} p_params
             * @returns {$.Oda.Tooling}
             */
            findBetweenWords: function (p_params) {
                try {
                    var r = new RegExp(p_params.first + '(.*?)' + p_params.last, 'gm');
                    var list =  p_params.str.match(r);

                    for (var indice in list){
                        list[indice] = list[indice].replace(p_params.first,'').replace(p_params.last,'');
                    }
                    return list;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.findBetweenWords : " + er.message);
                    return null;
                }
            },
            /**
             * @param p_params
             * @param p_params.str
             * @param p_params.find
             * @param p_params.by
             * @returns {String}
             */
            replaceAll: function (p_params) {
                try {
                    var str = p_params.find.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                    var re = new RegExp(str, 'g');

                    var strReturn = p_params.str.replace(re, p_params.by);
                    return strReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.replaceAll : " + er.message);
                    return null;
                }
            },
            /**
            * 
            * @param {type} path
            * @returns {unresolved}
            */
            clearSlashes : function(string) {
                try {
                    return string.toString().replace(/\/$/, '').replace(/^\//, '');
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clearSlashes : " + er.message);
                    return null;
                }
            },
            /**
             * getListValeurPourAttribut
             * @param {json} p_obj
             * @param {string} p_attribut
             * @returns {Array}
             */
            getListValeurPourAttribut : function(p_obj, p_attribut, p_type) {
                try {
                    var retour = [];

                    for (var indice in p_obj) {
                        for (var key in p_obj[indice]) {
                            if(key === p_attribut){
                                if(typeof p_type !== "undefined"){
                                    var valeur = null;
                                    if(p_type === "int"){
                                        valeur = parseInt(p_obj[indice][key]);
                                    }else if(p_type === "float"){
                                        valeur = parseFloat(p_obj[indice][key]);
                                    }else{
                                        valeur = new p_type(p_obj[indice][key]);
                                    }
                                    retour[retour.length] = valeur;
                                }else{
                                    retour[retour.length] = p_obj[indice][key];
                                }
                            }
                        }
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getListValeurPourAttribut : " + er.message);
                    return null;
                }
            },
            /**
            * isInArray
            * @param {string} p_value
            * @param {array} p_array
            * @returns {Boolean}
            */
            isInArray :  function(p_value, p_array) {
                try {
                    var boolRetour = false;

                    for(var indice in p_array){
                        if(p_value === p_array[indice]){
                            boolRetour = true;
                            break;
                        }
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isInArray : " + er.message);
                    return null;
                }
            },
            /**
            * @name isUndefined
            * @desc is ndefined N
            * @param {object} p_object
            * @returns {Worker}
            */
            isUndefined : function(p_object) {
                try {
                    var boolReturn = true;

                    if(typeof p_object !== "undefined"){
                        boolReturn = false;
                    }

                    return boolReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isUndefined : " + er.message);
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
                    $.Oda.Log.error("$.Oda.Tooling.getMilise : " + er.message);
                    return null;
                }
            },
            
            objectSize : function(obj) {
                try {
                    var size = 0, key;
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) size++;
                    }
                    return size;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objectSize : " + er.message);
                    return null;
                }
            },

            /**
             * objDataTableFromJsonArray
             *
             * @param {object} p_JsonArray
             * @returns {object}
             */
            objDataTableFromJsonArray : function(p_JsonArray){
                try {
                    var objRetour = { statut : "ok"};

                    var arrayEntete = {};
                    var i = 0;
                    for(var key in p_JsonArray[0]){
                        arrayEntete[key] = i;
                        i++;
                    }
                    objRetour.entete = arrayEntete;

                    var arrayData = [];
                    for(var indice in p_JsonArray){
                        var subArrayData = [];
                        for(var key in p_JsonArray[indice]){
                            subArrayData[subArrayData.length] = p_JsonArray[indice][key];
                        }
                        arrayData[arrayData.length] = subArrayData;
                    }

                    objRetour.data = arrayData;

                    return objRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objDataTableFromJsonArray : " + er.message);
                    var objRetour = { statut : "ko"};
                    return objRetour;
                }
            },
            /**
             * pad2
             * @param {int} number
             * @returns {String}
             */
            pad2 : function(number) {
                try {
                    return (number < 10 ? '0' : '') + number;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.pad2 : " + er.message);
                    return null;
                }
            }
        },

        I8n : {
            /**
             * @name get
             * @param {string} p_group
             * @param {string} p_tag
             * @returns {String}
            */
            get : function(p_group, p_tag) {
                try {
                    var returnvalue = "Not define";

                    for (var grpId in _i8n) {
                        var grp = _i8n[grpId];
                        if(grp.groupName === p_group){
                            var trad = grp[$.Oda.Session.userInfo.locale][p_tag];
                            if(!$.Oda.Tooling.isUndefined(trad)){
                                returnvalue = trad;
                            }
                            break;
                        }
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.get : " + er.message);
                    return null;
                }
            },
            /**
             * @name getByString
             * @param {string} p_group
             * @returns {String}
            */
            getByString: function(p_tag) {
                try {
                    var returnvalue = p_tag;

                    var tab = p_tag.split(".");
                    if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                        return $.Oda.I8n.get(tab[0], tab[1]);
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.getByString : " + er.message);
                    return null;
                }
            }
        },
        
        Security : {
            /**
             * auth
             * @param {object} p_params
             * @returns {$.Oda}
             */
            auth : function(p_params) {
                try {
                    var tabInput = { "login" : p_params.login, "mdp" : p_params.mdp };
                    var returns = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getAuth.php", {}, tabInput); 
                    if(returns.strErreur === ""){
                        var code_user = returns.data.resultat.code_user.toUpperCase();
                        var key = returns.data.resultat.keyAuthODA;

                        var session = {
                            "code_user" : code_user,
                            "key" : key
                        };

                        var tabSetting = { };
                        var tabInput = { 
                            code_user : code_user
                        };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getAuthInfo.php", tabSetting, tabInput);
                        if(retour.strErreur === ""){
                            var userInfo = {
                                "locale" : retour.data.resultat.langue,
                                "firstName" : retour.data.resultat.nom,
                                "lastName" : retour.data.resultat.prenom,
                                "mail" : retour.data.resultat.mail,
                                "profile" : retour.data.resultat.profile,
                                "profileLabel" : retour.data.resultat.labelle,
                                "showTooltip" : retour.data.resultat.montrer_aide_ihm
                            };
                            session.userInfo = userInfo;
                            $.Oda.Storage.set("ODA-SESSION",session,43200);
                            $.Oda.Session = session;

                            $.Oda.Security.loadRight();
                        }else{
                            $.Oda.Storage.remove("ODA-SESSION");
                            $.Oda.Notification.error(returns.strErreur);
                        }
                        _RouterExit = false;
                        if(p_params.reload){
                            $.Oda.Router.navigateTo();
                        }
                    }else {
                       $.Oda.Notification.error(returns.strErreur);
                    }
                } catch (er) {
                    $.Oda.Log.Log.error("$.Oda.Security.auth : " + er.message);
                    return null;
                }
            },
            /**
             * 
             * @returns {undefined}
             */
            loadRight : function() {
                try {
                    _routesAllowed = _routesAllowedDefault.slice(0);
                    var tabInput = { "rang" : $.Oda.Session.userInfo.profile, "id_page" : 0 };
                    var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getMenu.php", {}, tabInput);
                    if(retour.strErreur === ""){
                        var datas = retour.data.resultat.data;

                        for (var indice in datas) {
                            if((datas[indice].id_categorie !== "98") && ((datas[indice].id_categorie !== "1"))){
                                var route = datas[indice].Lien;
                                route = route.replace("api_page_","");
                                route = route.replace("page_","");
                                route = route.replace(".html","");
                                _routesAllowed.push(route);
                            }
                        }
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Security.loadRight() : " + er.message);
                }
            },
        
            /**
            * @name : logout
            */
            logout : function(){
               try {
                    var session = $.Oda.Storage.get("ODA-SESSION");
                    if(session !== null){
                        var tabInput = { 
                            "key" : session.key
                        };
                        var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/deleteSession.php", {}, tabInput); 
                        $.Oda.Storage.remove("ODA-SESSION");
                    }
                    $.Oda.Session = {
                        "code_user" : "",
                        "key" : "",
                        "userInfo" : {
                            "locale" : "fr",
                            "firstName" : "",
                            "lastName" : "",
                            "mail" : "",
                            "profile" : 0,
                            "profileLabel" : "",
                            "showTooltip" : 0
                        }
                    };
                    $.Oda.Display.MenuSlide.remove();
                    $.Oda.Display.Menu.remove();
                    _routes.auth.go();
               } catch (er) {
                   $.Oda.Log.error("$.Oda.Security.logout : " + er.message);
               }
            }
        },
        
        Business : {
            /**
             * saisirContact
             * 
             * @param {type} p_reponse
             * @param {type} p_message
             */
            contact : function(p_reponse, p_message) {
                try {
                    var contact_mail_administrateur = $.Oda.getParameter("contact_mail_administrateur");
                    if(contact_mail_administrateur !== ""){
                        var tabInput = { "reponse" : p_reponse, "message" : p_message, "code_user" : $.Oda.Session.code_user };
                        var result = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/insertContact.php", {}, tabInput);
                        if(result.strErreur === ""){
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

                            sujet = "[ODA-"+$.Oda.getParameter("nom_site")+"]Nouveau contact.";

                            var paramsMail = {
                                email_mail_ori : contact_mail_administrateur,
                                email_labelle_ori : "Service Mail ODA",
                                email_mail_reply : contact_mail_administrateur,
                                email_labelle_reply : "Service Mail ODA",
                                email_mails_dest : contact_mail_administrateur,
                                message_html : message_html,
                                sujet : sujet
                            };

                            var retour = $.Oda.sendMail(paramsMail);

                            $("#mail").val("");
                            $("#name").val("");
                            $("#msg").val("");

                            if(retour){
                                $.Oda.Notification.success("Demande bien soummise sous l'identifiant n&ordm;"+result.data.resultat+".");
                            }
                        }else{
                            $.Oda.Notification.error(result.strErreur);
                        }
                    }else{
                        $.Oda.Notification.error("Mail du service non définie.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.contact() : " + er.message);
                }
            }
        },

        Worker : {
            
            lib : function(){
                var $ = {};
                $.Oda = {
                    Context : {
                        rest : "$$REST$$"
                    },

                    Session : {
                        code_user : "$$CODEUSER$$",
                        key : "$$ODAKEY$$"
                    },

                    message : function(cmd, parameter){
                        try {
                            this.cmd = cmd;
                            this.parameter = parameter;
                        } catch (er) {
                            $.Oda.log("ERROR($Oda.message : " + er.message);
                        }
                    },

                    log : function(msg){
                        console.log(msg);
                    },

                    callRest: function(p_url, p_tabSetting, p_tabInput) {
                        try {
                            var jsonAjaxParam = {
                                url : p_url,
                                contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
                                dataType : 'json',
                                type : 'GET'
                            };

                            p_tabInput.milis = this.getMilise();
                            p_tabInput.ctrl = "OK";
                            p_tabInput.keyAuthODA = this.Session.key;

                            jsonAjaxParam.data = p_tabInput;

                            //traitement determinant async ou pas
                            var async = true;
                            if(p_tabSetting.functionRetour === null){
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
                                    if (xhr_object.readyState === 4 && xhr_object.status === 200) {
                                        v_retourSync = JSON.parse(xhr_object.responseText);
                                    } else {
                                        v_retourSync = "ERROR";
                                    }
                                    break;   
                                case "text": 
                                default: 
                                    if (xhr_object.readyState === 4) {
                                        v_retourSync = xhr_object.responseText;
                                    } else {
                                        v_retourSync = "ERROR";
                                    }
                                break; 
                            }

                            delete self.xhr_object;

                            return v_retourSync;
                        } catch (er) {
                            var msg = "ERROR($.Oda.callRest) : " + er.message;
                            $.Oda.log(msg);
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
                            $.Oda.log("ERROR($.Oda.getMilise) : " + er.message);
                            return null;
                        }
                    },
                    
                    /**
                    * arrondir
                    * @param {float|int} p_value
                    * @param {int} p_precision
                    * @returns {float|int}
                    */
                    arrondir : function(p_value, p_precision){
                        try {
                            var retour = 0;
                            var coef = Math.pow(10, p_precision);

                            if(coef !== 0){
                                retour = Math.round(p_value*coef)/coef;
                            }else{
                                retour = Math.round(p_value);
                            }

                            return retour;
                        } catch (er) {
                            $.Oda.log("ERROR($.Oda.arrondir) : " + er.message);
                            return null;
                        }
                    }
                };
            },
            
            message : function(cmd, parameter){
                try {
                    this.cmd = cmd;
                    this.parameter = parameter;
                } catch (er) {
                    $.Oda.Log.error("$Oda.message : " + er.message);
                }
            },
            
            /**
            * @name initWorker
            * @desc pour initialiser un worker 
            * @param {string} p_nameWorker
            * @param {string} p_fonctionRetour
            * @returns {Worker}
            */
            initWorker : function(p_nameWorker, p_dataInit, p_functionCore, p_fonctionRetour) {
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
                    $.Oda.Log.error("$.Oda.Worker.initWorker : " + er.message);
                }
            },

            /**
            * @name terminateWorker
            * @desc pour finir le worker
            * @param {type} p_worker
            * @returns {undefined}
            */
            terminateWorker : function(p_worker) {
                try {
                    // On aurait pu créer une commande 'stop' qui aurait été traitée
                    // au sein du worker qui se serait fait hara-kiri via .close()
                    p_worker.terminate();
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.terminateWorker : " + er.message);
                }
            }
        },
        
        Tuto : {
            enable : true,

            currentElt : "",

            listElt : [],

            start : function (){
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
                    $.Oda.Log.error("$.Oda.Tuto.start : " + er.message);
                }
            },
            
            readed : function(id){
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
                    $.Oda.Log.error("$.Oda.Tuto.readed : " + er.message);
                }
            },
            
            show : function (id){
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
                    $.Oda.Log.error("$.Oda.Tuto.show : " + er.message);
                }
            }
        },
        
        Scope : {
            /**
             * @param {Object} p_params
             * @param p_params.id
             * @returns {undefined}
             */
            init : function(p_params){
                try {
                    var divTarget = "";
                    if(!$.Oda.Tooling.isUndefined(p_params)){
                        divTarget = '#'+p_params.id+' ';
                    }

                    //oda-input-text
                    $(divTarget+'[oda-input-text]').each(function(index, value){
                        var id = $(value).attr("oda-input-text");
                        
                        $(value).attr("id",id);

                        $.Oda.Scope.checkInputText({elt:value});
                        
                        $(value).keyup(function(elt){$.Oda.Scope.checkInputText({elt:elt.target});});
                        
                        var placeHolder = $(value).attr("oda-input-text-placeholder");
                        if(placeHolder !== undefined){
                            var tab = placeHolder.split(".");
                            if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                                $(value).attr("placeholder", $.Oda.I8n.get(tab[0], tab[1]));
                            }
                        }
                        
                        var odaTips = $(value).attr("oda-input-text-tips");
                        if(odaTips !== undefined){
                            var tab = odaTips.split(".");
                            if((tab.length > 1) && ($.Oda.I8n.get(tab[0], tab[1]) !== "Not define")){
                                $(value).after('<span style="color : #a1a1a1;" id="span-'+id+'">&nbsp;</span>');
                                $(value).focus(function() {
                                    $("#span-"+id).html($.Oda.I8n.get(tab[0], tab[1]));
                                });
                                $(value).focusout(function() {
                                    $("#span-"+id).html("&nbsp;");
                                });
                            }
                        }
                    });


                    //oda-label
                    $(divTarget+'[oda-label]').each(function(index, value){
                        var labelName = $(value).attr("oda-label");
                        var tab = labelName.split(".");
                        $(value).html($.Oda.I8n.get(tab[0], tab[1]));
                    });

                    //oda-submit
                    var nbOdaSubmit = 0;
                    $(divTarget+'[oda-submit]').each(function(index, value){
                        nbOdaSubmit++;
                        var id = $(value).attr("oda-submit");
                        
                        $(value).attr("id",id);
                        
                        $(document).unbind("keypress");
                        
                        $(document).keypress(function(e) {
                            if(e.which === 13) {
                                if(!$(value).hasClass("disabled")){
                                    $(value).click();
                                }
                            }
                        });
                    });
                    if(nbOdaSubmit > 1){
                        $.Oda.Log.warning("Too many oda-submit in document.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.init : " + er.message);
                }
            },
            /**
             * @param {Object} p_params
             * @param p_params.elt
             * @returns {$.Oda.Scope}
             */
            checkInputText: function (p_params) {
                try {
                    var $elt = $(p_params.elt);
                    var odaCheck = $elt.attr("oda-input-text-check");
                    if(odaCheck !== undefined){
                        if(odaCheck.startsWith("Oda.Regexs:")){
                            odaCheck = odaCheck.replace("Oda.Regexs:", '');
                            odaCheck = $.Oda.Regexs[odaCheck];
                        }

                        var patt = new RegExp(odaCheck, "g");
                        var res = patt.test($elt.val());
                        if(res){
                            $elt.data("isOk", true);
                            $elt.css("border-color","#04B404");
                        }else{
                            $elt.data("isOk", false);
                            $elt.css("border-color","#FF0000");
                        }
                    }
                    $.Oda.Scope.refresh();
                    return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.checkInputText : " + er.message);
                    return null;
                }
            },
            /**
             * 
             * @returns {undefined}
             */
            refresh : function(){
                try {
                    
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Scope.refresh : " + er.message);
                }
            }
        },
        
        Storage : {
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
                    $.Oda.Log.error("Oda.Storage.isStorageAvaible : " + er.message);
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
                    if(typeof(p_ttl) !== 'undefined'){
                        ttl = p_ttl;
                    }

                    var storage = {
                        "value" : p_value,
                        "recordDate" : date,
                        "ttl" : ttl
                    };

                    if(boolRetour){
                        var json_text = JSON.stringify(storage);

                        localStorage.setItem(this.storageKey+p_key, json_text);
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.set : " + er.message);
                    return null;
                }
            },

            get: function(p_key, p_default) {
                try {
                    var myStorage = JSON.parse(localStorage.getItem($.Oda.Storage.storageKey+p_key));
                    var myValue = null;
                    if(myStorage !== null){
                        myValue = myStorage.value;

                        if((myStorage.value !== null)&&(myStorage.ttl !== 0)){
                            var d = new Date();
                            var date = d.getTime();

                            var dateTimeOut = myStorage.recordDate + (myStorage.ttl*1000);

                            if(date > dateTimeOut){
                                this.remove(p_key);
                                myValue = null;
                            }
                        }

                        if((myValue === null)&&(typeof(p_default) !== 'undefined')){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }else{
                        if(typeof(p_default) !== 'undefined'){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }

                    return myValue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.get : " + er.message);
                    return null;
                }
            },

            setTtl: function(p_key, p_ttl) {
                try {
                    var myValue = $.Oda.Storage.get(p_key);

                    var d = new Date();
                    var date = d.getTime();

                    var storage = {
                        "value" : myValue,
                        recordDate : date,
                        ttl : p_ttl
                    };

                    var myReturn = $.Oda.Storage.set($.Oda.Storage.storageKey+p_key, storage);

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.setTtl : " + er.message);
                    return null;
                }
            },

            getTtl: function(p_key) {
                try {
                    var myReturn = 0;

                    var myStorage = $.Oda.Storage.get($.Oda.Storage.storageKey+p_key);

                    if(myStorage !== null){

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
                    $.Oda.Log.error("Oda.Storage.getTtl : " + er.message);
                    return null;
                }
            },

            remove: function(p_key) {
                try {
                    var myReturn = true;

                    localStorage.removeItem($.Oda.Storage.storageKey+p_key);

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.setTtl : " + er.message);
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
                    $.Oda.Log.error("Oda.Storage.reset : " + er.message);
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
                    $.Oda.Log.error("Oda.Storage.getIndex : " + er.message);
                    return null;
                }
            }
        },
        
        Router : {
            current : {
                route : "",
                args : []
            },

            routeMiddleWares : {
                "auth" : function(){
                   return "auth";
                },
                "support" : function(){
                   return "support";
                }
            },
            /**
             * navigateTo
             * @param {object} p_request
             * @returns {$.Oda.Router}
             */
            navigateTo : function(p_request) {
                try {
                    //hode popup if show
                    $('#oda-popup').modal("hide");
                    
                    _RouterExit = false;
                    
                    if($.Oda.Tooling.isUndefined(p_request)){
                        p_request = $.Oda.Router.current;
                    }
                    
                    var founded = false;
                    for(var name in _routes){
                        for(var indice in _routes[name].urls){
                            var url = _routes[name].urls[indice];
                            if(url === p_request.route){
                                $.Oda.Router.current = p_request;
                                
                                $.Oda.addStat($.Oda.Session.code_user, $.Oda.Router.current.route, "request");
                                
                                _routes[name].go(p_request);
                                
                                $("#wrapper").removeClass("toggled");
                                return this;
                            }
                        }
                    }

                    $.Oda.Log.error(p_request.route + " not found.");
                    _routes["404"].go(p_request);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.navigateTo : " + er.message);
                    return null;
                }
            },
            /**
             * addRoute
             * @param {String} name description
             * @param {object} p_routeDef
             * @returns {$.Oda.Router}
             */
            addRoute : function(p_name, p_routeDef) {
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
                    $.Oda.Log.error("$.ODa.Router.addRoute : " + er.message);
                    return null;
                }
            },
            /**
             * addMiddleWare
             * @param {string} p_name
             * @param {object} p_midlleWareDef
             * @returns {$.Oda.Router}
             */
            addMiddleWare : function(p_name, p_midlleWareDef) {
                try {
                    _routeMiddleWares[p_name] = p_midlleWareDef;
                    _routeMiddleWares[p_name].name = p_name;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.addMiddleWare : " + er.message);
                    return null;
                }
            },
            /**
             * addDependencies
             * @param {string} p_name
             * @param {object} p_dependenciesLoad
             * @returns {$.Oda.Router}
             */
            addDependencies : function(p_name, p_dependenciesLoad) {
                try {
                    _routeDependencies[p_name] = {
                        "name" : p_name,
                        "statut" : _routeDependenciesStatus.notLoaded(),
                        "load" : function(){
                            if(this.statut === _routeDependenciesStatus.notLoaded()){
                                this.statut = _routeDependenciesStatus.loading();
                                p_dependenciesLoad();
                            }else if(this.statut === _routeDependenciesStatus.loading()){
                                $.Oda.Log.debug(this.name +  " loading.");
                            }else{
                                $.Oda.Log.debug(this.name +  " already loaded.");
                            }
                        }
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.addDependencies : " + er.message);
                    return null;
                }
            },
            /**
             * 
             * @param {type} p_name
             * @returns {$.Oda.Router}
             */
            dependencieLoaded : function(p_name) {
                try {
                    _routeDependencies[p_name].statut = _routeDependenciesStatus.loaded();
                    $.Oda.Log.debug(p_name+" loaded");
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.dependencieLoaded : " + er.message);
                    return null;
                }
            },
            /**
             * 
             * @returns {$.Oda.Router}
             */
            startRooter : function() {
                try {
                    $("#projectLabel").text($.Oda.Context.projectLabel);
                    
                    var hash = $.Oda.Context.window.location.hash;
                    
                    $.Oda.Router.current = {
                        route : $.Oda.Tooling.clearSlashes(decodeURI(hash)).substring(1).replace(/\?(.*)$/, ''),
                        args : _getListParamsGet()
                    };

                    this.navigateTo($.Oda.Router.current);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.ODa.Router.startRooter : " + er.message);
                    return null;
                }
            }
        },
        
        Google : {
            gapiStatuts : {
                "zero" : 0,
                "init" : 1,
                "loaded" : 2,
                "finish" : 3,
                "fail" : 4
            },
            gapiStatut : 0,
            gapi : null,
            clientId : "249758124548-fgt33dblm1r8jm0nh9snn53pkghpjtsu.apps.googleusercontent.com",
            apiKey : "PgCsKeWAsVGdOj3KjPn-JPS3",
            scopes : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            trySessionAuth : 0,
            methodeSessionAuthKo : null,
            methodeSessionAuthOk : null,
            sessionInfo : null,
            gaips : [],

            init : function () {
                try {
                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.init;
                            $.getScript("https://apis.google.com/js/client.js?onload=handleClientLoad",$.Oda.Google.handleClientLoad);
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Log.debug("gapi.src already load.");
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.init : client load fail.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.init :" + er.message);
                }
            },
            handleClientLoad : function() {
                try {
                    if(gapi.hasOwnProperty("client")) {
                        $.Oda.Google.gapi = gapi;
                        $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.loaded;
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad finish.");
                    }else{
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad waiting");
                        setTimeout($.Oda.Google.handleClientLoad,100);
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleClientLoad :" + er.message);
                }
            },
            startSessionAuth : function(methodOk, methodKo){
                try {
                    if(!$.Oda.Tooling.isUndefined(methodOk)){
                        $.Oda.Google.methodeSessionAuthOk = methodOk;
                    }
                    if(!$.Oda.Tooling.isUndefined(methodKo)){
                        $.Oda.Google.methodeSessionAuthKo = methodKo;
                    }

                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth waiting");
                            $.Oda.Google.init();
                            setTimeout($.Oda.Google.startSessionAuth,100);
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Google.loadGapis([{
                                "api": "oauth2",
                                "version": "v2"
                            }], $.Oda.Google.callbackAuthSession);
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth finish.");
                            break;
                        case $.Oda.Google.gapiStatuts.init :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth waiting");
                            setTimeout($.Oda.Google.startSessionAuth,100);
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.startSessionAuth : $.Oda.Google.gapi problem.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.startSessionAuth :" + er.message);
                }
            },
            loadGapis : function(tabApi, callbackFunction) {
                try {
                    if (tabApi.length > 0) {
                        for (var indice in $.Oda.Google.gaips) {
                            if (($.Oda.Google.gaips[indice].api === tabApi[0].api) && ($.Oda.Google.gaips[indice].version === tabApi[0].version)) {
                                $.Oda.Log.debug('Already ok pour : ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                                return true;
                            }
                        }

                        $.Oda.Google.gapi.client.load(tabApi[0].api, tabApi[0].version, function (resp) {
                            if (typeof resp === "undefined") {
                                $.Oda.Google.gaips.push({"api": tabApi[0].api, "version": tabApi[0].version});
                                $.Oda.Log.debug('Chargement ok pour : ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                            } else {
                                $.Oda.Log.debug('Chargement ko pour : ' + tabApi[0].api + " en " + tabApi[0].version + "(" + resp.error.message + ")");
                            }
                        });
                    } else {
                        $.Oda.Log.debug("$.Oda.Google.loadGapis finish.");
                        callbackFunction();
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.loadGapis :" + er.message);
                }
            },
            callbackAuthSession : function(){
                try {
                    $.Oda.Google.gapi.client.setApiKey($.Oda.Google.apiKey);
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": true}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callbackAuthSession finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callbackAuthSession :" + er.message);
                }
            },
            handleAuthResult : function(authResult) {
                try {
                    if ((authResult) && (!authResult.error) && (authResult.access_token !== undefined)) {
                        $.Oda.Google.sessionInfo = authResult;
                        $.Oda.Google.methodeSessionAuthOk();
                    } else {
                        $.Oda.Google.methodeSessionAuthKo();
                    }
                    $.Oda.Log.debug("$.Oda.Google.handleAuthResult finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleAuthResult :" + er.message);
                }
            },
            callServiceGoogleAuth : function(callMethodeOk) {
                try {
                    $.Oda.Google.methodeSessionAuthOk = callMethodeOk;
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": false}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callServiceGoogleAuth finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callServiceGoogleAuth :" + er.message);
                }
            }
        },
        
        /**
        * log
        * @param {int} p_type
        * @param {string} p_msg
        * @returns {boolean}
        */
        Log : {
            "info" : function(p_msg) {
                try {
                    $.Oda.Context.console.info(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.info : " + er.message);
                    return null;
                }
            },
            "trace" : function(p_msg) {
                try {
                    $.Oda.Context.console.log(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.trace : " + er.message);
                    return null;
                }
            },
            "debug" : function(p_msg) {
                try {
                    if(_debug){
                        $.Oda.Context.console.debug(p_msg);
                    }
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.debug : " + er.message);
                    return null;
                }
            },
            "error" : function(p_msg) {
                try {
                    $.Oda.Context.console.error(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.error : " + er.message);
                    return null;
                }
            },
            "warning" : function(p_msg) {
                try {
                    $.Oda.Context.console.warn(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.warning : " + er.message);
                    return null;
                }
            }
        },
        
        /**
         * 
         * @param {type} p_depends
         * @param {type} p_functionFeedback
         * @returns {Boolean}
         */
        loadDepends : function(p_depends, p_functionFeedback){
            try {
                if(_dependecies === null){
                    _dependecies = p_depends;
                }
                
                if(_dependeciesFeedback === null){
                    _dependeciesFeedback = p_functionFeedback;
                }
                
                var retour = true;

                for (var indice in _dependecies) {
                    if(($.Oda.Tooling.isUndefined(_dependecies[indice].status)) || (_dependecies[indice].status !== "done")){
                        $.Oda.Log.debug("Loading list of dependecies : "+_dependecies[indice].name+".");
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
               $.Oda.Log.error("$.Oda.loadDepends : " + er.message);
            }
        },
        
        Notification : {
            id : 0,
            success : function(p_message){
                this.create(p_message,"success", 2000);
            },
            info : function(p_message){
                this.create(p_message,"info", 3000);
            },
            warning : function(p_message){
                this.create(p_message,"warning", 5000);
            },
            danger : function(p_message){
                this.create(p_message,"danger");
            },
            error : function(p_message){
                this.create(p_message,"danger");
                $.Oda.Log.error(p_message);
            },
            /**
            * notification
            * @Desc Show notification
            * @param {string} p_message
            * @param {string} p_type
            * @returns {boolean}
            */
            create : function(p_message, p_type, time) {
                try {
                    $.Oda.Notification.id++;
                    var strHtml = "";
                    strHtml += '';
                    strHtml += '<div class="alert alert-'+p_type+' alert-dismissible" style="text-align:center;" id="oda-notification-'+$.Oda.Notification.id+'">';
                    strHtml += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
                    strHtml += p_message;
                    strHtml += '</div>';
                    $( "#oda-notification" ).append( strHtml );
                    
                    if(!$.Oda.Tooling.isUndefined(time)){
                        $.Oda.Tooling.timeout($.Oda.Notification.remove,time,{id:$.Oda.Notification.id});
                    }
                    
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Notification.notification :" + er.message);
                    return null;
                }
            },
            /**
             * 
             * @param {object} params
             * @returns {$.Oda.Notification}
             */
            remove : function(params){
                try {
                    $('#oda-notification-'+params.id).fadeOut( 500, function(){
                        $( this ).remove();
                    });
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Notification.remove :" + er.message);
                    return null;
                }
            }
        },
        
        /**
         * @name callRest
         * @desc Hello
         * @param{string} p_url
         * @param{json} p_tabSetting
         * @param{json} p_tabInput
         * @returns {json}
         */
        callRest: function(p_url, p_tabSetting, p_tabInput) {
            try {
                var jsonAjaxParam = {
                    url : p_url,
                    contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
                    dataType : 'json',
                    type : 'GET'
                };

                //Mokup
                if(_mokup){
                    var response = {};
                    if($.Oda.Tooling.isUndefined(p_tabSetting.functionRetour)){
                        return $.Oda.MokUp.get({url : p_url, tabInput : p_tabInput });
                    }else{
                        p_tabSetting.functionRetour(response);
                        return;
                    }
                }
                
                //création du jeton pour la secu
                var session = $.Oda.Storage.get("ODA-SESSION");
                var key = null;
                if(session !== null){
                    key = session.key;
                } else{
                    key = p_tabInput.keyAuthODA;
                    delete p_tabInput.keyAuthODA;
                }

                p_tabInput.milis = $.Oda.Tooling.getMilise();
                p_tabInput.ctrl = "OK";
                p_tabInput.keyAuthODA = key;

                jsonAjaxParam.data = p_tabInput;

                //traitement determinant async ou pas
                var async = true;
                if($.Oda.Tooling.isUndefined(p_tabSetting.functionRetour)){
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
                        if(typeof p_retour === 'object'){
                            //object
                            var returns = p_retour;
                            
                            if((returns.strErreur == "key auth expiree.")||(returns.strErreur == "key auth invalid.")){
                                $.Oda.Notification.warning("Session invalid.");
                                $.Oda.Security.logout();
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
                        var msg = "$.Oda.callRest.success : " + er.message;
                        $.Oda.Log.error(msg);
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
                var msg = "$.Oda.callRest : " + er.message;
                $.Oda.Log.error(msg);
                return null;
            } 
        },
        
        /**
        * getParameter
        * #ex $.Oda.getParameter("contact_mail_administrateur");
        * @param {string} p_param_name
        * @returns { int|varchar }
        */
        getParameter : function(p_param_name) {
            try {
                var strResponse;

                var tabInput = { param_name : p_param_name };
                var json_retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/getParam.php", {}, tabInput);
                if(json_retour.strErreur === ""){
                    var type = json_retour.data.leParametre.param_type;
                    var value = json_retour.data.leParametre.param_type;
                    switch (type) {
                        case "int":
                            strResponse = parseInt(value);
                            break;
                        case "float":
                            strResponse = $.Oda.Tooling.arrondir(parseFloat(value),2);
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
               $.Oda.Log.error("$.Oda.getParameter : " + er.message);
               return null;
            }
        },
        
        /**
         * @name addStat
         * @test addStat('ADMI', 'page_home.html', 'checkAuth : ok');
         * @param {String} p_user
         * @param {String} p_page
         * @param {String} p_action
         */
        addStat : function(p_user, p_page, p_action) {
           try {
                var tabSetting = { functionRetour : function(){} };
                var tabInput = { 
                    user : p_user,
                    page : p_page,
                    action : p_action
                };
                var retour = $.Oda.callRest($.Oda.Context.rest+"API/phpsql/addStat.php", tabSetting, tabInput);
                return retour;
           } catch (er) {
               $.Oda.Log.error("$.Oda.addStat : " + er.message);
               return null;
           }
        },
        
        /**
        * sendMail
        * @ex $.Oda.sendMail({email_mails_dest:'fabrice.rosito@gmail.com',message_html:'HelloContent',sujet:'HelloSujet'});
        * @param {json} p_params
        * @returns {boolean}
        */
        sendMail : function(p_params) {
           try {
                var params_attempt = {
                    email_mails_dest : null,
                    message_html : null,
                    sujet : null
                 };

                var params = _checkParams(p_params, params_attempt);
                if(params === null){
                    return false;
                }

                var returns = $.Oda.callRest($.Oda.Context.rest+"API/scriptphp/send_mail.php", {type : 'POST'}, params);

                return returns;
           } catch (er) {
               $.Oda.Log.error("$.Oda.sendMail) :" + er.message);
               return null;
           }
        }
    };

    // Initialize
    _init();

})();