<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","dateDebut");
$params->arrayInputOpt = array("filtre_nonClasse" => false,"filtre_classe" => false,"filtre_arene" => false);
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getEvolRatioMatchs.php?milis=123450&ctrl=ok&code_user=FRO&dateDebut=2013-05-20

//--------------------------------------------------------------------------
$filtreDate = "2013-01-01";
if($HOW_INTERFACE->inputs["dateDebut"] != ""){
    $filtreDate = $HOW_INTERFACE->inputs["dateDebut"];
}

$filtreTypeMatch = " 'a' ";
    if($HOW_INTERFACE->inputs["filtre_nonClasse"] == "true"){
        $filtreTypeMatch .= " ,'Non classé' ";
    }
    if($HOW_INTERFACE->inputs["filtre_classe"] == "true"){
        $filtreTypeMatch .= " ,'Classé' ";
    }
    if($HOW_INTERFACE->inputs["filtre_arene"] == "true"){
        $filtreTypeMatch .= " ,'Arene' ";
    }
    if($filtreTypeMatch == " 'a' "){
        $filtreTypeMatch = "";
    }else{
        $filtreTypeMatch = "AND a.`type` in (".$filtreTypeMatch.") ";
    }

//--------------------------------------------------------------------------
//Pour test on crée une table temporaire
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `temp_matchs` AS
    SELECT a.*, b.`nom_deck`, b.`classe`,
    IF(a.`vie` != 0, 1, 0) as 'reussite'
    FROM `tab_matchs` a, `tab_deck_header` b
    WHERE 1=1
    AND a.`id_deck` = b.`id`
    AND a.`code_user` = :code_user 
    AND a.`date_end` > :filtreDate
    ".$filtreTypeMatch."
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"],
    "filtreDate" => $filtreDate
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
//Pour test on crée une table temporaire
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `temp_matchs_0` AS
    SELECT a.* FROM `temp_matchs` a
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT c.`date`, ROUND((d.`win` / c.`total` *100),2)*d.`win` as 'ratio', d.`win`, c.`total`
    FROM (
        SELECT DATE_FORMAT(a.`date_end`, '%Y-%m-%d') as 'date', count(*) as 'total'
        FROM `temp_matchs` a
        WHERE 1=1
        AND a.`date_end` != '0000-00-00 00:00:00'
        GROUP BY DATE_FORMAT(a.`date_end`, '%Y-%m-%d')
    ) c, 
    (
        SELECT DATE_FORMAT(b.`date_end`, '%Y-%m-%d') as 'date', count(*) as 'win'
        FROM `temp_matchs_0` b
        WHERE 1=1
        AND b.`reussite` = 1
        AND b.`date_end` != '0000-00-00 00:00:00'
        GROUP BY DATE_FORMAT(b.`date_end`, '%Y-%m-%d')
    ) d
    WHERE 1=1
    AND c.`date` = d.`date`
    ORDER BY c.`date` asc
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "evolRatioMatchs";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);