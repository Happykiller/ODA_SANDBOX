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
$params->arrayInputOpt = array("filtre_nonClasse" => null,"filtre_classe" => null,"filtre_arene" => null);
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getClassementClasse.php?milis=123450&ctrl=ok&code_user=FRO&dateDebut=

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
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "filtreDate" => $filtreDate
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
$params->sql = "SELECT c.`classe`, c.`victoire`, d.`defaite`, IF(c.`victoire` = 0, 0, IF(d.`defaite` = 0, 99, c.`victoire` / d.`defaite`)) as 'ratio'
    FROM (
        SELECT count(*) as 'victoire', a.`classe` 
        FROM `temp_matchs` a
        WHERE 1=1 
        AND a.`reussite` = 1
        GROUP BY a.`classe`
    ) c,
    (
        SELECT count(*) as 'defaite', b.`classe` 
        FROM `temp_matchs_0` b
        WHERE 1=1 
        AND b.`reussite` = 0
        GROUP BY b.`classe`
    ) d
    WHERE 1=1
    AND c.`classe` = d.`classe`
    ORDER BY `ratio` desc
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "classement";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);