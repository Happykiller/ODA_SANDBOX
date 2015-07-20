<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_deck","code_user");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/removeDeck.php?milis=123450&ctrl=ok&id_coll=1&code_user=FRO&id_card=261&type=regular
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "DELETE FROM `tab_decktemp`
    WHERE 1=1
    AND `id` = ".$HOW_INTERFACE->inputs["id_deck"].";
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);