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
// phpsql/getMetricsCoin.php?milis=123450&code_user=FRO

//--------------------------------------------------------------------------
//début des stats coin
$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT MIN(a.`id`) as 'fristCoin'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 1
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$idFirstCoin = $retour->data->fristCoin;

//--------------------------------------------------------------------------
//Stats J-7
$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'nbAvecPieceWeek'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 1
AND a.`date_start` > (NOW() - INTERVAL 7 DAY)
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "nbAvecPieceWeek";
$params->value = $retour->data->nbAvecPieceWeek;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'totalWeek'
FROM `tab_matchs` a
WHERE 1=1
AND a.`date_start` > (NOW() - INTERVAL 7 DAY)
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "totalWeek";
$params->value = $retour->data->totalWeek;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'vicAvecPieceWeek'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 1
AND a.`vie` > 0
AND a.`date_start` > (NOW() - INTERVAL 7 DAY)
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vicAvecPieceWeek";
$params->value = $retour->data->vicAvecPieceWeek;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'vicSansPieceWeek'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 0
AND a.`vie` > 0
AND a.`date_start` > (NOW() - INTERVAL 7 DAY)
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vicSansPieceWeek";
$params->value = $retour->data->vicSansPieceWeek;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
//Stats all
$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'nbAvecPieceAll'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 1
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "nbAvecPieceAll";
$params->value = $retour->data->nbAvecPieceAll;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'totalAll'
FROM `tab_matchs` a
WHERE 1=1
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "totalAll";
$params->value = $retour->data->totalAll;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'vicAvecPieceAll'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 1
AND a.`vie` > 0
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vicAvecPieceAll";
$params->value = $retour->data->vicAvecPieceAll;
$HOW_INTERFACE->addDataStr($params);

$params = new OdaPrepareReqSql(); 
$params->sql = "
SELECT COUNT(*) as 'vicSansPieceAll'
FROM `tab_matchs` a
WHERE 1=1
AND a.`coin` = 0
AND a.`vie` > 0
AND a.`id` > :idFirstCoin
AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "idFirstCoin" => $idFirstCoin
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vicSansPieceAll";
$params->value = $retour->data->vicSansPieceAll;
$HOW_INTERFACE->addDataStr($params);