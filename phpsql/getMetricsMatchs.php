<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("code_user","dateDebut","type","classeAdv","regrp","div_graph","legend","titre","classe","deck","filtre_nonClasse","filtre_classe","filtre_arene");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getMetricsMatchs.php?milis=123450&ctrl=ok&code_user=FRO&dateDebut=&type=&classeAdv=&regrp=classe_adversaire&div_graph=truc&legend=true&titre=monTitre&classe=Guerrier&deck=&filtre_nonClasse=true&filtre_classe=true&filtre_arene=true

//--------------------------------------------------------------------------
if(($HOW_INTERFACE->inputs["div_graph"]=="") || ($HOW_INTERFACE->inputs["legend"]=="") || ($HOW_INTERFACE->inputs["titre"]=="")){
    $object_retour->strErreur = "div_graph;legend;titre;";
}else{
    $object_retour->data["div_graph"] = $HOW_INTERFACE->inputs["div_graph"]; 
    $object_retour->data["legend"] = $HOW_INTERFACE->inputs["legend"]; 
    $object_retour->data["titre"] = $HOW_INTERFACE->inputs["titre"]; 
    $object_retour->data["regrp"] = $HOW_INTERFACE->inputs["regrp"]; 

    $filtreDate = "2013-01-01";
    if($HOW_INTERFACE->inputs["dateDebut"] != ""){
        $filtreDate = $HOW_INTERFACE->inputs["dateDebut"];
    }

    $filtreClasse = "";
    if($HOW_INTERFACE->inputs["classe"] != ""){
        $filtreClasse = " AND b.`classe` = '".$HOW_INTERFACE->inputs["classe"]."'";
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
        ".$filtreClasse."
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
    $params->sql = "SELECT DISTINCT 
            a.`reussite`,
            b.`nb` as 'countReussite',
            `".$HOW_INTERFACE->inputs["regrp"]."` as 'regrp',
            count(*) as 'nb',
            a.`classe` 
        FROM `temp_matchs` a, 
        ( 
            SELECT count(*) as 'nb' 
            FROM `temp_matchs_0` c 
            WHERE 1=1 
            AND c.`reussite` = :reussite
        ) b
        WHERE 1=1 
        AND a.`reussite` = :reussite
        GROUP BY `".$HOW_INTERFACE->inputs["regrp"]."`
    ;";
    $params->bindsValue = [
        "reussite" => 1
    ];
    $params->typeSQL = OdaLibBd::SQL_GET_ALL;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
    
    $params = new stdClass();
    $params->label = "metricsMatchsWin";
    $params->retourSql = $retour;
    $HOW_INTERFACE->addDataReqSQL($params);

    //--------------------------------------------------------------------------
    //Metrics pour les loss
    // On envois la requète
    $params = new OdaPrepareReqSql(); 
    $params->sql = "SELECT DISTINCT 
            a.`reussite`,
            b.`nb` as 'countReussite',
            `".$HOW_INTERFACE->inputs["regrp"]."` as 'regrp',
            count(*) as 'nb',
            a.`classe` 
        FROM `temp_matchs` a, 
        ( 
            SELECT count(*) as 'nb' 
            FROM `temp_matchs_0` c 
            WHERE 1=1 
            AND c.`reussite` = :reussite
        ) b
        WHERE 1=1 
        AND a.`reussite` = :reussite
        GROUP BY `".$HOW_INTERFACE->inputs["regrp"]."`
    ;";
    $params->bindsValue = [
        "reussite" => 0
    ];
    $params->typeSQL = OdaLibBd::SQL_GET_ALL;
    $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
    
    $params = new stdClass();
    $params->label = "metricsMatchsLoss";
    $params->retourSql = $retour;
    $HOW_INTERFACE->addDataReqSQL($params);
}