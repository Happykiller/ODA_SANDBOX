<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","option_actif","type");
$params->arrayInputOpt = array("typeMatch" => null);
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getListDeck.php?milis=123450&ctrl=ok&code_user=FRO&option_actif=1&type=regular

//--------------------------------------------------------------------------
    
$strFiltreActif = "";
if($HOW_INTERFACE->inputs["option_actif"] != ""){
    $strFiltreActif = " AND a.`actif` = ".$HOW_INTERFACE->inputs["option_actif"]." ";
}

$strFiltreType= "";
if($HOW_INTERFACE->inputs["type"] != ""){
    $strFiltreType = " AND a.`type` = '".$HOW_INTERFACE->inputs["type"]."' ";
}

$strFiltreTypeMatch= "";
if($HOW_INTERFACE->inputs["typeMatch"] != null){
    $strFiltreTypeMatch = " AND a.`type` = '".$HOW_INTERFACE->inputs["typeMatch"]."' ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SET @rownum := 0;
SET @id_deck:= 0;	
CREATE TEMPORARY TABLE `tmp_orderMatchs` AS
SELECT @rownum := @rownum + 1 AS rank, if(@id_deck = a.`id_deck`, 1, @rownum := 0) as qif, @id_deck:=a.`id_deck` as vardeck, a.* 
FROM `tab_matchs` a
WHERE 1=1
".$strFiltreTypeMatch."
ORDER BY a.`id_deck` asc, a.`date_start` desc
;

CREATE TEMPORARY TABLE `tmp_orderMatchs2` AS
SELECT * FROM `tmp_orderMatchs`
;
";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatCreateTempTable";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT a.`id`, a.`nom_deck`, a.`classe`, a.`type`, a.`creation_date` as 'date', a.`actif`
, ROUND(((SELECT COUNT(*) FROM `tmp_orderMatchs` b WHERE b.`id_deck` = a.`id` AND b.`vie` != 0 AND b.`rank` <= 10) / (SELECT COUNT(*) FROM `tmp_orderMatchs2` b WHERE b.`id_deck` = a.`id` AND b.`rank` <= 10))*100) as 'quote'
FROM `tab_deck_header` a
WHERE 1=1
AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
".$strFiltreActif."
".$strFiltreType."
ORDER BY `quote` desc
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "listDeck";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);