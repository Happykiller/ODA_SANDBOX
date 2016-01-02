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
    function get() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`author` as 'authorId', b.`code_user` as 'authorCode', a.`creationDate`, a.`name`, a.`lang`
                FROM `tab_qcm_sessions` a, `api_tab_utilisateurs` b
                WHERE 1=1
                AND a.`author` = b.`id`
                LIMIT :odaOffset, :odaLimit
            ;";
            $params->bindsValue = [
                "odaOffset" => $this->odaOffset,
                "odaLimit" => $this->odaLimit
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataObject($retour->data->data);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO `tab_qcm_sessions` (
                    `author` ,
                    `creationDate`,
                    `name`,
                    `lang`
                )
                VALUES (
                    :userId, NOW(), :name, :lang
                )
            ;";
            $params->bindsValue = [
                "userId" => $this->inputs["userId"],
                "name" => $this->inputs["name"],
                "lang" => $this->inputs["lang"]
            ];
            $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->value = $retour->data;
            $this->addDataStr($params);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

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