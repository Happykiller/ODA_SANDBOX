<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_deck","code_user","id_card","gold");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/deckEditionAdd.php?milis=123450&id_deck=5&code_user=FRO&id_card=261&gold=1
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "INSERT INTO  `tab_deck`
    (`id_deck`, `nom_carte`, `gold`, `date_ajout`, `auteur_ajout`) 
    SELECT :id_deck, a.`nom`, :gold, NOW(), :code_user
    FROM `tab_inventaire` a
    WHERE 1=1
    AND a.`id` = :id_card
    AND a.`actif` = 1
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
    , "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "id_card" => $HOW_INTERFACE->inputs["id_card"]
    , "gold" => $HOW_INTERFACE->inputs["gold"]
];
$params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatInsert";
$params->value = $retour->data;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "Select a.`id`, a.`nom`, (
            SELECT COUNT(*)
            FROM `tab_deck` b
            WHERE 1=1
            AND b.`id_deck` = :id_deck
            AND b.`gold` = 0
    ) as 'nb_non_gold',(
            SELECT COUNT(*)
            FROM `tab_deck` c
            WHERE 1=1
            AND c.`id_deck` = :id_deck
            AND c.`gold` = 1
    ) as 'nb_gold'
    FROM `how-tab_inventaire` a
    WHERE 1=1
    AND a.`id` = :id_card
";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
    , "id_card" => $HOW_INTERFACE->inputs["id_card"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);