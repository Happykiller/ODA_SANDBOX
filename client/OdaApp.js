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
    ;
    
    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() {
        $.Oda.Router.addDependencies("angular", function(){
            console.log("Angular loading !"); 
            $.Oda.Router.dependencieLoaded("angular");
        });
        
        $.Oda.Router.addRoute("partial/chart", {
            "title" : "Chart"
            , "urls" : ["chart"]
            , "dependencies" : ["dataTables", "hightcharts"]
            , "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
        });
        
        $.Oda.Router.addRoute("partial/hello", {
            "title" : "Hello"
            , "urls" : ["hello", "truc/hello"]
            , "dependencies" : ["angular"]
            , "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
        });
        
        $.Oda.Router.startRooter();
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION
        
        /**
         * @name exemple
         * @desc Hello
         * @p_param{string} param
         * @returns {boolean}
         */
        , exemple: function(p_param) {
            try {
                return true;
            } catch (er) {
                $.Oda.log(0, "ERROR($.functionsApp.exemple):" + er.message);
                return false;
            }
        }
    };

    // Initialize
    _init();

})();
