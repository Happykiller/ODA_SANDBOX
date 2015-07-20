<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user", "date", "mode");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getCoolCards.php?code_user=FRO&date=02/03/2015&mode=Expert

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `tmp_inv` AS
SELECT a.`date_saisie`, a.`code_user`, a.`nom`,  b.`mode`, b.`id_link`, a.`gold`, b.`qualite`, b.`cout`, b.`type`, if(a.`gold` = 1, (SELECT c.`craft_gold` FROM `how-tab_craft` c WHERE c.`qualite` = b.`qualite`), (SELECT d.`craft_normal` FROM `how-tab_craft` d WHERE d.`qualite` = b.`qualite`)) as 'cost'
FROM `how-tab_paquet` a, `how-tab_inventaire` b
WHERE 1=1
AND a.`nom` = b.`nom`
AND a.`code_user` = :code_user
AND DATE_FORMAT(a.`date_saisie`,'%d/%m/%Y') = :date
AND b.`mode` = :mode
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"],
    "date" => $HOW_INTERFACE->inputs["date"],
    "mode" => $HOW_INTERFACE->inputs["mode"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat1";
$params->value = $retour->data;
$HOW_INTERFACE->addDataStr($params); 

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT *
FROM `tmp_inv` a
WHERE 1=1
AND a.`cost` >= 1600
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);