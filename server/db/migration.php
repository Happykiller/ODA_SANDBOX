<?php
namespace Oda;

require '../vendor/autoload.php';
require '../config/config.php';

use \stdClass;

// php migration.php --target=001-work

$shortopts  = "";

$longopts  = array(
    "target:",
    "partial::",
    "option::",
    "checkDb::"
);
$options = getopt($shortopts, $longopts);

$OdaMigration = new OdaMigration($options);

$OdaMigration->migrate();