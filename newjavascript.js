/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function clearSlashes(path) {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
}

function getListParamsGet() {
    var result = [];
    var tableau = decodeURI(window.location.hash).split("?")[1].split("&");
    for (var indice in tableau){
        var tmp = tableau[indice].split("=");
        var elt = {
            "name" : tmp[0]
            , "value" : tmp[1]
        };
        result.push(elt);
    } 
    return result;
}

var request = {
    road : clearSlashes(decodeURI(window.location.hash)).substring(1).replace(/\?(.*)$/, '')
    , args : getListParamsGet()
};

window.location.hash = "#coucou";

console.log(request);

