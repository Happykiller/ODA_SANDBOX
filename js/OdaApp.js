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
                    "urls" : ["","home"]
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
            "Qcm": {
                map: {},
                listCheckbox: [],
                current: "",
                /**
                 * @returns {$.Oda.App.Controller.Home}
                 */
                start: function () {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"api/rest/qcm/bpad/en", { functionRetour : function(response){
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
