<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","id_card","gold");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/addPaquet.php?milis=123450&ctrl=ok&code_user=FRO&id_card=261&gold=1
    
//--------------------------------------------------------------------------
$objDate = new \Oda\SimpleObject\OdaDate();
$date = $objDate->getDateTimeWithMili();

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "INSERT INTO  `tab_paquettemp`
    (`code_user`, `nom`, `gold`, `date_ajout`, `auteur_ajout`) 
    SELECT :code_user, a.`nom`, :gold, :date, :code_user
    FROM `tab_inventaire` a
    WHERE 1=1
    AND a.`id` = :id_card
    AND a.`actif` = 1
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "id_card" => $HOW_INTERFACE->inputs["id_card"]
    , "gold" => $HOW_INTERFACE->inputs["gold"]
    , "date" => $date
];
$params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatInsert";
$params->value = $retour->data;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "Select ".$HOW_INTERFACE->inputs["id_card"]." as 'id_card', IF(COUNT(*) >= 5,'true','false') as 'full'
    from `tab_paquettemp` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "retour";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);