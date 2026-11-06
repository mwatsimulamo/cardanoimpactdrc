# Contexte du projet

CIPot-DR Congo est le site de Cardano Learning & Research for Real Use Cases in Goma, DR Congo, le programme mené à Goma, en République démocratique du Congo. Il sert aux participants à comprendre le programme, à s'inscrire, à recevoir les informations et à suivre son avancement. Il sert aussi à documenter les activités réellement tenues, lorsque les organisateurs les publient. Il sert aux organisateurs à gérer les équipes de recherche, les profils Cardano Forum, les articles soumis, les annonces, les présences, les activités documentées, les intervenants, les médias et les exports. L'évaluation chiffrée de la première édition se fait hors du site, dans Google Sheets (D-38).

Ce document est la source des faits, des décisions et des hypothèses. `docs/DESIGN_SYSTEM.md`, `docs/FUNCTIONAL_REQUIREMENTS.md` et `docs/DATABASE_SCHEMA.md` s'y réfèrent. Les règles `.cursor/rules/` en reprennent les contraintes actionnables.

## État du dépôt

Le dépôt contient les pages publiques sous `src/app/[locale]`. Les clients Supabase sont préparés. Aucune table n'est migrée.

| Élément | État constaté |
| --- | --- |
| Next.js | 16.4.4, App Router, code dans `src/app` |
| React | 19.3.0 |
| TypeScript | 5, `strict: true`, alias `@/*` vers `./src/*` |
| Tailwind CSS | 4, entrée `@import "tailwindcss"` dans `src/app/globals.css` |
| ESLint | 9, configuration plate `eslint.config.mjs` |
| Scripts | `dev`, `build`, `start`, `lint` |
| Next config | `cacheComponents`, `partialPrefetching`, chargeur Turbopack pour le CSS |
| Supabase | Paquets `@supabase/supabase-js` et `@supabase/ssr` installés. Clients dans `src/lib/supabase`. Pas de tables. |
| Déploiement visé | Vercel |
| Pages actuelles | Pages publiques français et anglais sous `src/app/[locale]` |

`AGENTS.md` est régénéré par `next dev` et ignoré par Git. La configuration Next.js et les fichiers d'application existants restent inchangés tant qu'une tâche ne demande pas de construire l'interface.

Avant d'écrire du code Next.js, lire le guide de la version installée dans `node_modules/next/dist/docs/01-app/`. Les aides `PageProps` et `LayoutProps` sont globales. L'interception de requête documentée par cette version passe par `proxy.ts`.

## Faits confirmés

Ces phrases peuvent apparaître dans le produit. Rien d'autre sur le programme ne peut être présenté comme établi.

1. Le site s'appelle « CIPot-DR Congo ». Le programme s'appelle « Cardano Learning & Research for Real Use Cases in Goma, DR Congo ». Ces deux noms ne sont pas traduits (D-40).
2. L'initiative est située à Goma, en République démocratique du Congo.
3. Le site aide les participants à comprendre le programme, à s'inscrire, à recevoir des informations et à suivre l'avancement.
4. Les organisateurs disposent d'un espace privé.
5. Le calendrier officiel du programme est la décision D-30. Elle remplace D-29. D-29 reste dans le registre comme calendrier antérieur et n'est plus affiché.
6. Le lancement et les inscriptions ont lieu du 9 au 21 novembre 2026.
7. Les sessions de formation en ligne ont lieu du 23 au 24 novembre 2026.
8. La constitution des équipes a lieu du 25 au 29 novembre 2026.
9. Le concours de recherche et la soumission des articles ont lieu du 30 novembre au 13 décembre 2026, sur Cardano Forum, à l'adresse https://forum.cardano.org/. Les équipes y mènent leurs recherches et y publient leurs articles.
10. L'évaluation par le jury a lieu du 14 au 17 décembre 2026. Les noms des jurés et les notes ne sont pas publiés.
11. L'atelier de clôture en présentiel a lieu le vendredi 18 décembre 2026, à Goma, en République démocratique du Congo. L'heure et l'adresse du lieu ne sont pas publiées. Le site ne connecte pas de portefeuille. Aucun nom d'équipe, score ou lauréat n'est publié tant que le jury n'a pas été saisi.
12. Les articles sont publiés et discutés sur Cardano Forum pendant le concours. Après la saisie du jury, la page publique des résultats peut afficher la première, la deuxième et la troisième équipe, les liens d'articles publiés, les annonces officielles et les résultats finaux. Les notes chiffrées du jury restent dans l'administration. Le calendrier public ne comporte pas de période de rapport final.
13. L'initiative explore la façon dont la blockchain pourrait contribuer à des défis concrets en RDC, dans l'éducation, l'agriculture, l'entrepreneuriat, la traçabilité, la certification et l'inclusion financière.
14. Les sessions de formation en ligne et l'atelier de clôture du 18 décembre 2026 s'inscrivent sur Luma. Le concours de recherche s'inscrit sur ce site, par équipe. Une inscription Luma n'inscrit pas au concours. Une équipe inscrite ici ne réserve pas une place Luma.
15. Le concours est organisé autour des équipes. Une seule personne, le responsable principal (team leader), enregistre toute l'équipe sur un seul formulaire. Les autres membres n'ont pas de compte sur ce site.
16. Une équipe compte de 3 à 5 membres. Le responsable est obligatoirement membre. Un seul responsable. Un adjoint au plus, facultatif. Les autres sont membres. Chaque membre a son propre prénom, nom et courriel. Chaque courriel est unique. Une personne n'appartient qu'à une seule équipe.
17. L'inscription sur ce site ne crée pas le compte Cardano Forum. Le site ne demande pas le mot de passe du forum et ne vérifie pas le compte par une API. Les champs forum ne sont pas obligatoires à l'enregistrement initial. Ils doivent être renseignés et vérifiés avant que l'équipe soit prête à participer. Chaque membre a son propre profil.
18. Le lien de l'article de recherche n'est pas demandé à l'enregistrement. Il se soumet du 30 novembre au 13 décembre 2026, depuis l'espace du responsable.
19. Une présentation personnelle sur Cardano Forum est encouragée. Elle n'est pas exigée pour rejoindre le concours.
20. Le courriel public de l'organisateur est mwatsimulamoolivier@gmail.com. Le profil public X est https://x.com/OlivierMWATSIM1. L'invitation du groupe WhatsApp est https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ. Les noms des personnes qui évaluent ne sont pas publiés.

Les six périodes de D-30 sont des dates civiles, vérifiées sur le calendrier 2026. Le vendredi 18 décembre 2026 est exact. L'heure de chaque séance, le lien de connexion des formations, les intervenants et l'adresse du lieu à l'intérieur de Goma ne figurent pas dans le dossier. « Date à confirmer » ne s'applique plus à ces phases. Les dates de D-29, dont le 19 décembre 2026 et la période de documentation du 20 au 29 décembre 2026, ne sont plus des dates actuelles.

## Décisions retenues

| ID | Décision |
| --- | --- |
| D-01 | Les noms propres du site et du programme, fixés par D-40, ne sont pas traduits. |
| D-02 | L'identité visuelle publique est sombre et institutionnelle. Le fond de toutes les pages est la constellation animée actuelle, conservée telle quelle : dégradé de `#050b1f` vers `#0a1a4a`, nœuds, liens et attraction du pointeur. `prefers-reduced-motion` fige ce dessin. Le bleu `#0033AD` est la couleur de l'en-tête, du pied de page et des actions. Le texte est blanc ou contrasté. Cette constellation n'est ni retirée, ni simplifiée, ni remplacée. Aucun autre fond ni bouton de thème n'est ajouté. |
| D-03 | L'inscription publique ne crée pas de compte classique, ni pour le visiteur, ni pour chaque membre. Les membres n'ont pas de mot de passe sur ce site. Le responsable ouvre son espace avec le seul code remis à l'enregistrement. |
| D-04 | Le site ne connecte pas de portefeuille et n'envoie pas de transaction. |
| D-05 | Aucun partenaire, témoignage, prix, jury ou résultat n'est rédigé tant que les organisateurs ne l'ont pas fourni. Les seuls chiffres publics d'équipes viennent des données réelles : nombre d'équipes soumises et, sur la liste, nom et nombre de membres. Aucune donnée fictive. |
| D-06 | Les identifiants de code et de base sont en anglais. Les textes visibles sont en français et en anglais. |
| D-07 | Le corps d'une annonce est du texte brut, échappé à l'affichage, avec ses retours à la ligne. |
| D-08 | Les lectures et écritures de données passent par le serveur. |
| D-09 | Le site public et l'administration utilisent le même système visuel. |
| D-10 | Le socle `create-next-app` et la configuration Next.js ne sont pas modifiés par une tâche documentaire. |
| D-11 | L'accueil, le programme, le calendrier, le concours et la FAQ sont des contenus versionnés. L'administration ne réécrit pas ces pages. Elle édite les annonces, les équipes, les membres, les articles, les présences, le résultat officiel saisi après consolidation, ainsi que les activités documentées, les intervenants, les médias et les ressources prévus par D-31. |
| D-12 | Les libellés de navigation et les messages système de `docs/FUNCTIONAL_REQUIREMENTS.md` sont la copie d'interface approuvée. |
| D-13 | Le concours de recherche et la discussion des articles ont lieu sur https://forum.cardano.org/. |
| D-14 | Le site n'appelle pas Cardano Forum, n'y crée pas de compte et n'en collecte aucun mot de passe. La vérification d'un profil, d'une présentation ou d'un article se fait en ouvrant son lien public. |
| D-15 | Le compte forum appartient à chaque participant, y compris chaque membre d'une équipe. Le compte du responsable ne tient pas lieu de celui des autres membres. |
| D-16 | L'enregistrement initial d'une équipe peut omettre les comptes forum. Le responsable les complète ensuite depuis son espace, après vérification de son courriel. Connaître un courriel ne suffit pas à ouvrir l'espace. |
| D-17 | Chaque équipe a exactement un responsable principal. Un adjoint peut être désigné. Ce rôle est facultatif. Chaque membre conserve son contact et son profil forum. |
| D-18 | La présentation personnelle sur Cardano Forum est encouragée à l'entrée dans le programme. Elle n'est pas une condition pour rejoindre le concours, sauf décision explicite ultérieure des organisateurs. |
| D-19 | Après le jury, le site peut publier des résultats. Le détail public est fixé par D-22. Aucun lauréat ni résultat n'est inscrit avant la fin de l'évaluation. |
| D-20 | Les sessions de formation et l'atelier n'exigent pas de compte forum. Chaque membre du concours doit avoir le sien avant que l'équipe soit prête. L'enregistrement initial et l'ajout d'un membre restent possibles sans ces champs. Ils ne sont pas une admission à eux seuls. |
| D-21 | L'accès du responsable passe par le seul code conservé dans `leader_access_challenges` (D-24). Il est créé à l'enregistrement et affiché une fois sur la page d'inscription, avec un texte d'attention. Le team leader le saisit ensuite : c'est son point d'entrée. Le code se réutilise jusqu'au 31 janvier 2027. Après l'enregistrement réussi, D-41 envoie aussi ce code au responsable. Il n'y a pas de mot de passe membre. S'il est perdu, le team leader contacte l'équipe : les organisateurs retrouvent le code. |
| D-22 | La page publique des résultats affiche la première, la deuxième et la troisième équipe, les liens d'articles publiés, les annonces officielles et les résultats finaux. Elle n'affiche pas les notes chiffrées du jury. Les feuilles de notes et les procès d'évaluation restent dans l'administration. |
| D-23 | Remplacée pour le concours par D-37. Conservée pour la trace. L'ancienne inscription individuelle et les cases d'intérêt ne sont plus le parcours du concours. Les sessions et l'atelier restent sur Luma. L'intérêt `workshop` désigne toujours l'atelier du 18 décembre 2026. |
| D-24 | Le code prévu par D-21 est le seul billet d'entrée de l'espace du team leader. `secret_hash` sert à l'ouverture. `access_code` conserve le code pour les organisateurs. La table n'est pas lisible par le public, et le code n'est pas affiché dans l'administration tant qu'elle n'est pas authentifiée. Il se réutilise jusqu'au 31 janvier 2027. La page publique n'explique pas sa composition : elle affiche seulement un texte d'attention. D-41 peut envoyer ce code au responsable après l'enregistrement réussi. Le code n'est pas recopié dans les journaux ni dans le corps de campagne. |
| D-25 | Précisée par D-38 pour la première édition. Les notes individuelles ne sont pas saisies dans le site. Les organisateurs enregistrent ensuite le résultat officiel publié (D-22). Aucun critère ni aucune pondération n'est inventé. |
| D-26 | Les ex æquo ne sont pas exclus. La procédure fournie avec le guide des participants est enregistrée par D-35 : la meilleure note au critère « Compréhension du problème » l'emporte, puis « Qualité de la recherche et des preuves ». Le logiciel ne départage pas à leur place. |
| D-27 | Remplacée pour le concours par D-37. Conservée pour la trace. Les cases d'intérêt ne figurent plus sur la page Inscription. |
| D-28 | Si un formulaire de contact est publié, les messages sont lisibles et traités dans l'administration. Cette condition n'approuve pas l'existence du formulaire. |
| D-29 | Remplacée par D-30. Conservée pour la trace. Ancien calendrier officiel, qui remplaçait toutes les dates de programme antérieures, y compris le 22 décembre 2026. Les jours ci-dessous correspondent au calendrier 2026. 1. Inscription et mobilisation des participants : du 8 au 24 novembre 2026. 2. Formations en ligne : session 1 le mercredi 25 novembre 2026 ; session 2 le jeudi 26 novembre 2026. 3. Concours de recherche : du 1er au 15 décembre 2026, sur https://forum.cardano.org/. Les équipes y mènent leurs recherches et y publient leurs articles. 4. Événement principal en présentiel : le samedi 19 décembre 2026, à Goma, en République démocratique du Congo. Activités alors prévues : présentation de l'écosystème Cardano ; activités pratiques sur les portefeuilles et les transactions ; introduction au staking ; présentations des équipes de recherche ; délibération du jury ; reconnaissance et distinctions pour les trois équipes lauréates. 5. Documentation et rapport final : du 20 au 29 décembre 2026. Ce calendrier n'est plus affiché. |
| D-30 | Calendrier officiel. Il remplace D-29 et toutes les dates de programme antérieures. Les jours correspondent au calendrier 2026. 1. Lancement et inscriptions : du 9 au 21 novembre 2026. 2. Sessions de formation en ligne : du 23 au 24 novembre 2026. 3. Constitution des équipes : du 25 au 29 novembre 2026. 4. Concours de recherche et soumission des articles : du 30 novembre au 13 décembre 2026, sur https://forum.cardano.org/. Les équipes y mènent leurs recherches et y publient leurs articles. 5. Évaluation par le jury : du 14 au 17 décembre 2026. Les noms des jurés et les notes ne sont pas publiés. 6. Atelier de clôture en présentiel à Goma : le vendredi 18 décembre 2026. L'heure, le lien de connexion, les intervenants et l'adresse du lieu ne sont pas fixés. Aucune activité supplémentaire n'est ajoutée à cet atelier. Aucune période de rapport final n'est ajoutée au calendrier public. Le site ne connecte pas de portefeuille (D-04). Aucun lauréat ni score n'est publié avant la saisie prévue par D-19 et D-22. L'intérêt `workshop` désigne l'atelier du 18 décembre. La période d'inscription ne lève pas le blocage de la notice A-13. La procédure de départage exigée par D-26 doit exister avant le 30 novembre 2026. |
| D-31 | Les activités réalisées, les intervenants et les médias sont une fonction approuvée. Elle n'est pas construite dans cette phase. La section publique s'appelle « Activités » / « Activities », aux adresses `/fr/activites`, `/en/activites`, `/fr/activites/[slug]` et `/en/activites/[slug]`. Elle documente des activités tenues, réparties en cinq catégories : sessions de formation en ligne ; constitution des équipes et recherche ; concours de recherche et soumissions ; évaluation par le jury, limitée à ce qui peut être dit publiquement ; atelier de clôture en présentiel à Goma. Chaque fiche publiée a son adresse. Les statuts éditoriaux sont `draft`, `published` et `unpublished`. Seul `published` est visible. Un intervenant est réutilisable et peut être associé à plusieurs activités. Plusieurs photographies et plusieurs ressources peuvent être liées à une activité. L'original d'une image est conservé. Aucune transformation par intelligence artificielle, aucune modification de visage, aucun embellissement et aucun remplacement automatique ne sont appliqués. Une mise en forme d'affichage ne remplace pas le fichier déposé. La publication d'une photographie ou d'une biographie identifiable exige une autorisation enregistrée. Les pages publiques ne lisent ni les fiches participants, ni les présences, ni les notes du jury. Aucune activité, aucun intervenant, aucune biographie, aucune photographie, aucun effectif, aucun enregistrement et aucun résultat n'est inventé. Une activité prévue n'est pas présentée comme tenue. Le calendrier D-30 reste le calendrier officiel. |
| D-32 | Le pied de page, au même rang que les autres menus, la page Contact, l'accueil et la page Concours après les instructions exposent trois canaux directs, sans formulaire de contact. La lettre d'information du pied de page suit D-41. Le courriel mwatsimulamoolivier@gmail.com est un lien `mailto:`. Le profil https://x.com/OlivierMWATSIM1 s'ouvre dans un nouvel onglet, avec un libellé « Suivez-nous sur X » / « Follow us on X » et les attributs `noopener` et `noreferrer`. Le groupe WhatsApp a le libellé « Rejoindre notre groupe WhatsApp » / « Join our WhatsApp Group » et l'adresse https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ. Ces canaux sont ceux de l'équipe. Ils ne deviennent pas le nom d'une personne et ne publient pas les noms des personnes qui évaluent. |
| D-33 | Le menu Concours de l'en-tête regroupe les pages Concours, Évaluations (`/fr/evaluations`, `/en/evaluations`), Équipes participantes et Résultats. Résultats n'est plus un menu de premier niveau. Le pied de page Participer ne reprend que Concours et Résultats. La page Programme présente l'initiative, qui peut y prendre part et trois parcours combinables. Elle ne recopie pas les six phases. Le bouton de fin mène à la section `#home-phases` de l'accueil. La section publique s'appelle « Équipe » / « Team ». Une fiche n'apparaît que si le nom est fourni. Elle montre alors ce nom, la courte biographie dans la langue de la page, ou la phrase déjà approuvée si cette langue manque, et les contacts individuels fournis. Aucune fiche n'est inventée. Les six cartes sont dans `src/lib/organizer-team.ts`. Une photographie est un fichier déposé dans `public/equipe`, puis indiqué dans cette liste. L'administration ne saisit pas ces fiches et n'a pas d'écran Médiathèque. |
| D-34 | La page Équipes participantes existe aux adresses `/fr/equipes` et `/en/equipes`. Dès qu'une équipe est soumise correctement, elle y apparaît dans une fiche de même équilibre : nom, nombre de membres, prénoms, noms et rôles, puis le titre du sujet et le lien de l'article s'ils ont été publiés. Le nom d'utilisateur et le lien du profil Cardano Forum ne sont pas publics : ils restent pour les organisateurs. Aucun courriel. Aucune équipe n'est inventée. Une équipe suspendue ou rejetée n'y figure pas. Les règles d'équipe du guide y sont résumées. L'équipe du programme n'est pas répétée dans le guide Concours : elle reste sur Programme. Les trois premières places ne sont pas répétées sur cette page. Elles apparaissent en vert sur Résultats, seulement après saisie du jury (D-22). Cette page ne publie pas les notes. |
| D-35 | Le guide des participants du concours est publié pour les faits qu'il fixe. Le nom du site et le nom du programme sont ceux de D-40. Le concours n'est pas un hackathon : pas d'application, de prototype ni de smart contract. Il est soutenu par l'Impact Pot de Cardano. Une conclusion négative argumentée est valable. Le public éligible est celui du guide, sans expérience préalable exigée. Une personne ne rejoint qu'une équipe. Les membres du jury et de l'équipe organisatrice ne participent pas. Une équipe compte de 3 à 5 membres, avec un responsable principal. Le concours est maintenu à partir de cinq équipes inscrites. La conséquence d'un nombre inférieur, les heures, les montants en ADA, le nombre de mots, la langue imposée et le canal précis d'envoi du lien ne sont pas publiés. La soumission reste du 30 novembre au 13 décembre 2026. L'annonce des équipes sélectionnées, au plus cinq, est le 17 décembre 2026. L'atelier du 18 décembre 2026 a lieu à Bakanja, à Goma. L'heure et l'adresse précise restent non publiées. Le jury compte cinq membres. Les critères publiés sont, dans l'ordre, 25, 20, 20, 20 et 15 points. Les noms des jurés et les notes des équipes restent non publiés. Les passages du guide encore entre crochets ne sont pas affichés. |
| D-36 | La page Programme dit que l'initiative est soutenue et financée par le programme Impact Pot des Ambassadeurs Cardano. Elle ne la présente pas comme une action de la Cardano Foundation. Le programme est ouvert aux personnes qui résident partout en RDC. L'atelier du vendredi 18 décembre 2026 reste à Goma, sans heure ni adresse précise. Le site ne connecte pas de portefeuille. Les sessions et l'atelier mènent à Luma. Le concours mène au formulaire d'équipe de ce site et au guide. Tant que la notice A-13 n'est pas publiée, ce formulaire reste fermé. |
| D-37 | Le concours s'enregistre par équipe, pas par inscription individuelle. Le responsable remplit un formulaire unique : nom d'équipe, ville, puis prénom, nom, courriel et rôle de chaque membre. Le pays n'est pas demandé : il est enregistré comme la République démocratique du Congo. L'envoi public a lieu du 9 au 21 novembre 2026, et seulement si A-13 est publiée. Une soumission correcte rend publics le nom et le nombre de membres. Le responsable gère ensuite son équipe dans un espace privé. La constitution prévue par D-30 du 25 au 29 novembre 2026 reste une phase du programme : le responsable peut encore y ajuster les membres dans les limites 3–5. La soumission de l'article est distincte, du 30 novembre au 13 décembre 2026. Un transfert de responsabilité est encadré et journalisé. Si le code d'accès est perdu, le team leader contacte l'équipe. |
| D-38 | Pour la première édition, l'évaluation du jury ne se fait pas sur le site. Les équipes soumettent l'article ici. Les organisateurs vérifient le lien. Les articles vérifiés sont centralisés dans Google Sheets. Les jurés évaluent hors du site. Les organisateurs consolident, puis enregistrent et publient le résultat officiel sur le site (D-22). Pas d'espace juré, pas de moteur de notes, pas de consolidation dans le backend, pas de publication automatique des notes. Un futur import depuis Google Sheets devra être authentifié. Les notes individuelles restent confidentielles. Les critères du guide (D-35) ne sont pas recopiés dans une grille logicielle. |
| D-39 | Un seul compte ouvre l'administration. Le courriel et le mot de passe sont lus sur le serveur (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), jamais dans le dépôt ni dans le navigateur. Aucune page ne crée un second compte. La session dure huit heures, dans un cookie `httpOnly`. Une erreur ne dit pas lequel des deux champs est faux. L'interface d'administration est uniquement en français : `/en/admin` et ses sous-chemins redirigent vers le même chemin sous `/fr/admin`. Le site public reste bilingue. Les textes saisis sont en français et repris tels quels sur les deux langues publiques. |
| D-40 | Le site s'appelle « CIPot-DR Congo ». Le programme s'appelle « Cardano Learning & Research for Real Use Cases in Goma, DR Congo ». Les deux noms restent identiques en français et en anglais. Ils remplacent « Cardano Impact Pot – DR Congo 2026 » comme nom du site et comme nom du programme. Le soutien et le financement restent ceux de l'Impact Pot des Ambassadeurs Cardano (D-36). Le concours reste soutenu par l'Impact Pot de Cardano (D-35). |
| D-41 | Le site envoie des courriels depuis `annonces@cardanoimpactdrc.org`, uniquement côté serveur, par l'API Resend. `RESEND_API_KEY` reste hors du dépôt et du navigateur. Après un enregistrement réussi, le responsable reçoit le nom de l'équipe et le code ; chaque membre reçoit un courriel séparé, sans les adresses des autres ni le code. Un échec d'envoi ne défait pas l'équipe. La lettre publique, dans le pied de page, demande le courriel et un consentement. Elle confirme l'inscription et se désinscrit par un jeton dont seule l'empreinte est conservée. Un abonné actif n'est pas enregistré deux fois. Les désinscrits ne reçoivent pas les campagnes. L'administration française, sous `/fr/admin/communications`, choisit les responsables, les membres, les abonnés ou plusieurs de ces groupes, prévisualise le message, compte les destinataires sans doublon et peut reprendre un envoi en attente ou en échec, quinze courriels à la fois. Une publication d'annonce, d'activité ou de résultat reste enregistrée même si le courriel échoue. Aucune lettre n'est envoyée à une personne qui ne s'est pas inscrite, sauf les confirmations d'enregistrement et les groupes choisis explicitement par l'administrateur. Les listes, les courriels des membres et le journal ne sont pas publics. Chaque envoi part en HTML et en texte, avec le logo de A-12. Le bouton mène à une page déjà publiée. Le lien personnel de désinscription reste celui du courriel de confirmation d'abonnement. |

## Publics

- Visiteur : lit les pages publiques en français ou en anglais, y compris la liste des équipes soumises (nom et nombre de membres) et le décompte réel sur l'accueil.
- Responsable d'équipe : enregistre l'équipe, puis accède à un espace privé par vérification de son courriel. Il ne gère que son équipe.
- Membre : n'a pas d'espace sur ce site. Il crée son propre compte sur Cardano Forum. Ses données sont saisies par le responsable.
- Organisateur : se connecte avec le seul courriel et le seul mot de passe du serveur (D-39). Il publie le calendrier, les annonces, les activités, l'équipe, la galerie et le résultat, et envoie les courriels de D-41. Les noms des jurés ne sont pas saisis.

Aucune liste nominative de l'équipe n'est encore fournie. Les cartes prévues par D-33 restent vides. Les canaux de D-32 restent affichés comme contacts de l'équipe.

## Périmètre fonctionnel

Espace public :

- accueil ;
- présentation du programme ;
- calendrier ;
- inscription (Luma pour les sessions et l'atelier ; formulaire d'équipe pour le concours, fermé tant que A-13 manque) ;
- informations sur le concours de recherche ;
- équipes participantes, alimentées par les équipes soumises (D-34, D-37) ;
- page des évaluations, sans nom de juré, sans note et sans classement (D-33) ;
- page des résultats, vide tant que le jury n'a pas été saisi ;
- annonces ;
- activités réalisées, lorsque D-31 sera construit ;
- FAQ ;
- contact, avec les canaux de D-32 ;
- lettre d'information du pied de page (D-41).

Espace privé du responsable (documenté, non construit) :

- demande d'accès par courriel ;
- consultation et modification de sa seule équipe ;
- profils Cardano Forum des membres ;
- soumission de l'article pendant la période autorisée.

Espace privé des organisateurs :

- authentification des administrateurs ;
- gestion des équipes, des membres, des profils forum et des articles ;
- suspension ou rejet d'une équipe, avec justification ;
- historique des modifications ;
- gestion des annonces ;
- saisie des présences ;
- enregistrement du résultat officiel après consolidation hors site (D-38) ;
- gestion des activités documentées, des intervenants, des galeries et des ressources, sur invitation, lorsque D-31 sera construit ;
- export des données ;
- communications par courriel (D-41).

Hors périmètre tant qu'une demande écrite ne l'ouvre pas : application décentralisée, portefeuille Cardano, paiement, messagerie entre participants, compte classique par membre, espace de connexion des jurés, moteur de notation, consolidation des scores dans le backend, publication automatique des notes, synchronisation Google Sheets (prévue, non construite), CMS général des pages versionnées, application mobile, mode sombre, multilinguisme au-delà du français et de l'anglais, création automatique de comptes Cardano Forum, collecte du mot de passe forum, appel à une API du forum, formulaire public de contact, transformation d'images par intelligence artificielle. La lettre d'information suit D-41.

## Référence visuelle

https://www.chosenfintech.org/ sert à juger la tenue attendue : site d'organisation, lecture directe, navigation stable. Le bouton de thème observé sur cette référence ne fait pas partie de ce projet. Le fond du site est celui fixé par D-02, pas celui de la référence.

Ne pas reprendre ses textes, son identité, ses couleurs, ses images ni ses fichiers. Les couleurs imposées ici sont `#0033AD` et `#FFFFFF`. Le détail est dans `docs/DESIGN_SYSTEM.md`.

## Registre des hypothèses

Une hypothèse n'est pas un fait de programme. Le code peut préparer la proposition indiquée, à condition de garder l'identifiant visible dans la documentation. Si les organisateurs tranchent autrement, mettre à jour ce registre, le schéma, les exigences et les règles dans le même changement.

| ID | Proposition de travail | Conséquence concrète |
| --- | --- | --- |
| A-01 | Retenue par D-39. L'interface d'administration est uniquement en français. Le site public reste bilingue. | `/en/admin` redirige vers `/fr/admin`. |
| A-02 | Les URL publiques utilisent `/fr` et `/en`, avec les mêmes segments français. `/` redirige vers `/fr`. | Une seule arborescence de pages. |
| A-03 | Le formulaire d'équipe demande le nom de l'équipe et la ville, puis pour chaque membre prénom, nom, courriel et rôle, et, lorsque A-13 existe, l'acceptation de la notice. Le pays est enregistré comme la République démocratique du Congo, sans champ. Les champs forum et l'article sont absents de ce premier envoi. | Téléphone, organisation et profil d'activité ne sont pas demandés. Une modification ultérieure suit D-21. |
| A-04 | Un courriel normalisé correspond à un seul membre actif. Il ne peut pas figurer dans deux équipes. | Le formulaire refuse un doublon. Connaître ce courriel ne donne pas l'accès à l'espace du responsable (D-16). |
| A-05 | Les statuts sont ceux de `docs/DATABASE_SCHEMA.md`. | Les contraintes `check` portent ces valeurs tant qu'elles ne sont pas révisées. |
| A-06 | Remplacée par D-39. Conservée pour la trace. L'ancienne hypothèse créait les administrateurs dans Supabase Auth, puis une ligne `admin_profiles`. | L'accès retenu est le compte unique lu sur le serveur. |
| A-07 | Remplacée par D-34 et D-37. Conservée pour la trace. L'ancienne hypothèse d'une liste vide jusqu'à saisie manuelle, et de plusieurs équipes pour une même personne, n'est plus le fonctionnement. | La page publique lit les équipes `submitted`. |
| A-08 | Le formulaire public de contact n'est pas retenu. S'il l'était, D-28 exigerait un écran d'administration pour lire et traiter les messages. | La table et l'écran ne sont pas créés. Les coordonnées publiques ne s'affichent que si elles ont été fournies. |
| A-09 | Les présences se saisissent pour les activités marquées `records_attendance`. L'heure des séances dont la date est fixée par D-30 reste vide. | Aucun `starts_at` fabriqué pour le 23 novembre, le 24 novembre ou le 18 décembre 2026, ni pour une période de plusieurs jours. |
| A-10 | Les instants sont stockés en UTC. Lorsqu'une heure de Goma existe, elle s'affiche avec `Africa/Lubumbashi`. | Le fuseau de Kinshasa n'est pas utilisé pour l'atelier du 18 décembre 2026. |
| A-11 | La police du produit est Source Sans 3, graisses 400, 600 et 700, sous-ensembles `latin` et `latin-ext`. | Elle remplace Geist au moment de construire l'interface, via `next/font`. |
| A-12 | Le logo officiel fourni est `public/brand/logo.png`. Il s'affiche directement, sans cadre ni fond ajouté, dans l'en-tête, le pied de page et l'administration, à côté du nom « CIPot-DR Congo ». Les courriels de D-41 utilisent `https://www.cardanoimpactdrc.org/brand/logo.png`. | Le nom du site reste en texte. Aucun autre signe n'est inventé. |
| A-13 | La notice d'information des participants est rédigée par les organisateurs. | L'envoi d'une inscription de production est refusé tant que cette notice n'est pas publiée. |
| A-14 | Une équipe n'a pas encore de thématique obligatoire. | La colonne `primary_theme` n'est pas créée. |
| A-15 | Les neutres et les couleurs d'état de `docs/DESIGN_SYSTEM.md` complètent le bleu et le blanc imposés. | Ils sont des tokens d'interface, pas des faits de marque supplémentaires. |
| A-16 | Les paquets `@supabase/supabase-js` et `@supabase/ssr` sont ceux du guide App Router. Le navigateur ne reçoit que l'URL et la clé publishable ou anon. `SUPABASE_SERVICE_ROLE_KEY` reste serveur. Les lectures et écritures de données passent par le serveur (D-08). | Clients préparés. Connexion au projet vérifiée. Aucune table, aucune inscription, aucun compte administrateur. |
| A-17 | L'export est un CSV UTF-8 avec BOM, produit à la demande et non archivé. | Les colonnes sont celles de `docs/FUNCTIONAL_REQUIREMENTS.md`. |
| A-18 | La validation est écrite en TypeScript côté serveur. | Pas de bibliothèque de validation tant qu'elle n'est pas acceptée. |
| A-19 | Le volume attendu est celui d'une cohorte locale. | Filtres SQL simples, pas de moteur de recherche dédié. |
| A-20 | Fournie. L'organisateur a indiqué https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ. La valeur reste dans `src/lib/public-contact.ts` pour pouvoir être remplacée. | Le lien est affiché. Aucune autre URL n'est inventée. |
| A-21 | Nom, courte biographie et contacts individuels de chaque personne de l'équipe organisatrice. | Non fournis. `src/lib/organizer-team.ts` reste un tableau vide. Ne pas déduire un nom du courriel ni du profil X. |
| A-22 | L'espace du responsable est sous `/fr/equipe` et `/en/equipe`. L'ouverture exige le seul code d'accès en cours. | Segments hypothétiques, comme A-02. |
| A-23 | Deux équipes `submitted` ne partagent pas le même nom, comparé sans casse après trim. | Un nom libéré par un rejet peut être réutilisé. |

D-24 précise D-21. D-41 ajoute les courriels d'enregistrement, la lettre et les annonces administratives. D-37 remplace l'inscription individuelle au concours. D-38 précise D-25 pour la première édition. D-26 remplace l'ancienne rédaction de A-29, qui excluait les ex æquo. D-28 est une condition, pas une décision d'ouvrir le formulaire.

## Propositions examinées, non approuvées

Ces propositions ne contredisent pas les décisions retenues. Elles ne deviennent pas des décisions, parce qu'elles laissent des choix ouverts ou parce qu'elles ne font que répéter une hypothèse déjà écrite.

| Proposition | Lecture | Statut |
| --- | --- | --- |
| Routes publiques `/fr` et `/en` | Cohérent avec le français par défaut et l'anglais secondaire. Ne choisit ni les segments de chemin, ni la redirection de `/`. | Non approuvée. Reste l'hypothèse A-02. |
| Routes d'administration `/fr/admin` | D-39 retient l'administration en français et la redirection de `/en/admin`. Les segments publics restent l'hypothèse A-02. | Retenue pour la langue de l'administration par D-39. |
| Comptes administrateurs sur invitation | D-39 retient un seul compte, lu sur le serveur. L'invitation Supabase n'est pas le mode d'accès. | Remplacée par D-39. |
| Formulaire de contact public | La condition de gestion administrative est approuvée par D-28. L'ouverture du formulaire ne l'est pas. | Non approuvée. Reste l'hypothèse A-08. |

## Questions non résolues

- Le texte de la notice des participants (A-13). Tant qu'il manque, les inscriptions réelles restent fermées.
- Les critères et les pondérations du jury. D-25 autorise une note et des commentaires. Il ne fournit pas la grille.
- Le contenu de la procédure de départage. D-26 en exige une avant le début du concours, donc avant le 30 novembre 2026. Elle n'est pas écrite.
- L'heure des séances, le lien de connexion des formations, les intervenants et l'adresse du lieu à Goma. D-30 fixe les dates, pas ces détails.
- Le détail des activités de l'atelier du 18 décembre 2026. D-30 n'en publie aucune liste.
- Les hypothèses A-02 à A-05, A-09 à A-12 et A-14 à A-19, A-22 et A-23, dans les termes du registre ci-dessus. A-01 et A-06 sont réglées par D-39.
- Si un courriel d'une équipe rejetée peut rejoindre une autre équipe.
- Qui déclenche un transfert de responsabilité : seulement l'administrateur, ou aussi le responsable actuel.
- La durée de conservation des journaux d'activité et des jetons d'accès consommés.
- Le texte d'autorisation qui accompagnera la publication d'un portrait ou d'une biographie identifiable. D-31 exige l'autorisation. Il ne rédige pas ce texte.
- La taille maximale d'un fichier image original. Elle sera fixée au moment du stockage, pas avant.

## Prochaine étape recommandée

La connexion au projet Supabase est vérifiée. L'accès du team leader se fait par le code d'accès, que la page Inscription permet de copier après l'enregistrement. L'administration s'ouvre avec le compte unique de D-39. Le mot de passe de connexion peut être affiché ou masqué. Calendrier, annonces, activités, galerie et résultat s'enregistrent après le script `supabase/migrations/20261106021000_admin_editorial.sql`. Les photographies d'activités et de galerie restent dans `image_data`. Les photographies de l'équipe du programme sont des fichiers du dépôt. Il n'y a pas d'écran Équipe du programme ni de Médiathèque. Les équipes participantes viennent des tables déjà en place. Le formulaire d'inscription reste fermé tant que la notice A-13 n'est pas publiée.

Ne pas ouvrir les inscriptions publiques. Ne pas publier de résultat inventé. L'invitation WhatsApp fournie est affichée. Ne pas la remplacer par une autre adresse.
