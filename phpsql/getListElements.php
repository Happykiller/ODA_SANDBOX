<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("table","col");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getListElements.php?milis=123450&ctrl=ok&table=tab_matchs&col=type
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT DISTINCT `".$HOW_INTERFACE->inputs["col"]."` as 'element'
    FROM `".$HOW_INTERFACE->inputs["table"]."` a
    WHERE 1=1
    AND `".$HOW_INTERFACE->inputs["col"]."` != ''
    ORDER BY `".$HOW_INTERFACE->inputs["col"]."`
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "liste";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);