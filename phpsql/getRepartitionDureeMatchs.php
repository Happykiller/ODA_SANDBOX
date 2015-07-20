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
// phpsql/getRepartitionDureeMatchs.php?milis=123450&code_user=FRO

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `datas` AS
SELECT c.`minutes`, IFNULL(d.`nb`,0) as 'nb'
FROM (
SELECT 1 as 'minutes' UNION SELECT 2 as 'minutes' UNION SELECT 3 as 'minutes' UNION SELECT 4 as 'minutes' UNION SELECT 5 as 'minutes' UNION SELECT 6 as 'minutes' UNION SELECT 7 as 'minutes' UNION SELECT 8 as 'minutes' UNION SELECT 9
UNION SELECT 10 as 'minutes' UNION SELECT 11 as 'minutes' UNION SELECT 12 as 'minutes' UNION SELECT 13 as 'minutes' UNION SELECT 14 as 'minutes' UNION SELECT 15 as 'minutes' UNION SELECT 16 as 'minutes' UNION SELECT 17 as 'minutes' UNION SELECT 18 as 'minutes' UNION SELECT 19
UNION SELECT 20 as 'minutes' UNION SELECT 21 as 'minutes' UNION SELECT 22 as 'minutes' UNION SELECT 23 as 'minutes' UNION SELECT 24 as 'minutes' UNION SELECT 25 as 'minutes' UNION SELECT 26 as 'minutes' UNION SELECT 27 as 'minutes' UNION SELECT 28 as 'minutes' UNION SELECT 29 
UNION SELECT 30 as 'minutes' UNION SELECT 31 as 'minutes' UNION SELECT 32 as 'minutes' UNION SELECT 33 as 'minutes' UNION SELECT 34 as 'minutes' UNION SELECT 35 as 'minutes' UNION SELECT 36 as 'minutes' UNION SELECT 37 as 'minutes' UNION SELECT 38 as 'minutes' UNION SELECT 39
UNION SELECT 40 as 'minutes' UNION SELECT 41 as 'minutes' UNION SELECT 42 as 'minutes' UNION SELECT 43 as 'minutes' UNION SELECT 44 as 'minutes' UNION SELECT 45 as 'minutes' UNION SELECT 46 as 'minutes' UNION SELECT 47 as 'minutes' UNION SELECT 48 as 'minutes' UNION SELECT 49
UNION SELECT 50 as 'minutes' UNION SELECT 51 as 'minutes' UNION SELECT 52 as 'minutes' UNION SELECT 53 as 'minutes' UNION SELECT 54 as 'minutes' UNION SELECT 55 as 'minutes' UNION SELECT 56 as 'minutes' UNION SELECT 57 as 'minutes' UNION SELECT 58 as 'minutes' UNION SELECT 59
) c
LEFT OUTER JOIN (
SELECT b.`minutes`, count(*) as 'nb'
FROM (
SELECT `date_start`
, `date_end`
, TIMEDIFF(a.`date_end`, a.`date_start`) as 'duree'
, ( MINUTE(TIMEDIFF(a.`date_end`, a.`date_start`)) + IF(SECOND(TIMEDIFF(a.`date_end`, a.`date_start`)) < 30, 0, 1)) as 'minutes'
FROM `tab_matchs` a
WHERE 1=1
AND a.`date_start` > (NOW() - INTERVAL 180 DAY)
AND a.`date_start` not like '%00:00:00'
AND a.`date_end` not like '%00:00:00'
AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
AND TIMEDIFF(a.`date_end`, a.`date_start`) < STR_TO_DATE('01:00:00','%H:%i:%s')
) b
GROUP BY b.`minutes`
) d
ON c.`minutes` = d.`minutes`
ORDER BY c.`minutes`
;

SELECT @maxMinute := MAX(a.`minutes`)
FROM `datas` a
WHERE 1=1
AND a.`nb` != 0
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "buildDatas";
$params->value = $retour->data;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT *
FROM `datas` a
WHERE 1=1
AND a.`minutes` <= @maxMinute
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);