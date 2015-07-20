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
$params->arrayInputOpt = array("set" => 'Tous');
$HOW_INTERFACE = new HowInterface($params);

//--------------------------------------------------------------------------
// phpsql/getMetricsCollectionNeutre.php?milis=123450&ctrl=ok&code_user=FRO&set=

//--------------------------------------------------------------------------
$fitreSet = "";
If ($HOW_INTERFACE->inputs['set'] != 'Tous'){
    $fitreSet = " AND b.`mode` = '".$HOW_INTERFACE->inputs['set']."' ";
}else{
    $fitreSet = " AND b.`mode` not in ('Basique','Promotion','Récompense') ";
}

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "CREATE TEMPORARY TABLE `listClassQualite` as
    SELECT DISTINCT 'Neutre' as 'classe', a.`qualite`
    FROM `tab_inventaire` a
;    

CREATE TEMPORARY TABLE `myCollectionNeutre` as
SELECT b.`qualite`, b.`classe`, SUM(c.`nb_carte_compress`) as 'nb'
FROM (
	SELECT a.`nom`, count(*) as 'nb_carte', IF(count(*) >= 2, 2, count(*)) as 'nb_carte_compress'
	FROM `tab_collection` a
	WHERE 1=1
	AND a.`code_user` = '".$HOW_INTERFACE->inputs["code_user"]."'
	AND a.`date_dez` = '0000-00-00 00:00:00'
	GROUP BY a.`nom`
) c, `tab_inventaire` b
WHERE 1=1
AND c.`nom` = b.`nom`
AND b.`actif` = 1
AND b.`classe` = 'Neutre'
".$fitreSet." 
GROUP BY b.`qualite`, b.`classe`
;";
$params->typeSQL = OdaLibBd::SQL_SCRIPT;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`qualite`, a.`classe`, IFNULL(b.`nb`,0) as 'nb'
FROM `listClassQualite` a
LEFT OUTER JOIN `myCollectionNeutre` b
ON a.`classe` = b.`classe` AND a.`qualite` = b.`qualite`
WHERE 1=1
AND a.`classe` = 'Neutre'
ORDER BY a.`qualite`
;";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "qualite_neutre";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);

//--------------------------------------------------------------------------
$params = new OdaPrepareReqSql(); 
$params->sql = "SELECT a.`qualite`, 'Neutre' as 'classe', IFNULL(c.`nb`,0) as 'nb'
    FROM `listClassQualite` a
    LEFT OUTER JOIN (SELECT b.`qualite`, 'Neutre' as 'classe', IF(b.`qualite` != 'Légendaire', count(*)*2, count(*)) as 'nb'
    FROM `tab_inventaire` b
    WHERE 1=1
    AND b.`actif` = 1
    AND ( b.`classe` = '' OR b.`classe` = 'Neutre')
    ".$fitreSet." 
    GROUP BY b.`qualite` ) c
    ON a.`qualite` = c.`qualite`
    WHERE 1=1
    ORDER BY a.`qualite`
";
$params->typeSQL = OdaLibBd::SQL_GET_ALL;
$retour = $HOW_INTERFACE->BD_ENGINE->reqODASQL($params);
$paquet = $retour->data->data;

$params = new stdClass();
$params->label = "qualite_neutre_inventaire";
$params->retourSql = $retour;
$HOW_INTERFACE->addDataReqSQL($params);