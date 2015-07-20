<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","type","nom_deck","classe");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/validerDeck.php?milis=123450&ctrl=ok&code_user=FRO&type=regular&classe=Voleur&nom_deck=Voleur
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "INSERT INTO  `tab_deck_header`
    (`code_user`, `nom_deck`, `classe`, `type`, `actif`, `creation_date`, `creation_code_user`) 
    VALUES
    (:code_user, :nom_deck, :classe, :type, 1, NOW(), :code_user)
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
    , "type" => $HOW_INTERFACE->inputs["type"]
    , "nom_deck" => $HOW_INTERFACE->inputs["nom_deck"]
    , "classe" => $HOW_INTERFACE->inputs["classe"]
];
$params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$id_deck = $retour->data;

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "INSERT INTO  `tab_deck`
    (`id_deck`, `nom_carte`, `gold`, `date_ajout`, `auteur_ajout`) 
    SELECT ".$id_deck.", a.`nom`, a.`gold`, NOW(), :code_user
    FROM `tab_decktemp` a
    WHERE 1=1
    AND a.`code_user` = :code_user
;";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatInsert";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "Select IF(COUNT(*) = 30,'true','false') as 'empty'
    from `tab_decktemp` a, `tab_inventaire` b
    WHERE 1=1
    AND a.`nom` = b.`nom`
    AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
    AND a.`type` = '".$HOW_INTERFACE->inputs["type"]."'
";
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatCopie";
$params->value = $retour->data->empty;
$HOW_INTERFACE->addDataStr($params);

//Pour test on crée une table temporaire
$params = new OdaPrepareReqSql(); 
$params->sql = "DELETE FROM `tab_decktemp`
    WHERE 1=1
    AND `code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
    AND `type` = '".$HOW_INTERFACE->inputs["type"]."'
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultatVider";
$params->value = $retour->nombre;
$HOW_INTERFACE->addDataStr($params);