<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","set");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/importSet.php?milis=123450&set=Expert&code_user=FRO

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
	AND a.`mode` = :set
	UNION ALL
	SELECT *
	FROM `tab_inventaire` b
	WHERE 1=1
	AND b.`mode` = :set
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
AND b.`mode` = :set
AND a.`code_user` = :code_user
ORDER BY a.`nom`
; 

CREATE TEMPORARY TABLE `tmp_ListCarteCollection_1` AS
SELECT *
FROM `tmp_ListCarteCollection_0`
;

CREATE TEMPORARY TABLE `tmp_ListCarteCollection_2` AS
SELECT a.`nom`, a.`rank`, (SELECT COUNT(*)+1 FROM `tmp_ListCarteCollection_1` b WHERE 1=1 AND a.`nom` = b.`nom` AND b.`rank` < a.`rank`) as 'subRank'
FROM `tmp_ListCarteCollection_0` a
;

INSERT INTO `tab_collection`(`code_user`, `nom`, `source`, `date_ajout`, `auteur_ajout`)
SELECT :code_user, a.`nom`, 'import', NOW(), :code_user
FROM `tmp_ListCarteInventaire_2` a
WHERE 1=1
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
    ,"set" => $HOW_INTERFACE->inputs["set"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->value = $retour->strStatut;
$HOW_INTERFACE->addDataStr($params);