<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_match","vie","code_user","type_adversaire","my_rang","adv_rang");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/finirMatch.php?milis=123450&ctrl=ok&id_match=1&code_user=FRO&vie=1&type_adversaire=agro&my_rang=25&adv_rang=1
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "UPDATE `tab_matchs`
    SET `date_end` = NOW()
    , `vie` = :vie
    , `type_adversaire` = :type_adversaire
    , `my_rang` = :my_rang
    , `adv_rang` = :adv_rang
    WHERE 1=1
    AND `id` = :id_match
;";
$params->bindsValue = [
    "vie" => $HOW_INTERFACE->inputs["vie"]
    , "type_adversaire" => $HOW_INTERFACE->inputs["type_adversaire"]
    , "my_rang" => $HOW_INTERFACE->inputs["my_rang"]
    , "adv_rang" => $HOW_INTERFACE->inputs["adv_rang"]
    , "id_match" => $HOW_INTERFACE->inputs["id_match"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);