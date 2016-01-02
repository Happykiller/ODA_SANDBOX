/* global er */
//# sourceURL=OdaApp.js
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

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION,

        /**
         * @returns {$.Oda.App}
         */
        startApp: function () {
            try {
                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "oda-main.home-title",
                    "urls" : ["","home"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("qcm-manage", {
                    "path" : "partials/qcm-manage.html",
                    "title" : "qcm-manage.title",
                    "urls" : ["qcm-manage"],
                    "middleWares":["support","auth"],
                    "dependencies" : ["dataTables"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        /**
         * @returns {$.Oda.App}
         */
        startQcm: function () {
            try {
                $.Oda.Router.addRoute("home", {
                    "path" : "partials/qcm.html",
                    "title" : "qcm.title",
                    "urls" : ["","home"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        "Controller" : {
            "Home": {
                /**
                 * @returns {$.Oda.App.Controller.Home}
                 */
                start: function () {
                    try {
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Home.start : " + er.message);
                        return null;
                    }
                }
            },
            "ManageQcm": {
                /**
                 * @returns {$.Oda.App.Controller.ManageQcm}
                 */
                start: function () {
                    try {
                        $.Oda.App.Controller.ManageQcm.displayQcm();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ManageQcm.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.ManageQcm}
                 */
                displayQcm: function () {
                    try {
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/qcm/", { functionRetour : function(response) {
                            var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(response.data);
                            var strhtml = '<table style="width: 100%" cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered hover" id="tableQcm"></table>';
                            $('#divTabQcm').html(strhtml);

                            var oTable = $('#tableQcm').DataTable({
                                "pageLength": 25,
                                "sPaginationType": "full_numbers",
                                "aaData": objDataTable.data,
                                "aaSorting": [[0, 'desc']],
                                "aoColumns": [
                                    {"sTitle": "Id", "sClass": "dataTableColCenter"},
                                    {"sTitle": "Name", "sClass": "Left"},
                                    {"sTitle": "Lang", "sClass": "Left"},
                                    {"sTitle": "Link", "sClass": "Left"}
                                ],
                                "aoColumnDefs": [
                                    {
                                        "mRender": function (data, type, row) {
                                            return row[objDataTable.entete["id"]];
                                        },
                                        "aTargets": [0]
                                    },
                                    {
                                        "mRender": function (data, type, row) {
                                            return row[objDataTable.entete["name"]];
                                        },
                                        "aTargets": [1]
                                    },
                                    {
                                        "mRender": function (data, type, row) {
                                            return $.Oda.I8n.get("qcm-manage",row[objDataTable.entete["lang"]]);
                                        },
                                        "aTargets": [2]
                                    },
                                    {
                                        "mRender": function (data, type, row) {
                                            var url = $.Oda.Context.host+"qcm.html?id="+row[objDataTable.entete["id"]]+"&name="+row[objDataTable.entete["name"]]+"&lang="+row[objDataTable.entete["lang"]];
                                            return url;
                                        },
                                        "aTargets": [3]
                                    }
                                ]
                            });
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ManageQcm.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.ManageQcm}
                 */
                formQcm: function () {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "formQcm"
                            , scope : {}
                        });

                        $.Oda.Display.Popup.open({
                            "name" : "createQcm",
                            "label" : $.Oda.I8n.get('qcm-manage','createQcm'),
                            "details" : strHtml,
                            "footer" : '<button type="button" oda-label="oda-main.bt-submit" oda-submit="submit" onclick="$.Oda.App.Controller.ManageQcm.submitQcm();" class="btn btn-primary disabled" disabled>Submit</button>',
                            "callback" : function(){
                                $.Oda.Scope.Gardian.add({
                                    id : "createQcm",
                                    listElt : ["name", "lang"],
                                    function : function(e){
                                        if( ($("#name").data("isOk")) && ($("#lang").data("isOk")) ){
                                            $("#submit").removeClass("disabled");
                                            $("#submit").removeAttr("disabled");
                                        }else{
                                            $("#submit").addClass("disabled");
                                            $("#submit").attr("disabled", true);
                                        }
                                    }
                                });
                            }
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ManageQcm.formQcm : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.ManageQcm}
                 */
                submitQcm: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/qcm/", {type:'POST',functionRetour : function(response){
                            $.Oda.Display.Popup.close({name:"createQcm"});
                        }},{
                            "name":$('#name').val(),
                            "lang":$('#lang').val(),
                            "userId": $.Oda.Session.id
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.ManageQcm.formQcm : " + er.message);
                        return null;
                    }
                },
            },
            "Qcm": {
                map: {},
                listCheckbox: [],
                current: "",
                steps: 0,
                currentStep: 0,
                /**
                 * @returns {$.Oda.App.Controller.Home}
                 */
                start: function () {
                    try {
                        var id = $.Oda.Router.current.args["id"];
                        var name = $.Oda.Router.current.args["name"];
                        var lang = $.Oda.Router.current.args["lang"];
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/qcm/"+name+"/"+lang, { functionRetour : function(response){
                            var iteratorPart = 0;
                            var iteratorQuestion = 0;
                            for(var indice in response.data){
                                iteratorPart++;
                                $.Oda.App.Controller.Qcm.map["qcmId_"+iteratorPart] = false;
                                var strHtml = $.Oda.Display.TemplateHtml.create({
                                    template : "qcmTitle"
                                    , scope : {
                                        "id" : "qcmId_"+iteratorPart,
                                        "title" : indice
                                    }
                                });
                                $('#qcm').append(strHtml);
                                $.Oda.App.Controller.Qcm.steps++;

                                var qcmPart = response.data[indice];
                                for(var questionIndice in qcmPart){
                                    for(var questionTitle in qcmPart[questionIndice]){
                                        var question = qcmPart[questionIndice][questionTitle];
                                        iteratorQuestion++;
                                        var strResponses = "";
                                        var iteratorResponse = 0;
                                        for(var responseIndice in question){
                                            for(var responseTitle in question[responseIndice]){
                                                var responseBody = question[responseIndice][responseTitle];
                                                iteratorResponse++;
                                                var strOptional = "";
                                                if(responseBody){
                                                    strOptional = "required"
                                                }
                                                strResponses += $.Oda.Display.TemplateHtml.create({
                                                    template : "qcmResponse"
                                                    , scope : {
                                                        "id": "qcmId_"+iteratorPart+"_"+iteratorQuestion+"_"+iteratorResponse,
                                                        "title" : responseTitle,
                                                        "responseBody" : strOptional
                                                    }
                                                });
                                            }
                                        }
                                        $.Oda.App.Controller.Qcm.map["qcmId_"+iteratorPart+"_"+iteratorQuestion] = false;
                                        var strQuestions =  $.Oda.Display.TemplateHtml.create({
                                            template : "qcmQuestion"
                                            , scope : {
                                                "id": "qcmId_"+iteratorPart+"_"+iteratorQuestion,
                                                "titleQcm" : indice,
                                                "title" : questionTitle,
                                                "responses" : strResponses
                                            }
                                        });
                                        $('#qcm').append(strQuestions);
                                        $.Oda.App.Controller.Qcm.steps++;
                                    }
                                }
                            }
                            $.Oda.App.Controller.Qcm.moveNext();
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Qcm.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Qcm}
                 */
                moveNext: function () {
                    try {
                        $.Oda.App.Controller.Qcm.currentStep++;
                        $('#progressBar').width($.Oda.App.Controller.Qcm.currentStep/$.Oda.App.Controller.Qcm.steps*100);
                        for(var key in $.Oda.App.Controller.Qcm.map){
                            if($.Oda.App.Controller.Qcm.map[key]){
                                $("#"+key).hide();
                            }
                        }

                        for(var key in $.Oda.App.Controller.Qcm.map){
                            if(!$.Oda.App.Controller.Qcm.map[key]){
                                $.Oda.App.Controller.Qcm.map[key] = true;
                                $.Oda.Scope.Gardian.remove({id:"qcm"});
                                $("#"+key).fadeIn("slow");
                                $.Oda.App.Controller.Qcm.current = key;
                                break;
                            }
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Qcm.moveNext : " + er.message);
                        return null;
                    }
                },
                /**
                 * @returns {$.Oda.App.Controller.Qcm}
                 */
                validate: function () {
                    try {
                        $.Oda.Display.Notification.removeAll();
                        var list = $( "[id^='"+$.Oda.App.Controller.Qcm.current+"_']");
                        $.Oda.App.Controller.Qcm.listCheckbox = [];
                        for(var indice in list){
                            var elt = list[indice];
                            if(elt.id !== undefined){
                                $.Oda.App.Controller.Qcm.listCheckbox.push(elt.id);
                            }
                        }

                        var gardian = 0;
                        for(var indice in $.Oda.App.Controller.Qcm.listCheckbox){
                            var elt = $("#"+$.Oda.App.Controller.Qcm.listCheckbox[indice]);
                            if(!( (elt.prop("checked") && (elt.data('attempt') === "required") ) || (!elt.prop("checked") && (elt.data('attempt') === "")) )){
                                gardian++;
                            }
                        }

                        if( gardian === 0 ){
                            for(var indice in $.Oda.App.Controller.Qcm.listCheckbox){
                                var elt = $("#"+$.Oda.App.Controller.Qcm.listCheckbox[indice]);
                                elt.attr("disabled", true);
                            }
                            $.Oda.Display.Notification.success($.Oda.I8n.get("qcm","SuccessMessage"));
                            var btValidte = $("#validate-"+$.Oda.App.Controller.Qcm.current);
                            btValidte.hide();
                            var btSubmit = $("#submit-"+$.Oda.App.Controller.Qcm.current);
                            btSubmit.fadeIn();
                        }else{
                            $.Oda.Display.Notification.error(gardian + $.Oda.I8n.get("qcm","ErrorMessage"));
                        }

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controller.Qcm.validate : " + er.message);
                        return null;
                    }
                },
            }
        }
    };

})();
