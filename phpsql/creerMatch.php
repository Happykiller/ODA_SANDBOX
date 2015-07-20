<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","id_deck","type","nom_adv","classe_adv","coin");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/creerMatch.php?milis=123450&ctrl=ok&id_deck=1&type=regular&nom_adv=messant&classe_adv=Chasseur&code_user=FRO&coin=1
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "INSERT INTO  `tab_matchs` (
        `id_deck` ,
        `type` ,
        `nom_adversaire` ,
        `classe_adversaire` ,
        `date_start` ,
        `code_user` ,
        `coin` 
    )
    VALUES (
        :id_deck, :type, :nom_adv, :classe_adv, NOW(), :code_user, :coin
    )
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
    , "type" => $HOW_INTERFACE->inputs["type"]
    , "nom_adv" => $HOW_INTERFACE->inputs["nom_adv"]
    , "classe_adv" => $HOW_INTERFACE->inputs["classe_adv"]
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "coin" => $HOW_INTERFACE->inputs["coin"]
];
$params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new stdClass();
$params->label = "resultatInsert";
$params->value = $retour->data;
$HOW_INTERFACE->addDataStr($params);