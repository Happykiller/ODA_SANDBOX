<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_deck","input_nom","input_actif","input_type","input_cmt");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/setHeaderDeck.php?milis=123450&id_deck=11&input_nom=PaladinArene&input_actif=0&type=arene

//--------------------------------------------------------------------------  
$setNomDeck = "";
if($HOW_INTERFACE->inputs["input_nom"] != ""){
    $setNomDeck = " ,`nom_deck`= '".$HOW_INTERFACE->inputs["input_nom"]."' ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "UPDATE `how-tab_deck_header` a
    SET 
    `actif`= :input_actif
    , `type`= :input_type
    , `commentaire`= :input_cmt
    ".$setNomDeck."
    WHERE 1=1
    AND a.`id` = :id_deck
;";
$params->bindsValue = [
    "id_deck" => $HOW_INTERFACE->inputs["id_deck"]
    , "input_actif" => $HOW_INTERFACE->inputs["input_actif"]
    , "input_type" => $HOW_INTERFACE->inputs["input_type"]
    , "input_cmt" => $HOW_INTERFACE->inputs["input_cmt"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);