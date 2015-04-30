<?php
// API/phpsql/exemple.php?milis=123450&ctrl=ok&param_name=nom_site
require "vendor/autoload.php";

/**
 * CONFIG PART
 */
$config = \Oda\SimpleObject\OdaConfig::getInstance();
$config->domaine = "http://localhost/ODA_SANDBOX/";

//for bd engine
$config->BD_ENGINE->base = 'how';
$config->BD_ENGINE->mdp = 'pass';
$config->BD_ENGINE->prefixTable = 'how-';

/**
 * BUILD INTERFACE
 */
$params = new \Oda\SimpleObject\OdaPrepareInterface();
$params->arrayInput = array("param_name");
$ODA_INTERFACE = new \Oda\OdaLibInterface($params);

/**
 * USE BD
 */
//Build query
$params = new \Oda\SimpleObject\OdaPrepareReqSql();
$params->sql = "SELECT *
    FROM `api_tab_parametres` a
    WHERE 1=1
    AND a.`param_name` = :param_name
;";
$params->bindsValue = [
    "param_name" => $ODA_INTERFACE->inputs["param_name"]
];
$params->typeSQL = \Oda\OdaLibBd::SQL_GET_ONE;
$retour = $ODA_INTERFACE->BD_ENGINE->reqODASQL($params);

//Add result to interface
$params = new \stdClass();
$params->label = "resultat_get_one";
$params->retourSql = $retour;
$ODA_INTERFACE->addDataReqSQL($params);