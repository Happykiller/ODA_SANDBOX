<?php

namespace Chop;

require '../../header.php';
require "../../vendor/autoload.php";
require '../../config/config.php';

use cebe\markdown\GithubMarkdown;
use Slim\Slim;
use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;

$slim = new Slim();
//--------------------------------------------------------------------------

$slim->notFound(function () {
    $params = new OdaPrepareInterface();
    $INTERFACE = new OdaRestInterface($params);
    $INTERFACE->dieInError('not found');
});

$slim->get('/', function () {
    $markdown = file_get_contents('./doc.markdown', true);
    $parser = new GithubMarkdown();
    echo $parser->parse($markdown);
});

$slim->get('/entity/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new EntityInterface($params);
    $INTERFACE->get($id);
});

//--------------------------------------------------------------------------
//---------------------------- QCM -----------------------------------------
$slim->get('/qcm/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new QcmInterface($params);
    $INTERFACE->get();
});

$slim->post('/qcm/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("userId","name","lang");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new QcmInterface($params);
    $INTERFACE->create();
});

$slim->get('/qcm/:name/:lang', function ($name,$lang) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new QcmInterface($params);
    $INTERFACE->getByName($name,$lang);
});

//--------------------------------------------------------------------------
//---------------------------- SESSION_USER --------------------------------
$slim->post('/sessionUser/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("firstName","lastName","qcmId","qcmName","qcmLang");
    $params->slim = $slim;
    $INTERFACE = new SessionUserInterface($params);
    $INTERFACE->create();
});

$slim->post('/sessionUser/record/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("question","nbErrors","sessionUserId");
    $params->slim = $slim;
    $INTERFACE = new SessionUserInterface($params);
    $INTERFACE->createRecord();
});

//--------------------------------------------------------------------------

$slim->run();