<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","nomDeck");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/checkNomDeck.php?milis=123450&code_user=FRO&nomDeck=Paladin
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "SELECT COUNT(*) as 'exists'
    FROM `tab_deck_header` a
    WHERE 1=1
    AND a.`code_user` = :code_user
    AND a.`nom_deck` = :deck
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "deck" => $HOW_INTERFACE->inputs["nomDeck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);