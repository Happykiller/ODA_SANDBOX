/* global er */
//# sourceURL=OdaApp.js
// Library of tools for the exemple
/**
 * @author FRO
 * @date 15/05/08
 */

var wowhead_tooltips = { "colorlinks": true, "iconizelinks": true, "renamelinks": true };

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
        $.Oda.Context.projectLabel = "ODA HOW";
        
        $.Oda.Router.addDependencies("wowhead", function(){
            $.getScript("http://wowjs.zamimg.com/widgets/power.js?1389797934",function(){
                $.Oda.Router.dependencieLoaded("wowhead");
            }); 
        });
        
        $.Oda.Router.addRoute("home", {
            "path" : "partial/home.html"
            , "title" : "oda-main.home-title"
            , "urls" : ["","home"]
            , "dependencies" : ["dataTables","wowhead"]
            , "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
        });
        
        $.Oda.Router.addRoute("saisir_paquet", {
            "path" : "partial/paquet-add.html"
            , "title" : "paquet-add.title"
            , "urls" : ["saisir_paquet"]
            , "dependencies" : ["dataTables","wowhead"]
            , "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
        });
        
        $.Oda.Router.startRooter();
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION
        
        , colorCard : {
            Commune : "#848484",
            Commune_inv : "#B0B0B0",
            Rare : "#2E2EFE",
            Rare_inv : "#5A5AFF",
            Épique : "#8904B1",
            Épique_inv : "#AA61C1",
            Légendaire : "#FF8000",
            Légendaire_inv : "#FFB163"
        }
        , colorClasse : {
            Death_Knight : "#C41F3B",
            Druide : "#FF7D0A",
            Chasseur : "#ABD473",
            Mage : "#69CCF0",
            Moine : "#00FF96",
            Paladin : "#F58CBA",
            Prêtre : "#FFFFFF",
            Voleur : "#FFF569",
            Chaman : "#0070DE",
            Démoniste : "#9482C9",
            Guerrier : "#C79C6E"
        }
        
        , chosenClass : ""

        , tab_sets : ['Tous', 'Expert' , 'La Malédiction de Naxxramas', 'Gobelins et Gnomes', 'Mont Rochenoire']
        
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
                $.Oda.log("ERROR($.functionsApp.exemple):" + er.message);
                return false;
            }
        }
    };

    // Initialize
    _init();

})();
