<?php
$config = \Oda\SimpleObject\OdaConfig::getInstance();
$config->urlServer = "http://localhost/ODA_HOW/server/";

//for bd engine
$config->BD_ENGINE->base = 'how';
$config->BD_ENGINE->mdp = 'pass';
$config->BD_ENGINE->prefixTable = 'how-';