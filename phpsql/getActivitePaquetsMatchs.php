<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getActivitePaquetsMatchs.php

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "CREATE TEMPORARY TABLE `tmp_cost` AS
SELECT a.`date_saisie`, a.`code_user`, a.`nom`,  b.`mode`, a.`gold`, b.`qualite`, if(a.`gold` = 1, (SELECT c.`craft_gold` FROM `tab_craft` c WHERE c.`qualite` = b.`qualite`), (SELECT d.`craft_normal` FROM `tab_craft` d WHERE d.`qualite` = b.`qualite`)) as 'cost'
FROM `tab_paquet` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom` = b.`nom`
ORDER BY a.`date_saisie` desc
;

CREATE TEMPORARY TABLE `tmp_ouverture` AS
SELECT e.`date_saisie`, e.`code_user`, e.`mode`, SUM(e.`cost`) as 'cout'
FROM `tmp_cost` e
GROUP BY e.`date_saisie`, e.`code_user`, e.`mode`
HAVING COUNT(*) = 5
ORDER BY e.`date_saisie` desc
;

SET @rownum := 0;

CREATE TEMPORARY TABLE `tmp_general` AS
SELECT @rownum := @rownum + 1 AS 'rank', DATE_FORMAT(a.`date_saisie`,'%d/%m/%Y') as 'date', a.`code_user`, a.`mode`, SUM(a.`cout`) as 'cout'
FROM `tmp_ouverture` a
GROUP BY DATE_FORMAT(a.`date_saisie`,'%d/%m/%Y'), a.`code_user`, a.`mode`
ORDER BY a.`date_saisie` desc
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "SELECT a.*, IFNULL(SUM(b.`cost`),0) as  'cool'
FROM `tmp_general` a
LEFT OUTER JOIN `tmp_cost` b
ON 1=1 
AND a.`date` = DATE_FORMAT(b.`date_saisie`,'%d/%m/%Y') 
AND a.`code_user` = b.`code_user` 
AND b.`cost` >= 1600
GROUP BY a.`date`, a.`code_user`, a.`mode`, a.`cout`
ORDER BY a.`rank` asc
LIMIT 0,10
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "activitePaquets";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);