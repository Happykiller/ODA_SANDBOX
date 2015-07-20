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
$params->arrayInputOpt = array("set" => 'Tous');
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getMetricsDropRate.php?milis=123450&code_user=FRO

//--------------------------------------------------------------------------
$fitreSet = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSet = " AND b.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSet = " AND b.`mode` not in ('Basique','Promotion','Récompense') ";
}  
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT ROUND(((SUM(a.`gold`) / COUNT(*))*100),2) as 'dropRate_gold' 
    FROM `tab_paquet` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`code_user` = :code_user
    ".$fitreSet."
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT d.`qualite`, IFNULL(e.`nb`, 0) as 'nb', IFNULL(e.`nbDez`, 0) as 'nbDez', IFNULL(e.`percDez`, 0) as 'percDez'
    FROM (
        SELECT DISTINCT c.`qualite`
        FROM `tab_inventaire` c
    ) d
    LEFT OUTER JOIN (
        SELECT b.`qualite`, COUNT(`dez`) as 'nb' , SUM(`dez`) as 'nbDez', ROUND(SUM(`dez`)/COUNT(`dez`)*100,2) as 'percDez'
        FROM `tab_paquet` a, `tab_inventaire` b 
        WHERE 1=1 
        AND a.`nom` = b.`nom`
        AND a.`code_user` = :code_user
        ".$fitreSet."
        GROUP BY b.`qualite`
    ) e
    ON e.`qualite` = d.`qualite`
    UNION
    SELECT 'gold', COUNT(`dez`) as 'nb' , SUM(`dez`) as 'nbDez', IFNULL(ROUND(SUM(`dez`)/COUNT(`dez`)*100,2),0) as 'percDez'
    FROM `tab_paquet` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`code_user` = :code_user
    ".$fitreSet."
    AND a.`gold` = 1
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "resultatDez";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$fitreSetC = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSetC = " AND c.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSetC = " AND c.`mode` not in ('Basique','Promotion','Récompense') ";
} 

$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT d.`qualite`, d.`nbInv`, e.`nbMy`
    , IFNULL(ROUND(e.`nbMy` / IF(d.`qualite` != 'Légendaire', d.`nbInv`*2, d.`nbInv`) * 100,2),0) as 'avancement'
    , IF(d.`qualite` != 'Légendaire', d.`nbInv`*2, d.`nbInv`) - e.`nbMy` as 'rest'
    FROM (
    SELECT c.`qualite`, COUNT(c.`qualite`) as 'nbInv'
    FROM `tab_inventaire` c 
    WHERE 1=1 
    ".$fitreSetC."
    GROUP BY c.`qualite`
    ) d,
    (
        SELECT b.`qualite`, SUM(a.`nb`) as 'nbMy' 
        FROM (
            SELECT f.`nom`, IF(COUNT(`nom`) > 2, 2, COUNT(`nom`)) as 'nb' 
            FROM `tab_collection` f
            WHERE 1=1 
            AND f.`code_user` = :code_user
            GROUP BY f.`nom`
    )	a, `tab_inventaire` b 
        WHERE 1=1 
        AND a.`nom` = b.`nom`
        ".$fitreSet."
        GROUP BY b.`qualite`
    ) e
    WHERE 1=1
    AND d.`qualite` = e.`qualite`
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "resultatAvan";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);