<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInputOpt = array("type" => "");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getRepartitionMeta.php?milis=123450&ctrl=ok
    
//--------------------------------------------------------------------------
$strFiltreType = "";

if($HOW_INTERFACE->inputs["type"] != ""){
    $strFiltreType = " AND a.`type` = '".$HOW_INTERFACE->inputs["type"]."' ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`classe_adversaire`, count(*) as 'nb'
    FROM `tab_matchs` a
    WHERE 1=1
    ".$strFiltreType."
    GROUP BY a.`classe_adversaire`
    ORDER BY count(*)
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultats";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "Select count(*) as 'nb'
    FROM `tab_matchs` a
    WHERE 1=1
    ".$strFiltreType."
";
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);