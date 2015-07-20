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
$params->arrayInputOpt = array("qualite_commune" => null,"qualite_rare" => null,"qualite_epique" => null,"qualite_legendaire" => null);
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getCollection.php?milis=123450&ctrl=ok&code_user=FRO

//--------------------------------------------------------------------------
$filtreQualiteCommune = "";
if($HOW_INTERFACE->inputs["qualite_commune"] == "true"){
    $filtreQualite = ", 'Classique'";
}
$filtreQualiteRare = "";
if($HOW_INTERFACE->inputs["qualite_rare"] == "true"){
    $filtreQualiteRare = ", 'Rare'";
}
$filtreQualiteEpique = "";
if($HOW_INTERFACE->inputs["qualite_epique"] == "true"){
    $filtreQualiteEpique = ", 'Épique'";
}
$filtreQualiteLegendaire = "";
if($HOW_INTERFACE->inputs["qualite_legendaire"] == "true"){
    $filtreQualiteLegendaire = ", 'Légendaire'";
}

$filtreQualite = "";
if($filtreQualiteCommune != "" || $filtreQualiteRare != "" || $filtreQualiteEpique != "" || $filtreQualiteLegendaire != ""){
    $filtreQualite = " AND b.`qualite` in ('defaut'".$filtreQualiteCommune."".$filtreQualiteRare."".$filtreQualiteEpique."".$filtreQualiteLegendaire.")";
}
    
//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT b.`nom`, b.`qualite`, b.`classe`, b.`cout`, c.`gold`, c.`nb`, b.`id_link`, c.`max_id_collec`
    FROM (	
        SELECT a.`nom`, a.`gold`, count(*) as 'nb', max(a.`id`) as 'max_id_collec'
        FROM `tab_collection` a
        WHERE 1=1
        AND a.`code_user` = :code_user
        AND a.`date_dez` = '0000-00-00 00:00:00'
        GROUP BY a.`nom`, a.`gold`
    ) c, `tab_inventaire` b
    WHERE 1=1
    AND c.`nom` = b.`nom`
    AND b.`actif` = 1
    ".$filtreQualite."
    ORDER BY b.`classe`, b.`cout`, b.`nom`
";
$params->bindsValue = [
    "code_user" => $HOW_INTERFACE->inputs["code_user"]
];
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "collection";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

if($retour->nombre == 0){
    //collection vide on init
    $params = new OdaPrepareReqSql(); 
    $params->sql = "INSERT INTO  `how-tab_collection`
    (`code_user`, `nom`, `gold`, `source`, `date_ajout`, `auteur_ajout`) 
    SELECT :code_user, a.`nom`, 0, 'init', NOW(), :code_user
    FROM `how-tab_inventaire` a
    WHERE 1=1
    AND a.`mode` = 'Basique'
    ;

    INSERT INTO  `how-tab_collection`
    (`code_user`, `nom`, `gold`, `source`, `date_ajout`, `auteur_ajout`) 
    SELECT :code_user, a.`nom`, 0, 'init', NOW(), :code_user
    FROM `how-tab_inventaire` a
    WHERE 1=1
    AND a.`mode` = 'Basique'
    ;";
    $params->bindsValue = [
        "code_user" => $HOW_INTERFACE->inputs["code_user"]
    ];
    $params->typeSQL = OdaLibBd::SQL_SCRIPT;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

    $params = new stdClass();
    $params->label = "resultatInit";
    $params->value = $retour->data;
    $HOW_INTERFACE->addDataStr($params); 
}