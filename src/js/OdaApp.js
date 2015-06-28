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
         * @param {object} p_params
         * @param p_params.id
         * @returns {$.Oda.App}
         */
        example: function (p_params) {
            try {
                return true;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.example : " + er.message);
                return null;
            }
        },

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
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("saisir_paquet", {
                    "path" : "partials/paquet-add.html",
                    "title" : "paquet-add.title",
                    "urls" : ["saisir_paquet"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("rapports_cartes", {
                    "path" : "partials/rapports_cartes.html",
                    "title" : "rapports-cartes.title",
                    "urls" : ["rapports_cartes"],
                    "dependencies" : ["dataTables","hightcharts","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("gerer_collection", {
                    "path" : "partials/gerer_collection.html",
                    "title" : "gerer-coll.title",
                    "urls" : ["gerer_collection"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("gerer_deck", {
                    "path" : "partials/gerer_deck.html",
                    "title" : "gerer-deck.title",
                    "urls" : ["gerer_deck"],
                    "dependencies" : ["dataTables", "hightcharts"],
                    "middleWares":["support","auth"]
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
                                            var strHtml = '<a href="javascript:$.Oda.App.Controler.GererDeck.seeDeck({id:\''+row[0]+'\'});">'+row[1]+'</a>';
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
                                            if ( type === 'display' ) {
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
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                seeDeck: function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getHeaderDeck.php", {functionRetour : function(data){

                            var strHtmlDetails = $.Oda.Display.TemplateHtml.create({
                                template : "deck-details"
                                , scope : {
                                    deckActif : data.data.resultat.actif
                                    , deckName : data.data.resultat.nom_deck
                                    , deckType : data.data.resultat.type
                                    , deckCmt : data.data.resultat.commentaire
                                }
                            });

                            var strHtmlFooter = '';
                            strHtmlFooter += '<button type="button" onclick="$.Oda.App.Controler.GererDeck.recHeaderDeck({deckId : '+p_params.id+', oldName : \''+data.data.resultat.nom_deck+'\'});" class="btn btn-primary" oda-submit="bt_valider"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-submit')+'</button>';
                            strHtmlFooter += '<a href="javascript:$.Oda.Display.Popup.close();" class="btn btn-default" id="bt_annuler_user"><span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-cancel')+'</a>';

                            $.Oda.Display.Popup.open({size : "lg", label : '<span oda-label="gerer-deck.detailsDeck"></span> : '+data.data.resultat.nom_deck, details : strHtmlDetails, footer : strHtmlFooter, callback : function(data){
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getDeckDetails.php", {functionRetour : function(data){
                                    var datas = $.Oda.App.Controler.GererDeck.buildDatasForGraph(data["data"]);

                                    $('#div_graphCout').highcharts({
                                        chart: {
                                            type: 'column'
                                        },
                                        title: {
                                            text: 'La curve'
                                        },
                                        tooltip: {
                                            enabled : false
                                        },
                                        exporting: {
                                            enabled: false
                                        },
                                        xAxis: {
                                            categories: datas.categories
                                        },
                                        yAxis: {
                                            gridLineColor: 'transparent',
                                            title: {
                                                enabled: false
                                            },
                                            labels: {
                                                enabled: false
                                            }
                                        },
                                        plotOptions : {
                                            column : {
                                                dataLabels : {
                                                    enabled : true,
                                                    formatter : function() {
                                                        if(this.x == "Total"){
                                                            return this.y*10;
                                                        }else{
                                                            return this.y;
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        series: datas.series
                                    });

                                    $('#div_graphRepart').highcharts({
                                        chart: {
                                            plotBackgroundColor: null,
                                            plotBorderWidth: null,
                                            plotShadow: false
                                        },
                                        title: {
                                            text: 'Type de carte'
                                        },
                                        tooltip: {
                                            pointFormat: 'Nombre : {point.y}: <br> Pourcentage : {point.percentage:.1f}%'
                                        },
                                        plotOptions: {
                                            pie: {
                                                allowPointSelect: true,
                                                cursor: 'pointer',
                                                dataLabels: {
                                                    enabled: true,
                                                    format: '{point.y} {point.name}(s)<br>{point.percentage:.1f}%',
                                                    style: {
                                                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                                    }
                                                }
                                            }
                                        },
                                        series: [{
                                            type: 'pie',
                                            name: 'Type',
                                            data: datas.dataSeries
                                        }]
                                    });
                                }}, {id_deck : p_params.id, code_user : $.Oda.Session.code_user});
                            }});

                            $.Oda.Scope.refresh = function(){
                                if(($("#deckName").data("isOk")) && ($("#deckType").data("isOk"))){
                                    $("#bt_valider").removeClass("disabled");
                                }else{
                                    $("#bt_valider").addClass("disabled");
                                }
                            };
                        }}, { id_deck : p_params.id });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.seeDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @param p_params.oldName
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                recHeaderDeck: function (p_params) {
                    try {
                        var input_actif = $('#deckActif').val();
                        var input_nom = $('#deckName').val();
                        var input_type = $('#deckType').val();
                        var input_cmt = $('#deckCmt').val();

                        if(input_nom !== ""){
                            if(p_params.oldName !== input_nom){
                                var tabInput = { code_user : $.Oda.Session.code_user, nomDeck : input_nom };
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/checkNomDeck.php", { context : {idDeck : p_params.deckId}, functionRetour : function(json_retour){
                                    if(json_retour["data"]["resultat"]["exists"] !== "0"){
                                        $.Oda.Display.Notification.warning( "Nom du deck déjà existant.");
                                    }else{
                                        var tabInput = {
                                            id_deck : json_retour.context.idDeck,
                                            input_actif : (input_actif === "on")?1:0,
                                            input_nom : input_nom,
                                            input_type : input_type,
                                            input_cmt : input_cmt
                                        };
                                        var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/setHeaderDeck.php", {functionRetour : function(json_retour){
                                            $.Oda.App.Controler.GererDeck.loadListDeck();
                                            $.Oda.Display.Popup.close();
                                            $.Oda.Display.Notification.success( "Mise &agrave; jour r&eacute;ussi.");
                                        }}, tabInput);
                                    }
                                }}, tabInput);
                            }else{
                                var tabInput = {
                                    id_deck : p_params.deckId,
                                    input_actif : (input_actif === "on")?1:0,
                                    input_nom : '',
                                    input_type : input_type,
                                    input_cmt : input_cmt
                                };
                                var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/setHeaderDeck.php", {functionRetour : function(json_retour){
                                    $.Oda.App.Controler.GererDeck.loadListDeck();
                                    $.Oda.Display.Popup.close();
                                    $.Oda.Display.Notification.success( "Mise &agrave; jour r&eacute;ussi.");
                                }}, tabInput);
                            }
                        }else{
                            $.Oda.Display.Notification.warning( "Nom du deck vide.");
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.recHeaderDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name buildDatasForGraph
                 * @param {type} p_datas
                 * @returns {buildDatasForGraph.obj}
                 */
                 buildDatasForGraph : function(p_datas){
                    try {
                        var obj = {categories : ["0", "1", "2", "3", "4", "5", "6", "7+", "Total"], series : [] };

                        var data = { name : "Coût", color: '#0040FF'};
                        var array = [];
                        for (var indice in p_datas["coutRepartition"]["data"]) {
                            array[array.length] = parseInt(p_datas["coutRepartition"]["data"][indice]["nb"]);
                        }
                        array[array.length] = parseInt(p_datas["coutSum"])/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var data = { name : "Vie", color: '#BA1F1F'};
                        var array = [];
                        for (var indice in p_datas["vieRepartition"]["data"]) {
                            array[array.length] = parseInt(p_datas["vieRepartition"]["data"][indice]["nb"]);
                        }
                        array[array.length] = parseInt(p_datas["vieSum"])/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var data = { name : "Attaque", color: '#D8E524'};
                        var array = [];
                        for (var indice in p_datas["attaqueRepartition"]["data"]) {
                            array[array.length] = parseInt(p_datas["attaqueRepartition"]["data"][indice]["nb"]);
                        }
                        array[array.length] = parseInt(p_datas["attaqueSum"])/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var array = [];
                        for (var indice in p_datas["reparType"]["data"]) {
                            var data = { name : "", y : 0};
                            data.name = p_datas["reparType"]["data"][indice]["type"];
                            data.y = parseInt(p_datas["reparType"]["data"][indice]["nb"]);
                            array[array.length] = data;
                        }
                        obj.dataSeries = array;

                        return obj;
                    } catch (er) {
                        $.Oda.Log.error("buildSimpleSeriesForSimpleColumn :" + er.message);
                    }
                }
            }
        }
    };

    // Initialize
    _init();

})();
