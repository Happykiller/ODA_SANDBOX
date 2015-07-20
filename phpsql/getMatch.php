<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("id_match","code_user");
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getMatch.php?milis=123450&ctrl=ok&id_match=0&code_user=FRO
    
//--------------------------------------------------------------------------
if($HOW_INTERFACE->inputs["id_match"] != "0"){
    $params = new OdaPrepareReqSql(); 
    $params->sql = "Select a.`id`, a.`type`, a.`classe_adversaire`, a.`coin`, a.`nom_adversaire`, b.`nom_deck`, b.`classe` as 'my_classe', b.`id` as 'id_deck'
        FROM `tab_matchs` a, `tab_deck_header` b
        WHERE 1=1
        AND a.`id_deck` = b.`id`
        AND a.`id` = ".$HOW_INTERFACE->inputs["id_match"]."
    "; 
}else{
    $params = new OdaPrepareReqSql(); 
    $params->sql = "Select a.`id`, a.`type`, a.`classe_adversaire`, a.`coin`, a.`nom_adversaire`, b.`nom_deck`, b.`classe` as 'my_classe', b.`id` as 'id_deck'
        FROM `tab_matchs` a, `tab_deck_header` b
        WHERE 1=1
        AND a.`id_deck` = b.`id`
        AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
        AND a.`date_end` = '0000-00-00 00:00:00'
        ORDER BY `id` desc
        LIMIT 0, 1
    ";
}
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retourMatch = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "match";
$params->retourSql = $retourMatch;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
if($retourMatch->data){
    if($retourMatch->data->nom_adversaire != ""){
        $params = new OdaPrepareReqSql();
        $params->sql = "Select
        a.`code_user`,
        a.`id_deck`,
        a.`type`,
        a.`classe_adversaire`,
        a.`date_start`,
        a.`date_end`,
        a.`vie`,
        a.`coin`,
        a.`type_adversaire`,
        a.`adv_rang`,
        a.`my_rang`,
        TIMEDIFF(a.`date_end`, a.`date_start`) as 'duree'
        from `tab_matchs` a
        WHERE 1=1
        AND a.`date_end` != '0000-00-00 00:00:00'
        AND a.`nom_adversaire` = :nom_adversaire
        LIMIT 0 , 5
    ;";
        $params->bindsValue = [
            "nom_adversaire" => $retourMatch->data->nom_adversaire
        ];
        $params->typeSQL = OdaLibBd::SQL_GET_ALL;
        $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
    }

    $params = new stdClass();
    $params->label = "adv_past";
    $params->retourSql = $retour;
    $HOW_INTERFACE->addDataReqSQL($params);

    //--------------------------------------------------------------------------
    $lastRang = "25";

    if($retourMatch->data->type == "Classé"){
        $params = new OdaPrepareReqSql();
        $params->sql = "Select a.`my_rang`
        from `tab_matchs` a
        WHERE 1=1
        AND a.`date_end` != '0000-00-00 00:00:00'
        AND a.`my_rang` != ''
        AND a.`code_user` = :code_user
        ORDER BY a.`date_start` desc
        LIMIT 0 , 1
    ;";
        $params->bindsValue = [
            "code_user" => $HOW_INTERFACE->inputs["code_user"]
        ];
        $params->typeSQL = OdaLibBd::SQL_GET_ONE;
        $retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

        $lastRang = $retour->data->my_rang;
    }

    $params = new stdClass();
    $params->label = "lastRang";
    $params->value = $lastRang;
    $HOW_INTERFACE->addDataStr($params);
}