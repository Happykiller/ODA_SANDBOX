<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInputOpt = array("code_user" => "Tous","set" => "Tous");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getQualitePaquets.php?milis=123450&ctrl=ok&code_user=FRO

//--------------------------------------------------------------------------
$fitreCodeUser = "";
If ($HOW_INTERFACE->inputs['code_user'] != 'Tous'){
    $fitreCodeUser = " AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."' ";
}

//--------------------------------------------------------------------------
$fitreSet = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSet = " AND b.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSet = " AND b.`mode` not in ('Basique','Promotion','Récompense') ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `listQualite`
    SELECT DISTINCT a.`qualite`
    FROM `tab_inventaire` a
    ORDER BY a.`qualite`
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT c.`qualite`, IFNULL(d.`nb`,0) as 'nb'
    FROM `listQualite` c
    LEFT OUTER JOIN (
        SELECT b.`qualite`, count(*) as 'nb'
            FROM `tab_paquet` a, `tab_inventaire` b
            WHERE 1=1
            AND a.`nom` = b.`nom`
            ".$fitreCodeUser."
            ".$fitreSet."
            GROUP BY b.`qualite`
    ) d
    ON c.`qualite` = d.`qualite`
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "repartitionQualite";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT 'gold', count(*) as 'nb'
    FROM `tab_paquet` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`gold` = 1
    ".$fitreCodeUser."
    ".$fitreSet."
;";
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "repartitionGold";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT count(*) as 'nb'
FROM (SELECT a.`date_saisie`
    FROM `tab_paquet` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    ".$fitreCodeUser."
    ".$fitreSet."
    GROUP BY a.`date_saisie`) c
;";
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "nbpaquets";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);