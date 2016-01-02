SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------

INSERT INTO `@prefix@api_tab_menu` (`id`, `Description`, `Description_courte`, `id_categorie`, `Lien`) VALUES (NULL, 'qcm-manage.title', 'qcm-manage.title', '3', 'qcm-manage');

UPDATE `@prefix@api_tab_menu_rangs_droit` a
  INNER JOIN `@prefix@api_tab_menu` b
    ON b.`Lien` = 'qcm-manage'
  INNER JOIN `@prefix@api_tab_rangs` c
    ON c.`id` = a.`id_rang`
       AND c.`indice` in (1,10)
SET `id_menu` = concat(`id_menu`,b.`id`,';');

CREATE TABLE IF NOT EXISTS `@prefix@tab_qcm_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author` int(11) NOT NULL,
  `creationDate` datetime NOT NULL,
  `name` varchar(250) NOT NULL,
  `lang` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_qcm_sessions`
--
ALTER TABLE `@prefix@tab_qcm_sessions`
ADD CONSTRAINT `fk_userId` FOREIGN KEY (`author`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;


-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;