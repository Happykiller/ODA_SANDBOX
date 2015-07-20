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
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/validerPaquet.php?milis=123450&code_user=FRO
    
//--------------------------------------------------------------------------
$nbDez = 0;
$modeNoImpact = false;

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`nom`, a.`gold`
    FROM `tab_paquettemp` a
    WHERE 1=1
    AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

foreach ($paquet as $carte) {
    $dez = false;

    $params = new OdaPrepareReqSql(); 
    $params->sql = "SELECT count(*) as 'nb'
        FROM `tab_collection` a
        WHERE 1=1
        AND a.`code_user` = :code_user
        AND a.`nom` = :nom
        AND a.`gold` = :gold
    ";
    $params->bindsValue = [
        "code_user" => $HOW_INTERFACE->inputs["code_user"]
        , "nom" => $carte->nom
        , "gold" => $carte->gold
    ];
    $params->typeSQL = OdaLibBd::SQL_GET_ONE;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

    if($retour->data->nb < 2){
        $params = new OdaPrepareReqSql(); 
        $params->sql = "INSERT INTO  `tab_collection`
            (`code_user`, `nom`, `gold`, `source`, `date_ajout`, `auteur_ajout`) 
            VALUES
            ( :code_user, :nom, :gold, 'draft', NOW(), :code_user ) 
        ;";
        $params->bindsValue = [
            "code_user" => $HOW_INTERFACE->inputs["code_user"]
            , "nom" => $carte->nom
            , "gold" => $carte->gold
        ];
        $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
        $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

        $params = new stdClass();
        $params->label = "resultatAjoutCollection_".$carte->nom."_".$carte->gold;
        $params->value = $retour->data;
        $HOW_INTERFACE->addDataStr($params);
    }else{
        $dez = true;
        $nbDez += 1;
    }

    $params = new OdaPrepareReqSql(); 
    $params->sql = "INSERT INTO  `tab_paquet`
        (`date_saisie`, `code_user`, `nom`, `gold`, `dez`, `date_ajout`, `auteur_ajout`) 
        VALUES
        ( NOW(), :code_user, :nom, :gold, :dez, NOW(), :code_user ) 
    ;";
    $params->bindsValue = [
        "code_user" => $HOW_INTERFACE->inputs["code_user"]
        , "nom" => $carte->nom
        , "gold" => $carte->gold
        , "dez" => $dez
    ];
    $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

    $params = new stdClass();
    $params->label = "resultatAjoutPaquet_".$carte->nom."_".$carte->gold;
    $params->value = $retour->data;
    $HOW_INTERFACE->addDataStr($params);
}

//--------------------------------------------------------------------------
if(!$modeNoImpact){
    $params = new OdaPrepareReqSql(); 
    $params->sql = "DELETE FROM `tab_paquettemp`
        WHERE 1=1
        AND `code_user` = :code_user
    ;";
    $params->bindsValue = [
        "code_user" => $HOW_INTERFACE->inputs["code_user"]
    ];
    $params->typeSQL = OdaLibBd::SQL_SCRIPT;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

    $params = new stdClass();
    $params->label = "resultatVider";
    $params->value = $retour->nombre;
    $HOW_INTERFACE->addDataStr($params);
}

//--------------------------------------------------------------------------
$params = new stdClass();
$params->label = "nbDez";
$params->value = $nbDez;
$HOW_INTERFACE->addDataStr($params);