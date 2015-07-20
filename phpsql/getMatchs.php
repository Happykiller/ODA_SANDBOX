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
// phpsql/getMatchs.php?milis=123450&ctrl=ok&code_user=FRO
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "Select a.`id`, b.`nom_deck`, b.`classe` as 'ma_classe', a.`type`
    , a.`nom_adversaire`, a.`classe_adversaire`, TIMEDIFF(a.`date_end`, a.`date_start`) as 'duree', a.`vie`, a.`coin`, a.`type_adversaire`
    , a.`date_start`
    FROM `tab_matchs` a, `tab_deck_header` b
    WHERE 1=1
    AND a.`id_deck` = b.`id`
    AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
    AND a.`date_end` != '0000-00-00 00:00:00'
    ORDER BY `id` desc
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "matchs";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);