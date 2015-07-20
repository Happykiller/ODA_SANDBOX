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
// phpsql/getMetricsCollection.php?milis=123450&ctrl=ok&code_user=FRO

//--------------------------------------------------------------------------
$fitreSet = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSet = " AND b.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSet = " AND b.`mode` not in ('Basique','Promotion','Récompense') ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `listClasse`
    SELECT DISTINCT a.`classe`
    FROM `tab_inventaire` a
    WHERE 1=1
    AND a.`classe` != '' 
    AND a.`classe` != 'Neutre'
    ORDER BY a.`classe`
;

CREATE TEMPORARY TABLE `listQualite`
    SELECT DISTINCT a.`qualite`
    FROM `tab_inventaire` a
    ORDER BY a.`qualite`
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`classe`
    FROM `listClasse` a
    WHERE 1=1
    ORDER BY a.`classe`
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "classes";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT e.`qualite`, e.`classe`, IFNULL(f.`nb`, 0) as 'nb'
    FROM (
        SELECT * FROM `listClasse` c, `listQualite` d
    ) e
    LEFT OUTER JOIN (
            SELECT b.`qualite`, b.`classe`, IF(b.`qualite` != 'Légendaire', count(*)*2, count(*)) as 'nb'
            FROM `tab_inventaire` b
            WHERE 1=1
            AND b.`actif` = 1
            And b.`classe` != 'Neutre'
            ".$fitreSet."
            GROUP BY b.`qualite`, b.`classe`
    ) f
    ON e.`qualite` = f.`qualite`
    AND e.`classe` = f.`classe`
    ORDER BY e.`qualite`, e.`classe`
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "qualite_classe_inventaire";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT e.`qualite`, e.`classe`, IFNULL(f.`nb`, 0) as 'nb'
    FROM (
        SELECT * FROM `listClasse` c, `listQualite` d
    ) e
    LEFT OUTER JOIN (
            SELECT b.`qualite`, b.`classe`, SUM(c.`nb_carte_compress`) as 'nb'
            FROM (
                SELECT a.`nom`, count(*) as 'nb_carte', IF(count(*) >= 2, 2, count(*)) as 'nb_carte_compress'
                FROM `tab_collection` a
                WHERE 1=1
                AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
                AND a.`date_dez` = '0000-00-00 00:00:00'
                GROUP BY a.`nom`
            ) c, `tab_inventaire` b
            WHERE 1=1
            AND c.`nom` = b.`nom`
            AND b.`actif` = 1
            AND b.`classe` != ''
            And b.`classe` != 'Neutre'
            ".$fitreSet."
            GROUP BY b.`qualite`, b.`classe`
    ) f
    ON e.`qualite` = f.`qualite`
    AND e.`classe` = f.`classe`
    ORDER BY e.`qualite`, e.`classe`
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "qualite_classe";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);