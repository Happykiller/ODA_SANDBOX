<?php
namespace How;

require '../../header.php';
require '../../vendor/autoload.php';
require '../../include/config.php';

use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//Build the interface
$params = new OdaPrepareInterface();
$INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql();
$params->sql = "SELECT count(DISTINCT a.`nom`) as 'nb'
    FROM `tab_inventaire` a
    WHERE 1=1
    AND a.`mode` = 'Basique'
;";
$params->typeSQL = OdaLibBd::SQL_GET_ONE;
$retour = $INTERFACE->BD_ENGINE->reqODASQL($params);

$params = new stdClass();
$params->label = "resultat";
$params->retourSql = $retour;
$INTERFACE->addDataReqSQL($params);