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
        $.Oda.Event.addListener({name : "oda-fully-loaded", callback : function(e){
            $.Oda.App.startApp();
        }});
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION,
        
        colorCard : {
            Commune : "#848484",
            Commune_inv : "#B0B0B0",
            Rare : "#2E2EFE",
            Rare_inv : "#5A5AFF",
            Épique : "#8904B1",
            Épique_inv : "#AA61C1",
            Légendaire : "#FF8000",
            Légendaire_inv : "#FFB163"
        },
        colorClasse : {
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
        },
        
        chosenClass : "",

        tab_sets : ['Tous', 'Expert' , 'La Malédiction de Naxxramas', 'Gobelins et Gnomes', 'Mont Rochenoire'],

        /**
         * @param {Object} p_params
         * @param p_params.attr
         * @returns {$.Oda.App}
         */
        startApp: function (p_params) {
            try {
                $.Oda.Context.projectLabel = "ODA HOW";

                $.Oda.Router.addDependencies("wowhead", {
                    ordered : false,
                    "list" : [
                        { "elt" : "http://wowjs.zamimg.com/widgets/power.js", "type" : "script"}
                    ]
                });

                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "oda-main.home-title",
                    "urls" : ["","home"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
                });

                $.Oda.Router.addRoute("saisir_paquet", {
                    "path" : "partials/paquet-add.html",
                    "title" : "paquet-add.title",
                    "urls" : ["saisir_paquet"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
                });

                $.Oda.Router.addRoute("rapports_cartes", {
                    "path" : "partials/rapports_cartes.html",
                    "title" : "rapports-cartes.title",
                    "urls" : ["rapports_cartes"],
                    "dependencies" : ["dataTables","hightcharts","wowhead"],
                    "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
                });

                $.Oda.Router.addRoute("gerer_collection", {
                    "path" : "partials/gerer_collection.html",
                    "title" : "gerer-coll.title",
                    "urls" : ["gerer_collection"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
                });

                $.Oda.Router.addRoute("gerer_deck", {
                    "path" : "partials/gerer_deck.html",
                    "title" : "gerer-deck.title",
                    "urls" : ["gerer_deck"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":[$.Oda.Router.routeMiddleWares.support(),$.Oda.Router.routeMiddleWares.auth()]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        Controler : {
            GererDeck : {
                /**
                 * @param {Object} p_params
                 * @param p_params.attr
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                start: function (p_params) {
                    try {
                        $.Oda.App.Controler.GererDeck.loadListDeck();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.attr
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                loadListDeck: function (p_params) {
                    try {
                        $.Oda.Display.loading({elt : $("#listDeckContent")});

                        var tabSetting = { functionRetour : function(p_retour){
                            var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="display hover" id="table_listDeck" style="width: 100%"></table>';
                            $("#listDeckContent").html(strhtml);

                            var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(p_retour["data"]["listDeck"]["data"]);
                            var oTable = $('#table_listDeck').dataTable( {
                                "sPaginationType": "full_numbers",
                                "iDisplayLength": 20,
                                "aaData": objDataTable.data,
                                "aaSorting": [[5,'desc'],[2,'desc']],
                                "aoColumns": [
                                    { sTitle: "Nom"},
                                    { sTitle: "Classe"},
                                    { sTitle: "Quote"},
                                    { sTitle: "Type"},
                                    { sTitle: "Date", sClass: "dataTableColCenter", "sWidth": "175px"},
                                    { sTitle: "Actif", sClass: "dataTableColCenter"},
                                    { sTitle: "Action", sClass: "dataTableColCenter"}
                                ],
                                aoColumnDefs: [
                                    {//Nom
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<a href="javascript:$.Oda.App.Controler.ManageDeck.seeDeck({id:\''+row[0]+'\'});">'+row[1]+'</a>';
                                            return strHtml;
                                        },
                                        aTargets: [ 0 ]
                                    },
                                    {//Classe
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[2];
                                            return strHtml;
                                        },
                                        aTargets: [ 1 ]
                                    },
                                    {//Quote
                                        mRender: function ( data, type, row ) {
                                            var quote = parseInt(row[objDataTable.entete["quote"]]);
                                            if ( type == 'display' ) {
                                                return quote+"%";
                                            }
                                            return quote;
                                        },
                                        aTargets: [ 2 ]
                                    },
                                    {//Type
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[3];
                                            return strHtml;
                                        },
                                        aTargets: [ 3 ]
                                    },
                                    {//Date
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[4];
                                            return strHtml;
                                        },
                                        aTargets: [ 4 ]
                                    },
                                    {//Actif
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[5];
                                            return strHtml;
                                        },
                                        aTargets: [ 5 ]
                                    },
                                    {//Action
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<button class="btn btn-default btn-xs" onclick="$.Oda.App.Controler.ManageDeck.editDeck({id:\''+row[0]+'\'});" href="#">Ouvrir le deck</button>';
                                            return strHtml;
                                        },
                                        aTargets: [ 6 ]
                                    }
                                ],
                                "fnDrawCallback": function( oSettings ) {
                                    $('#table_listDeck')
                                        .removeClass( 'display' )
                                        .addClass('table table-striped table-bordered');
                                }
                            });
                        }};
                        var tabInput = { code_user : $.Oda.Session.code_user, option_actif : "", type : "" };
                        $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getListDeck.php", tabSetting, tabInput);

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.loadListDeck : " + er.message);
                        return null;
                    }
                },
            }
        }
    };

    // Initialize
    _init();

})();
