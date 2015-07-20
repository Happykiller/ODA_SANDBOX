<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","set","classe","qualite");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getMissedCards.php?milis=123450&set=Expert&code_user=FRO&classe=Voleur&qualite=Légendaire

//--------------------------------------------------------------------------
$fitreSetA = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSetA = " AND a.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSetA = " AND a.`mode` not in ('Basique','Promotion','Récompense') ";
}

$fitreSetB = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSetB = " AND b.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSetB = " AND b.`mode` not in ('Basique','Promotion','Récompense') ";
}

//--------------------------------------------------------------------------
//Clacule des cartes à importer.
$params = new OdaPrepareReqSql(); 
$params->sql = "SET @rownum := 0; 
CREATE TEMPORARY TABLE `tmp_ListCarteInventaire_0` AS
SELECT c.`nom`, @rownum := @rownum + 1 AS 'rank'
FROM (
    SELECT *
    FROM `tab_inventaire` a
    WHERE 1=1
    ".$fitreSetA."
    AND a.`qualite` = :qualite
    AND a.`classe` = :classe
    UNION ALL
    SELECT *
    FROM `tab_inventaire` b
    WHERE 1=1
    ".$fitreSetB."
    AND b.`qualite` = :qualite
    AND b.`classe` = :classe
    AND b.`qualite` != 'Légendaire'
) c
WHERE 1=1
ORDER BY c.`nom`
;

CREATE TEMPORARY TABLE `tmp_ListCarteInventaire_1` AS
SELECT *
FROM `tmp_ListCarteInventaire_0`
;

CREATE TEMPORARY TABLE `tmp_ListCarteInventaire_2` AS
SELECT a.`nom`, a.`rank`, (SELECT COUNT(*)+1 FROM `tmp_ListCarteInventaire_1` b WHERE 1=1 AND a.`nom` = b.`nom` AND b.`rank` < a.`rank`) as 'subRank'
FROM `tmp_ListCarteInventaire_0` a
;

SET @rownum := 0; 
CREATE TEMPORARY TABLE `tmp_ListCarteCollection_0` AS
SELECT a.`nom`, @rownum := @rownum + 1 AS 'rank'
FROM `tab_collection` a, `tab_inventaire` b
WHERE 1=1
AND a.`date_dez` = '0000-00-00 00:00:00'
AND a.`nom` = b.`nom`
AND a.`code_user` = :code_user
".$fitreSetB."
AND b.`qualite` = :qualite
AND b.`classe` = :classe
ORDER BY a.`nom`
; 

CREATE TEMPORARY TABLE `tmp_ListCarteCollection_1` AS
SELECT *
FROM `tmp_ListCarteCollection_0`
;

CREATE TEMPORARY TABLE `tmp_ListCarteCollection_2` AS
SELECT a.`nom`, a.`rank`, (SELECT COUNT(*)+1 FROM `tmp_ListCarteCollection_1` b WHERE 1=1 AND a.`nom` = b.`nom` AND b.`rank` < a.`rank`) as 'subRank'
FROM `tmp_ListCarteCollection_0` a
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    ,"qualite" => $HOW_INTERFACE->inputs["qualite"]
    ,"classe" => $HOW_INTERFACE->inputs["classe"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`nom`, b.`qualite`, b.`id_link`, b.`cout`, b.`type`
FROM `tmp_ListCarteInventaire_2` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom` = b.`nom`
".$fitreSetB."
AND NOT EXISTS(
    SELECT 1 
    FROM `tmp_ListCarteCollection_2` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`subRank` = b.`subRank`
)
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    ,"qualite" => $HOW_INTERFACE->inputs["qualite"]
    ,"classe" => $HOW_INTERFACE->inputs["classe"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);