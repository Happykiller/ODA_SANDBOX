<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getDeck.php?milis=123450&ctrl=ok&code_user=FRO
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT b.`nom`, b.`qualite`, b.`classe`, b.`cout`, c.`gold`, c.`nb`, b.`id_link`, c.`max_id_collec`
    FROM (	
        SELECT a.`nom`, a.`gold`, count(*) as 'nb', max(a.`id`) as 'max_id_collec'
        FROM `tab_decktemp` a
        WHERE 1=1
        AND a.`code_user` = :code_user
        GROUP BY a.`nom`, a.`gold`
    ) c, `tab_inventaire` b
    WHERE 1=1
    AND c.`nom` = b.`nom`
    AND b.`actif` = 1
    ORDER BY b.`nom`
";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "deck";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT COUNT(*) as 'nombre'
    FROM `tab_decktemp` a
    WHERE 1=1
    AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "nbInDeck";
$params->value = $retour->data->nombre;
$HOW_INTERFACE->addDataStr($params);