<?php
namespace Chop;

use Exception;
use Oda\OdaLibBd;
use Oda\OdaRestInterface;
use Oda\SimpleObject\OdaPrepareReqSql;
use \stdClass;
use Symfony\Component\Yaml\Yaml;

/**
 * Project class
 *
 * Tool
 *
 * @author  Fabrice Rosito <rosito.fabrice@gmail.com>
 * @version 0.150221
 */
class QcmInterface extends OdaRestInterface {
    /**
     */
    function getByName($name,$lang) {
        try {
            $qcm = __DIR__  . DIRECTORY_SEPARATOR . ".." . DIRECTORY_SEPARATOR . "resources" . DIRECTORY_SEPARATOR . "qcm" . DIRECTORY_SEPARATOR . $name .'.'.$lang.'.yaml';
            $content = Yaml::parse(file_get_contents($qcm));

            $this->addDataObject($content);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
}