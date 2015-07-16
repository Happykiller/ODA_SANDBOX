<?php
namespace How;

require 'header.php';
require 'vendor/autoload.php';
require 'include/config.php';
/**
 * Created by PhpStorm.
 * User: Happykiller
 * Date: 14/07/2015
 * Time: 10:02
 */

use stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

//--------------------------------------------------------------------------
//Build the interface
$params = new OdaPrepareInterface();
$params->arrayInput = array("param_name");
$INTERFACE = new HowInterface($params);