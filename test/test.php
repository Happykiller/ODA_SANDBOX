<?php
namespace How;

require '../header.php';
require '../vendor/autoload.php';
require '../include/config.php';

use stdClass, \Oda\OdaLib, \Oda\SimpleObject\OdaConfig;

//--------------------------------------------------------------------------
$retours = array();

//--------------------------------------------------------------------------
$retours[] = OdaLib::test("ckeckCountBasique",function() {
    $config = OdaConfig::getInstance();
    $params = new stdClass();
    $input = ["milis" => "123451","ctrl" => "ok"];
    $retourCallRest = OdaLib::CallRest($config->urlServer."phpsql/test/ckeckCountBasique.php", $params, $input);

    OdaLib::equal($retourCallRest->data->resultat->nb, "133", "On vérifie qu'il ne manque pas de carte de basique. (133)");
}
);

//--------------------------------------------------------------------------
$resultats = new stdClass();
$resultats->details = $retours;
$resultats->succes = 0;
$resultats->echec = 0;
$resultats->total = 0;
foreach($retours as $key => $value) {
    $resultats->succes += $value->succes;
    $resultats->echec += $value->echec;
    $resultats->total += $value->total;
}

var_dump($resultats);