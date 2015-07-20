<?php
namespace How;
use stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;
//--------------------------------------------------------------------------
//Header
require("../API/php/header.php");
require("../php/class/HowInterface.php");

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_deck");
$params->arrayInputOpt = array("code_user");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getDeckDetails.php?milis=123450&ctrl=ok&id_deck=5

//--------------------------------------------------------------------------
$params = new stdClass();
$params->label = "id_deck";
$params->value = $HOW_INTERFACE->inputs["id_deck"];
$HOW_INTERFACE->addDataStr($params);
        
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "Select a.`nom_deck`, a.`classe`, a.`id`, a.`type`, a.`actif`, a.`creation_date`, a.`creation_code_user`
    from `tab_deck_header` a
    WHERE 1=1
    AND a.`id` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "deck_header";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//-----------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`nom_carte`, b.`qualite`, b.`cout`, b.`attaque`, b.`vie`, b.`provocation`, b.`surcharge`, b.`sorts`, b.`charge`, b.`id_link`, count(*) as 'nb', max(a.`id`) as 'max_id_collec'
    FROM `tab_deck` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom_carte` = b.`nom`
    AND a.`id_deck` = :id_deck
    GROUP BY a.`nom_carte`, b.`qualite`, b.`cout`, b.`attaque`, b.`vie`, b.`provocation`, b.`surcharge`, b.`sorts`, b.`charge`, b.`id_link`
";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "Select COUNT(*) as 'nb_carte_in_deck'
    from `tab_deck` a
    WHERE 1=1
    AND a.`id_deck` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "nb_carte_in_deck";
$params->value = $retour->data->nb_carte_in_deck;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT d.`cout`, IFNULL(e.`nb`,0) as 'nb'
FROM (select distinct IF(c.`cout` >= 7, '7+', c.`cout`) as 'cout' FROM `tab_inventaire` c) d
LEFT OUTER JOIN (
    SELECT  IF(b.`cout` >= 7, '7+', b.`cout`) as 'cout', count(*) as 'nb'
    FROM `tab_deck` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom_carte` = b.`nom`
    AND a.`id_deck` = :id_deck
    GROUP BY IF(b.`cout` >= 7, '7+', b.`cout`)
) e
ON e.`cout` = d.`cout`
ORDER BY `cout` asc
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "coutRepartition";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT SUM(b.`cout`) as 'sum'
FROM `tab_deck` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom_carte` = b.`nom`
AND a.`id_deck` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "coutSum";
$params->value = $retour->data->sum;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT d.`vie`, IFNULL(e.`nb`,0) as 'nb'
FROM (select distinct IF(c.`vie` >= 7, '7+', c.`vie`) as 'vie' FROM `tab_inventaire` c) d
LEFT OUTER JOIN (
    SELECT  IF(b.`vie` >= 7, '7+', b.`vie`) as 'vie', count(*) as 'nb'
    FROM `tab_deck` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom_carte` = b.`nom`
    AND a.`id_deck` = :id_deck
    GROUP BY IF(b.`vie` >= 7, '7+', b.`vie`)
) e
ON e.`vie` = d.`vie`
ORDER BY `vie` asc
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vieRepartition";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT SUM(b.`vie`) as 'sum'
FROM `tab_deck` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom_carte` = b.`nom`
AND a.`id_deck` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "vieSum";
$params->value = $retour->data->sum;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT d.`attaque`, IFNULL(e.`nb`,0) as 'nb'
FROM (select distinct IF(c.`attaque` >= 7, '7+', c.`attaque`) as 'attaque' FROM `tab_inventaire` c) d
LEFT OUTER JOIN (
    SELECT  IF(b.`attaque` >= 7, '7+', b.`attaque`) as 'attaque', count(*) as 'nb'
    FROM `tab_deck` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom_carte` = b.`nom`
    AND a.`id_deck` = :id_deck
    GROUP BY IF(b.`attaque` >= 7, '7+', b.`attaque`)
) e
ON e.`attaque` = d.`attaque`
ORDER BY `attaque` asc
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "attaqueRepartition";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "SELECT SUM(b.`attaque`) as 'sum'
FROM `tab_deck` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom_carte` = b.`nom`
AND a.`id_deck` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "attaqueSum";
$params->value = $retour->data->sum;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT count(b.`type`) as 'nb', b.`type`
FROM `tab_deck` a, `tab_inventaire` b
WHERE 1=1
AND a.`nom_carte` = b.`nom`
AND a.`id_deck` = :id_deck
GROUP BY b.`type`
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "reparType";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);