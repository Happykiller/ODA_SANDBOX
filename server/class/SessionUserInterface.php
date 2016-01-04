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
class SessionUserInterface extends OdaRestInterface {
    /**
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO `tab_qcm_sessions_user` (
                    `firstName` ,
                    `lastName`,
                    `qcmId`,
                    `qcmName`,
                    `qcmLang`,
                    `createDate`
                )
                VALUES (
                    :firstName, :lastName, :qcmId, :qcmName, :qcmLang, NOW()
                )
            ;";
            $params->bindsValue = [
                "firstName" => $this->inputs["firstName"],
                "lastName" => $this->inputs["lastName"],
                "qcmId" => $this->inputs["qcmId"],
                "qcmName" => $this->inputs["qcmName"],
                "qcmLang" => $this->inputs["qcmLang"]
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
    function createRecord() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO `tab_sessions_user_record` (
                    `question`,
                    `nbErrors`,
                    `sessionUserId`,
                    `recordDate`
                )
                VALUES (
                    :question, :nbErrors, :sessionUserId, NOW()
                )
            ;";
            $params->bindsValue = [
                "question" => $this->inputs["question"],
                "nbErrors" => $this->inputs["nbErrors"],
                "sessionUserId" => $this->inputs["sessionUserId"]
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
}