# Exigences fonctionnelles

Comportement attendu de CIPot-DR Congo, site de Cardano Learning & Research for Real Use Cases in Goma, DR Congo. Les faits autorisés sont dans `docs/PROJECT_CONTEXT.md`. Le modèle de données est dans `docs/DATABASE_SCHEMA.md`. Les pages publiques existent. Les clients Supabase sont préparés. L'accès administrateur est le compte unique de D-39. Les écrans d'annonces, d'activités, d'équipe, de galerie, de calendrier et de résultats enregistrent dans les tables de `supabase/migrations/20261106021000_admin_editorial.sql`. L'administration reste en français.

## Principes transverses

| ID | Exigence |
| --- | --- |
| X-01 | Un visiteur découvre le programme. Les sessions et l'atelier s'inscrivent sur Luma. Le concours s'enregistre par équipe, sans compte membre (D-03, D-37). |
| X-02 | Chaque écran public existe en français et en anglais, avec les mêmes faits (D-06). |
| X-03 | Une information inconnue s'affiche comme non publiée. Elle n'est pas estimée (D-05). |
| X-04 | Les pages éditoriales viennent de fichiers versionnés. L'administration ne les réécrit pas (D-11). |
| X-05 | Les données personnelles ne sont lisibles que par un administrateur authentifié (D-08). |
| X-06 | Chaque écran qui charge ou envoie des données a un état vide, un état d'erreur et, s'il écrit, un état de succès. |
| X-07 | L'interface reste utilisable au clavier, avec des étiquettes visibles et un focus visible. |
| X-08 | Les largeurs 360, 768 et 1280 pixels conservent l'accès à la navigation, au contenu et aux actions. |

## Langue et adresses

Les préfixes publics `/fr` et `/en` sont l'hypothèse A-02. Ils ne sont pas une décision retenue. Le français reste la langue par défaut et l'anglais la langue seconde. L'administration est en français sous `/fr/admin` (D-39). Seul le plan d'adresses publiques ci-dessous est hypothétique. Il sert de plan de travail tant qu'il n'est pas contredit.

| URL | Page |
| --- | --- |
| `/` | Redirection vers `/fr` |
| `/fr`, `/en` | Accueil |
| `/fr/programme`, `/en/programme` | Programme |
| `/fr/calendrier`, `/en/calendrier` | Calendrier |
| `/fr/inscription`, `/en/inscription` | Inscription |
| `/fr/concours`, `/en/concours` | Concours |
| `/fr/equipes`, `/en/equipes` | Équipes participantes |
| `/fr/evaluations`, `/en/evaluations` | Évaluations |
| `/fr/equipe`, `/en/equipe` | Espace du responsable. Accès par le seul code remis à l'enregistrement |
| `/fr/resultats`, `/en/resultats` | Résultats |
| `/fr/annonces`, `/en/annonces` | Liste des annonces |
| `/fr/annonces/[slug]`, `/en/annonces/[slug]` | Annonce publiée |
| `/fr/activites`, `/en/activites` | Activités réalisées (D-31). Pages non construites |
| `/fr/activites/[slug]`, `/en/activites/[slug]` | Fiche d'une activité publiée (D-31). Pages non construites |
| `/fr/faq`, `/en/faq` | FAQ |
| `/fr/contact`, `/en/contact` | Contact |

Décision D-39. L'administration est en français et placée sous `/fr/admin`. Une visite de `/en/admin` et de ses sous-chemins redirige vers le même chemin sous `/fr/admin`. Le site public reste bilingue.

| URL | Écran |
| --- | --- |
| `/fr/admin/connexion` | Connexion |
| `/fr/admin` | Accueil de l'administration |
| `/fr/admin/equipes` | Équipes de recherche |
| `/fr/admin/equipes/[id]` | Fiche d'équipe |
| `/fr/admin/annonces` | Annonces |
| `/fr/admin/presences` | Présences |
| `/fr/admin/activites` | Activités documentées (D-31). Écran non construit |
| `/fr/admin/activites/[id]` | Édition, galerie, ressources et aperçu (D-31). Écran non construit |
| `/fr/admin/intervenants` | Intervenants réutilisables (D-31). Écran non construit |
| `/fr/admin/exports` | Exports |
| `/fr/admin/resultats` | Résultats du concours |

Le choix de langue est un bouton : globe, code `FR` ou `EN`, chevron. La liste ouverte affiche « FR Français » et « EN English ». Il conserve le chemin courant. `html lang` vaut `fr` ou `en`.

Chaque adresse du tableau est une page distincte. Ouvrir un lien charge cette page. Un accès direct et un rafraîchissement affichent son contenu. Le choix de langue mène à la page équivalente. Programme, Calendrier, Activités et FAQ sont des pages distinctes. Annonces et Contact se lisent dans le même document sombre. Concours, Évaluations, Équipes participantes et Résultats se lisent dans le guide à fond blanc. Ces menus ne se mélangent pas.

## Navigation approuvée

Français : Accueil, Programme, Calendrier, Activités, Concours, Évaluations, Équipes participantes, Résultats, Annonces, FAQ, Contact. Action : Inscription.

English : Home, Program, Schedule, Activities, Competition, Participating teams, Evaluations, Results, Announcements, FAQ, Contact. Action : Register.

Le lien Activités ouvre `/activites` dans la langue courante. C'est un menu de l'en-tête, placé avant Informations. Il n'est plus un sous-menu de Programme et il n'a pas de colonne dans le pied de page.

Le menu Concours, dans l'en-tête, contient Concours, Évaluations, Équipes participantes et Résultats (D-33, D-34). Équipes participantes ouvre `/equipes`. Elle liste les équipes `submitted` en fiches de même équilibre : nom, effectif, membres, puis le titre du sujet et le lien de l'article s'ils sont publiés. Le nom d'utilisateur et le lien du profil Cardano Forum restent pour les organisateurs. Elle n'affiche ni courriel ni note. Les trois premières places ne sont pas répétées ici : elles sont en vert sur Résultats. Évaluations ouvre `/evaluations`. Cette page reprend la phrase de la phase d'évaluation et n'affiche ni nom de juré, ni note, ni classement. Elle précise que l'évaluation de la première édition se fait hors du site (D-38).

Le pied de page reprend la phrase : « Les informations affichées sont celles publiées par les organisateurs. » / « The information shown is the information published by the organizers. » Il regroupe les parties du programme et le calendrier, sans feuille de route et sans équipe, puis Annonces et Contact, puis Inscription, Concours et Résultats. La FAQ est un petit menu de l'en-tête, placé avant le choix de langue. Équipes participantes, Évaluations et Activités restent dans l'en-tête et n'apparaissent pas dans le pied de page. Il ne contient pas le choix de langue ni de lettre d'information.

Il contient en outre la section « Contactez-nous » / « Contact Us » (D-32) :

| Canal | Français | English | Comportement |
| --- | --- | --- | --- |
| Courriel | mwatsimulamoolivier@gmail.com | mwatsimulamoolivier@gmail.com | Lien `mailto:mwatsimulamoolivier@gmail.com`, utilisable au clavier, sur grand et petit écran |
| X | Suivez-nous sur X | Follow us on X | Lien vers https://x.com/OlivierMWATSIM1, nouvel onglet, `rel="noopener noreferrer"`, icône X avec le libellé visible |
| WhatsApp | Rejoindre notre groupe WhatsApp | Join our WhatsApp Group | https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ, nouvel onglet, `rel="noopener noreferrer"`, icône WhatsApp avec le libellé visible |

Ces canaux sont des liens directs. Ils n'enregistrent rien. Ils ne remplacent pas la page Contact. Aucune dépendance d'icônes n'est ajoutée : les icônes sont des SVG locaux, sobres, avec un texte lisible à côté.

## Copie d'interface approuvée

Ces phrases sont autorisées parce qu'elles ne dépassent pas le dossier connu (D-12).

Présentation courte, français :

> Cardano Learning & Research for Real Use Cases in Goma, DR Congo est mené à Goma, en République démocratique du Congo. CIPot-DR Congo permet de comprendre ce programme, de s'inscrire, de recevoir les informations et d'en suivre l'avancement. Cardano Learning & Research for Real Use Cases in Goma, DR Congo explore la façon dont la blockchain pourrait contribuer à des défis concrets en RDC, notamment l'éducation, l'agriculture, les chaînes d'approvisionnement et la traçabilité, l'entrepreneuriat, l'inclusion financière, la certification et l'identité numérique, les services publics et l'assistance humanitaire.

Présentation courte, anglais :

> Cardano Learning & Research for Real Use Cases in Goma, DR Congo is based in Goma, in the Democratic Republic of the Congo. CIPot-DR Congo is for understanding this program, registering, receiving information, and following its progress. Cardano Learning & Research for Real Use Cases in Goma, DR Congo explores how blockchain could contribute to real challenges in the DRC, including education, agriculture, supply chains and traceability, entrepreneurship, financial inclusion, certification and digital identity, public services, and humanitarian assistance.

| Situation | Français | English |
| --- | --- | --- |
| Date inconnue | Date à confirmer | Date to be confirmed |
| Lancement et inscriptions | Lancement et inscriptions, du 9 au 21 novembre 2026. | Launch and registration, November 9–21, 2026. |
| Sessions de formation en ligne | Sessions de formation en ligne, du 23 au 24 novembre 2026. L'heure et le lien de connexion ne sont pas publiés. | Online training sessions, November 23–24, 2026. The time and the meeting link are not published. |
| Constitution des équipes | Constitution des équipes, du 25 au 29 novembre 2026. | Team formation, November 25–29, 2026. |
| Concours | Concours de recherche et soumission des articles, du 30 novembre au 13 décembre 2026, sur Cardano Forum, à l'adresse https://forum.cardano.org/. Les équipes y mènent leurs recherches et y publient leurs articles. | Research competition and article submission, from November 30 to December 13, 2026, on Cardano Forum, at https://forum.cardano.org/. Teams conduct their research and publish their articles there. |
| Évaluation par le jury | Évaluation par le jury, du 14 au 17 décembre 2026. Les noms des jurés et les notes ne sont pas publiés. | Jury evaluation, December 14–17, 2026. Jury names and scores are not published. |
| Atelier de clôture | Atelier de clôture en présentiel, le vendredi 18 décembre 2026, à Goma, en République démocratique du Congo. L'heure et l'adresse du lieu ne sont pas publiées. | In-person closing workshop on Friday, December 18, 2026, in Goma, Democratic Republic of the Congo. The time and the venue address are not published. |
| Inscription fermée | Les inscriptions ne sont pas encore ouvertes. La notice d'information des participants doit d'abord être publiée. | Registration is not open yet. The participant information notice must be published first. |
| Inscription enregistrée | Votre équipe a été enregistrée. Elle apparaît parmi les équipes participantes. | Your team has been recorded. It appears among the participating teams. |
| Concours sur le forum | Le concours de recherche a lieu sur Cardano Forum, à l'adresse https://forum.cardano.org/. C'est la plateforme officielle où les articles de recherche sont publiés et discutés. | The research competition takes place on Cardano Forum, at https://forum.cardano.org/. It is the official platform where research articles are published and discussed. |
| Inscription distincte | L'inscription sur ce site ne crée pas de compte Cardano Forum. Chaque personne qui participe au concours crée son propre compte sur le forum. Ce site ne demande jamais le mot de passe du forum. | Registration on this site does not create a Cardano Forum account. Each person who takes part in the competition creates their own forum account. This site never asks for the forum password. |
| Invitation forum | Chaque membre crée son propre compte sur Cardano Forum. Le responsable pourra indiquer plus tard le nom d'utilisateur et l'adresse publique du profil. | Each member creates their own Cardano Forum account. The team leader can later enter the username and the public profile address. |
| Forum enregistré | Les informations Cardano Forum ont été enregistrées. Les organisateurs ouvriront le profil public pour le vérifier. | The Cardano Forum details have been recorded. The organizers will open the public profile to verify it. |
| Compte forum incomplet | Le compte Cardano Forum est obligatoire pour participer au concours. Il ne l'est pas pour les sessions de formation en ligne ni pour l'atelier de clôture en présentiel. | A Cardano Forum account is required to take part in the research competition. It is not required for the online training sessions or the in-person closing workshop. |
| Équipes vides | Aucune équipe n'est encore enregistrée. | No team has been registered yet. |
| Accès responsable | Un lien ou un code à usage unique a été envoyé à l'adresse du responsable, s'il correspond à une équipe. | A single-use link or code has been sent to the team leader address, if it matches a team. |
| Présentation encouragée | Une présentation personnelle sur Cardano Forum est encouragée. Elle n'est pas exigée pour participer au concours. | A personal introduction on Cardano Forum is encouraged. It is not required to take part in the research competition. |
| Résultats non publiés | Les résultats du concours n'ont pas encore été publiés. | The competition results have not been published yet. |
| Nom d'utilisateur déjà utilisé | Ce nom d'utilisateur Cardano Forum est déjà associé à un autre membre. | This Cardano Forum username is already linked to another member. |
| Lien forum invalide | L'adresse doit être un lien public https vers forum.cardano.org. | The address must be a public https link to forum.cardano.org. |
| Courriel déjà ouvert | Cette adresse est déjà liée à une équipe. | This address is already linked to a team. |
| Annonces vides | Aucune annonce publiée pour le moment. | No announcement has been published yet. |
| FAQ vide | Les questions et réponses seront publiées lorsqu'elles auront été établies. | Questions and answers will be published once they have been established. |
| Contact sans coordonnées | Les coordonnées publiques n'ont pas encore été publiées. | Public contact details have not been published yet. |
| Activités vides | Aucune activité réalisée n'a encore été publiée. | No completed activity has been published yet. |
| Biographie absente dans la langue | La biographie n'est pas publiée dans cette langue. | The biography is not published in this language. |
| WhatsApp absent | Le lien d'invitation WhatsApp n'a pas encore été publié. | The WhatsApp invitation link has not been published yet. |

Titre de document : le titre de page, puis « CIPot-DR Congo ».

## Espace public

### PUB-01 Accueil

L'ouverture affiche le titre « Cardano Learning & Research for Real Use Cases in Goma, DR Congo » (D-40), puis la phrase « Un programme qui explore le potentiel de Cardano et de la blockchain face aux défis réels de la RDC, à travers l'apprentissage, la recherche et l'exploration de cas d'usage concrets. », puis « Découvrir le programme » et « S'inscrire au programme ». Ces éléments sont centrés sur l'image d'ouverture fournie. Les deux actions mènent au programme et à l'inscription. Sous cette ouverture : les six phases du calendrier officiel (D-30) sur une frise. Chaque phase porte sa date officielle et un état publié après validation explicite des organisateurs : à venir, en cours, faite ou reportée. L'état ne se déduit pas de la date civile. Lorsque les tables existeront, il sera lu dans `program_phases`. Les dates prévues restent celles de D-30, dans le contenu versionné. Tant qu'aucune validation n'est publiée, toutes les étapes restent à venir. Les titres mènent aux ancres du programme. Les formules complètes restent sur Programme, Calendrier et Feuille de route. Puis les six domaines d'exploration. Les autres pages s'ouvrent par la navigation.

N'affiche pas de partenaire, de citation ni de palmarès. Le seul chiffre d'équipes est le nombre réel d'équipes `submitted`, lu dans les données, ou rien si ce nombre est zéro. Aucun chiffre n'est inventé. L'image d'ouverture et la constellation de D-02 sont les seuls fonds visuels.

### PUB-02 Programme

Décrit les six phases de D-30, avec les formules approuvées du calendrier :

1. Lancement et inscriptions, du 9 au 21 novembre 2026.
2. Sessions de formation en ligne, du 23 au 24 novembre 2026. L'heure et le lien de connexion ne sont pas publiés. Aucun compte Cardano Forum n'est requis pour y participer.
3. Constitution des équipes, du 25 au 29 novembre 2026. L'enregistrement public a lieu du 9 au 21 novembre 2026 (D-37). Pendant cette phase, le responsable peut encore ajuster les membres, de 3 à 5. Les équipes `submitted` sont publiées sur `/equipes` avec le nom et le nombre de membres (D-34).
4. Concours de recherche et soumission des articles, du 30 novembre au 13 décembre 2026, sur Cardano Forum (https://forum.cardano.org/). Les équipes y mènent leurs recherches et y publient leurs articles (D-13).
5. Évaluation par le jury, du 14 au 17 décembre 2026. Les noms des jurés et les notes ne sont pas publiés. La page publique des résultats reste celle de D-22 : trois places, liens d'articles, annonces et résultat final, seulement après la saisie du jury.
6. Atelier de clôture en présentiel, le vendredi 18 décembre 2026, à Goma. L'heure et l'adresse du lieu ne sont pas publiées. Aucune activité supplémentaire n'est listée. Le site ne propose pas de portefeuille ni de transaction (D-04).

Présente les six domaines comme des sujets d'exploration, pas comme des résultats obtenus. Si l'éligibilité, le coût, la langue des sessions ou l'organisateur juridique ne sont pas dans le dossier, la page ne se prononce pas.

### PUB-03 Calendrier

Liste les six phases de D-30 dans l'ordre de PUB-02, en français et en anglais, avec les mêmes dates. Aucune de ces lignes n'utilise « Date à confirmer ». L'heure, le lien, les intervenants et l'adresse du lieu restent non publiés (A-09, A-10). Les séances opérationnelles créées plus tard dans l'administration, table `activities`, complètent cette page lorsqu'elles ont un titre dans la langue demandée et un état `confirmed`. Une séance `planned` dont la date est nulle reste formulée comme non confirmée. Une telle séance ne remplace pas le calendrier versionné. Les activités documentées de D-31 ont leurs propres pages. Elles ne réécrivent pas ces six lignes.

### PUB-04 Inscription

La page sépare Luma et le concours (D-14, D-37). Elle ouvre par deux phrases : on peut participer aux sessions en ligne, à l'atelier en présentiel à Goma et au concours ; les sessions et l'atelier s'inscrivent sur Luma, le concours se demande sur ce site. Trois cartes mènent à Luma : session 1 le 23 novembre 2026, session 2 le 24 novembre 2026, session en présentiel le 18 décembre 2026. Les liens s'ouvrent dans un nouvel onglet.

Le formulaire plus bas enregistre une équipe. Il n'existe pas d'inscription individuelle au concours. Il n'y a pas de cases d'intérêt.

Le responsable envoie :

| Champ | Contrainte |
| --- | --- |
| Nom de l'équipe | Obligatoire, 1 à 120 caractères après trim. Unique parmi les équipes `submitted` (A-23). |
| Ville | Obligatoire, 1 à 80 caractères |
| Pays | Obligatoire, 1 à 80 caractères |
| Membres | 3 à 5 lignes. Le responsable est l'une d'elles, rôle `leader`. |
| Prénom, nom, courriel de chaque membre | Obligatoires. Courriel unique (A-04). |
| Rôle | `leader`, `deputy` ou `member`. Un leader. Un adjoint au plus. |
| Acceptation de la notice | Obligatoire seulement lorsque A-13 est publiée. Absente tant que le texte n'existe pas. |

Les champs Cardano Forum et l'URL de l'article sont absents de cet envoi.

Période : du 9 au 21 novembre 2026. Hors de cette fenêtre, et tant que A-13 manque, le bouton reste inactif. L'action serveur refuse aussi ces cas. Les inscriptions réelles ne s'ouvrent pas dans cette phase.

Succès : formule « Inscription enregistrée ». Statut `submitted`. L'équipe apparaît sur `/equipes` et dans le décompte de l'accueil. Ce n'est pas une admission au palmarès.

Refus : champ invalide ; moins de 3 ou plus de 5 membres ; pas exactement un leader ; plus d'un adjoint ; courriel déjà lié à un membre actif ; nom d'équipe déjà soumis ; notice absente ou non acceptée ; échec d'enregistrement.

Le lien de D-24 n'est pas construit maintenant. Après validation, le responsable demandera un accès à `/equipe`. Jusque-là, un administrateur peut corriger une fiche.

Les sessions et l'atelier n'exigent pas de compte forum. Le concours l'exigera plus tard, dans l'espace du responsable (D-20).

### PUB-05 Concours

Explique que le concours de recherche et la soumission des articles ont lieu du 30 novembre au 13 décembre 2026 sur Cardano Forum, et que les équipes y mènent leurs recherches et y publient leurs articles. La section Cardano Forum décrit la plateforme communautaire, ce que l'on peut y publier, discuter et découvrir, et invite toute personne qui participe au concours à créer son propre compte sur https://forum.cardano.org/. Elle reprend ensuite les formules « Inscription distincte », « Compte forum incomplet », « Présentation encouragée » et « Invitation forum ».

Précise la distinction de D-20 et reprend la formule « Compte forum incomplet ». Chaque membre d'une équipe a son propre prénom, son nom, son courriel, son nom d'utilisateur, son URL de profil et son rôle. Le compte du responsable ne remplace pas celui des autres. L'équipe a exactement un responsable principal. Un adjoint est facultatif (D-17).

Une présentation personnelle est encouragée, avec la formule « Présentation encouragée ». Elle n'est pas une condition d'entrée (D-18).

Décrit les équipes comme enregistrées par le responsable, de 3 à 5 membres. La liste publique est `/equipes`. L'évaluation par le jury occupe du 14 au 17 décembre 2026 et se fait hors du site pour la première édition (D-38). Elle ne publie ni nom ni note. Les articles ne sont pas téléversés : le responsable dépose le lien du 30 novembre au 13 décembre 2026. Les liens vérifiés peuvent ensuite figurer sur la page des résultats (D-22).

La page du concours renvoie vers `/resultats`. Elle ne s'en sert pas pour afficher des lauréats.

### PUB-06 Résultats

Page publique `/fr/resultats` et `/en/resultats` (D-22).

Tant qu'aucun résultat n'est publié, elle affiche « Résultats non publiés ». Elle ne montre ni place, ni lauréat, ni note.

Après publication, elle affiche seulement :

1. l'équipe de la première place ;
2. l'équipe de la deuxième place ;
3. l'équipe de la troisième place ;
4. les liens d'articles rendus publics ;
5. le texte bilingue du résultat final ;
6. les annonces officielles déjà publiées, ou le lien vers leur liste.

Aucune note chiffrée n'apparaît.

### PUB-07 Annonces

La liste publique ne contient que les annonces `published` dont `published_at` est passé. Ordre : `published_at` décroissant. Une annonce sans texte dans la langue de la page n'est pas publiable (règle d'administration ADM-05).

La page de détail affiche le titre et le corps en texte échappé (D-07). Un slug inconnu ou non publié répond en 404, sans indiquer qu'un brouillon existe.

État vide : formule approuvée.

### PUB-08 FAQ

La page existe. Les questions établies à partir des faits du site sont dans `src/lib/public-data.ts`, en français et en anglais. Tant que cette liste est vide, la page affiche la formule approuvée. L'administration n'a pas d'écran FAQ (D-11).

### PUB-09 Contact

Affiche les trois canaux de D-32 : le courriel en lien `mailto:`, le profil X et le groupe WhatsApp. La formule « coordonnées non publiées » reste disponible pour un canal encore vide. Elle ne sert plus à masquer ces trois canaux.

Aucun formulaire n'est dessiné. Aucune lettre d'information n'est proposée.

Hypothèse A-08, non approuvée : un formulaire nom, courriel et message enregistrerait une ligne `contact_messages`. Le succès dirait : « Votre message a été transmis aux organisateurs. » / « Your message has been sent to the organizers. » Le message serait limité à 2 000 caractères et ne serait pas publié.

D-28 : ce formulaire n'est pas construit. S'il est retenu plus tard, l'administration doit pouvoir lire chaque message, le marquer comme lu et le conserver. Sans cet écran, le formulaire reste interdit. Les messages ne sont pas publics.

La page Contact, l'accueil et la page Concours après les instructions affichent le courriel, le profil X et le groupe WhatsApp. Le pied de page place « Contactez-nous » dans la même grille que les autres menus. Aucun nom de personne qui évalue n'est ajouté.

La section de l'accueil et du concours s'appelle « Équipe » / « Team » (D-33). Tant que A-21 n'a pas fourni de nom, aucune carte personnelle n'est affichée. La phrase affichée est : « Le nom, la courte biographie et les contacts de chaque personne ne sont pas encore publiés. Les canaux ci-dessous sont ceux de l'équipe. » / « The name, short biography, and contacts of each person have not been published yet. The channels below belong to the team. »

La page Programme répond à ce qu'est l'initiative, qui peut y prendre part et comment participer. Trois parcours — formations en ligne, concours, atelier à Goma — sont expliqués. Les sessions et l'atelier mènent à Luma. Le concours mène au formulaire d'équipe de ce site et à son guide. Le formulaire reste fermé tant que la notice A-13 n'est pas publiée. La fin de page mène à `#home-phases` sur l'accueil. Les six phases D-30 ne sont pas recopiées sur cette page.

### PUB-10 Activités réalisées

Décision D-31. Les pages publiques existent. Aucune activité, aucun intervenant et aucune image ne sont insérés pour les simuler. Le tableau des activités publiées reste vide tant que les organisateurs n'ont pas fourni de fiche. L'administration réelle et les tables Supabase ne sont pas construites.

La liste `/activites` présente uniquement des activités `published` dont la date réelle est déjà atteinte. Les catégories suivent l'ordre de D-30 :

1. Sessions de formation en ligne.
2. Constitution des équipes et recherche.
3. Concours de recherche et soumissions.
4. Évaluation par le jury.
5. Atelier de clôture en présentiel à Goma.

Une catégorie sans fiche publiée est omise. Dans une catégorie, l'ordre est `occurred_on` croissant. L'état vide utilise la formule « Activités vides ».

La fiche `/activites/[slug]` affiche, lorsqu'ils ont été saisis, le titre, le résumé, la description, la catégorie, la date réelle, le lieu ou le format en ligne, les intervenants autorisés, leurs biographies autorisées, leurs liens de profil, les photographies publiées, les points marquants, les ressources et les liens externes vérifiés. Chaque élément est facultatif, sauf le titre dans les deux langues, la catégorie et la date réelle, exigés pour publier.

Un slug inconnu, un brouillon ou une fiche `unpublished` répond en 404, sans révéler qu'un brouillon existe.

Règles de publication :

- le français et l'anglais décrivent les mêmes faits vérifiés ;
- une activité dont la date est future reste en brouillon ;
- le calendrier versionné de D-30 n'est pas réécrit par ces fiches ;
- la catégorie jury ne publie ni nom de juré, ni note, ni délibération ;
- la catégorie équipes ne publie ni courriel, ni nom de membre, ni présence ; la liste nominative des équipes reste `/equipes` (nom et effectif seulement) ;
- une ressource `forum_article` est un lien `https` vers `forum.cardano.org` ;
- une biographie n'est pas traduite automatiquement : si la langue de la page n'a pas de texte, la formule « Biographie absente dans la langue » est affichée ;
- une photographie publiée a une légende ou un texte alternatif dans la langue de la page ;
- l'image affichée peut être redimensionnée pour la page ; le fichier original reste inchangé.

Les pages ne lisent pas `team_members`, `attendance_records` ni les journaux d'équipe.

### PUB-11 Équipes participantes

Liste les équipes `submitted`, en fiches de même équilibre : nom, nombre de membres, prénoms, noms et rôles, puis le titre du sujet et le lien de l'article s'ils sont publiés. Le nom d'utilisateur et le lien du profil Cardano Forum restent pour les organisateurs. État vide : « Aucune équipe n'est encore enregistrée. » Aucun courriel. Une équipe `suspended` ou `rejected` n'apparaît pas. Les trois premières places suivent D-22 et n'apparaissent qu'une fois, en vert, sur Résultats. Le guide Concours ne contient pas la section Équipe du programme.

### PUB-12 Espace du responsable

L'accès, les profils Forum et l'article sont construits (A-22, D-21, D-24).

1. Dans Équipes participantes, le sous-onglet « Espace du team leader » / « Team leader space » explique cet accès et porte le bouton « Ouvrir l'espace du team leader » / « Open the team leader space ». Il mène à `/equipe`. Seul le team leader s'en sert.
2. À l'enregistrement, le code du team leader s'affiche une fois, avec un texte d'attention. L'ouverture demande ensuite ce seul code. Chaque code mène à son équipe. Il se réutilise jusqu'au 31 janvier 2027. Le code est conservé pour les organisateurs. S'il est perdu, le team leader contacte l'équipe. Aucun service d'e-mail. Une session limitée suit la validation. Pas de mot de passe membre. Le formulaire ne demande pas le pays : il est enregistré comme la République démocratique du Congo.
3. Une fois identifié, il consulte son équipe, change le nom, corrige les membres, ajoute ou retire dans la limite 3–5, désigne ou remplace l'adjoint, complète les profils forum (ensemble ou vides), voit ce qui manque, soumet ou remplace l'article du 30 novembre au 13 décembre 2026, et lit les statuts d'équipe, de complétude et d'article.
4. Il ne voit aucune autre équipe. Un transfert de responsabilité est demandé à l'administration, journalisé.
5. Si le courriel est perdu, seul un administrateur rétablit l'accès, après vérification, et journalise l'acte.

## Espace administrateur

### ADM-01 Authentification

Décision D-39.

- La page `/fr/admin/login` demande un courriel et un mot de passe. `/en/admin/login` redirige vers elle.
- Il n'existe qu'un compte. Aucune page ne le crée. Le courriel et le mot de passe sont `ADMIN_EMAIL` et `ADMIN_PASSWORD`, lus seulement sur le serveur.
- Le mot de passe compte au moins 8 caractères. Le courriel est comparé sans casse, après retrait des espaces.
- Une session absente, sur toute route d'administration autre que la connexion, renvoie vers la connexion de la même langue.
- Une session ouverte qui revient sur la connexion est renvoyée vers le tableau de bord.
- L'erreur affichée est « La connexion n'a pas abouti. » / « Sign-in did not succeed. » Elle ne dit pas lequel des deux champs est faux.
- Si le serveur n'a pas ces deux variables, ou si la clé de service manque pour signer la session, le message est « Le compte administrateur n'est pas encore configuré sur le serveur. »
- La session dure huit heures, dans le cookie `httpOnly` `cip-admin-session`. La déconnexion l'efface et revient à la connexion.
- Une session absente ne reçoit pas le contenu des écrans. Le message réservé est « Cet espace est réservé aux organisateurs. »
- Les formulaires Calendrier, Annonces, Activités, Galerie et Résultats écrivent dans Supabase et le site public relit ces tables. Le script à appliquer est `supabase/migrations/20261106021000_admin_editorial.sql`. Tant qu'il n'est pas appliqué, le formulaire dit que la table manque. Les photographies originales d'activités et de galerie sont les colonnes `image_data`. Les photographies de l'équipe du programme sont des fichiers du dépôt, indiqués dans `src/lib/organizer-team.ts`. Il n'y a pas d'écran Équipe du programme ni de Médiathèque. Les équipes participantes se lisent dans les tables déjà en place. Les noms des jurés ne sont pas saisis. La connexion admin affiche ou masque le mot de passe. Le code d'accès montré au team leader après l'inscription a un bouton Copier.

### ADM-02 Équipes

Liste : nom, ville, pays, statut `submitted` / `suspended` / `rejected`, nombre de membres, complétude calculée, état de l'article, date d'envoi. Recherche par nom d'équipe, courriel de membre ou nom de membre (A-19). Filtres : statut d'équipe, profils forum, article.

La fiche privée montre tous les membres, les profils forum, l'article courant, l'historique de vérification, le journal. L'organisateur peut corriger les champs, vérifier un profil (`verified` ou `mismatch`) en ouvrant le lien public, vérifier un article (`verified` ou `correction_requested`), suspendre ou rejeter avec justification, rétablir un accès responsable, transférer le rôle `leader`. Chaque acte est journalisé.

L'ajout d'un membre respecte 3–5, l'unicité du courriel, un seul leader, un adjoint au plus. Le forum n'est pas exigé pour ajouter. L'équipe n'est « prête » que lorsque tous les profils actifs sont `verified`.

Pas de suppression physique d'une équipe soumise.

### ADM-03 Accès du responsable

L'administrateur peut envoyer un nouveau défi à l'adresse actuelle du leader, ou, après vérification, changer cette adresse puis envoyer le défi. L'acte est journalisé. Il n'existe pas de mot de passe membre.

### ADM-04 Articles

Sur la fiche d'équipe : titre, URL, date de soumission, statut, historique. Ouvrir le lien. Marquer `verified` ou `correction_requested`. Un lien soumis n'est pas validé tout seul. Pas de fichier. Pas de notation.

### ADM-05 Annonces

Créer un brouillon avec slug, titre français, titre anglais, corps français et corps anglais. Le slug ne contient que des minuscules, des chiffres et des traits d'union.

`published` n'est accepté que si les quatre textes sont remplis et si `published_at` est renseigné. `archived` disparaît de la liste publique et conserve la fiche. Le corps reste du texte brut (D-07).

### ADM-06 Présences

Choisir une activité dont `records_attendance` est vrai. Pour chaque membre d'équipe concerné, saisir `expected`, `present`, `absent` ou `excused` (A-05). Une seule ligne par couple activité / membre. La saisie enregistre l'administrateur et l'instant.

L'atelier du vendredi 18 décembre 2026 peut être créé comme activité `workshop`, titre bilingue, `starts_at` nul tant que l'heure n'est pas connue (A-09). Il en va de même pour les sessions du 23 et du 24 novembre 2026. Le calendrier public continue d'afficher les dates de D-30 par le contenu versionné, sans transformer une date civile en minuit.

Les sessions de formation et le concours ne reçoivent une présence que si les organisateurs créent l'activité et l'y autorisent.

### ADM-07 Exports

Hypothèse A-17. Un administrateur télécharge un CSV UTF-8 avec BOM, généré à la demande, sans stockage.

| Export | Colonnes |
| --- | --- |
| Équipes | `team_name`, `team_status`, `city`, `country`, `member_count`, `submitted_at` |
| Membres | `team_name`, `given_name`, `family_name`, `email`, `member_role`, `forum_username`, `forum_profile_url`, `forum_status` |
| Articles | `team_name`, `title`, `url`, `article_status`, `submitted_at` |
| Présences | `activity_title_fr`, `given_name`, `family_name`, `email`, `attendance_status`, `recorded_at` |

`member_role` vaut `leader`, `deputy` ou `member`. L'export ne contient aucune note de jury.

Le fichier ne contient pas de note interne, de message de contact ni d'identifiant de session. Le nom du fichier commence par `cardano-impact-pot-`, puis le type et la date UTC `YYYYMMDD`.

### ADM-08 Accueil administrateur

Affiche cinq décomptes réels : équipes `submitted`, équipes dont la complétude n'est pas prête, articles `submitted` non vérifiés, annonces `published`, membres au profil forum autre que `verified`. Liens vers Équipes, Annonces, Présences, Résultats et Exports. Aucun lauréat.

### ADM-09 Résultats du concours

Écran réservé aux organisateurs, sous `/fr/admin/resultats` (D-22).

- Aucune ligne n'est présente au départ. L'écran vide reprend « Résultats non publiés ».
- L'organisateur saisit au plus trois places, 1, 2 et 3, chacune pour une équipe distincte, seulement après l'évaluation. Il ne crée pas ces lignes avant la fin du jury.
- D-26 : un ex æquo reste possible. Le logiciel ne choisit pas un vainqueur. La publication est aussi refusée si la procédure de départage n'a pas été approuvée avant le concours, ou si un ex æquo constaté n'a pas été tranché par les organisateurs selon cette procédure.
- La publication est refusée tant que les trois places ne sont pas remplies.
- Un texte bilingue accompagne le résultat final. Les deux langues sont requises pour publier, comme pour une annonce.
- `published` enregistre l'organisateur et l'instant. Avant cela, la page publique ne montre aucune place.
- Les liens d'articles affichés avec le résultat sont ceux déjà marqués `verified` et rendus publics.
- Les notes chiffrées ne sont pas sur le site (D-38). L'écran n'offre ni saisie de note, ni import Google Sheets dans cette phase. Après consolidation hors site, l'organisateur saisit seulement le résultat officiel à publier.

### ADM-10 Activités, intervenants et médias

Écrans réservés aux organisateurs invités, sous la même authentification que le reste de l'administration (A-01, A-06). Ils ne sont pas construits dans cette phase. Ils ne créent aucun compte public.

L'accueil administrateur gagnera un lien « Activités » à côté des liens déjà prévus. Les cinq décomptes de ADM-08 restent inchangés.

Liste des activités documentées : titre français, catégorie, date réelle, statut. Filtres par catégorie et par statut. Création et édition d'une fiche : titres, résumés, descriptions et points marquants en français et en anglais, catégorie, date de début réelle, date de fin facultative, format `online` ou `in_person`, lieu bilingue facultatif, slug.

Intervenants : fiche réutilisable avec nom, fonction bilingue, biographie bilingue, organisation, URL publique `https`, langue d'affichage préférée `fr` ou `en`, portrait. Une fiche peut être associée à plusieurs activités, avec un rôle bilingue facultatif et un ordre. Aucune fiche n'est créée automatiquement. Le nom n'apparaît sur une page publique que si l'association porte l'autorisation de publication. La biographie et le portrait exigent chacun leur autorisation. Sans ce texte d'autorisation, encore non rédigé, l'écran peut enregistrer le refus par défaut et bloquer la publication du portrait ou de la biographie.

Galerie : plusieurs images par activité, légende bilingue, texte alternatif bilingue, ordre, statut `draft`, `published` ou `unpublished`. Le fichier déposé est l'original. L'écran ne propose pas de transformation automatique. Une image où des personnes sont reconnaissables ne passe à `published` que si l'autorisation est enregistrée.

Ressources : titre bilingue, URL `https`, ordre, type `presentation`, `recording`, `forum_article` ou `external`. Un article de forum est limité à `forum.cardano.org`.

Aperçu : les deux langues, dans l'administration, sans rendre le slug public.

Publication : `draft` vers `published`, puis `published` vers `unpublished`, puis retour possible vers `published`. `published` exige les deux titres, la catégorie, la date réelle, et une date réelle déjà atteinte. `unpublished` disparaît du public et conserve la fiche. Le passage à `published` ou à `unpublished` demande une confirmation en mots, avec le titre français.

L'écran ne propose pas d'importer des présences, des membres ou des notes de jury.

## Critères d'acceptation communs

Une exigence est satisfaite lorsque :

1. le français et l'anglais publics disent la même chose ;
2. aucun fait absent de `docs/PROJECT_CONTEXT.md` n'a été ajouté ;
3. les états vide, erreur et succès sont visibles ;
4. la page se parcourt au clavier et sur les trois largeurs de contrôle ;
5. une personne non authentifiée ne peut lire ni les membres, ni les courriels, ni les brouillons, ni les présences, ni les messages, ni les activités documentées non publiées, ni les portraits et biographies sans autorisation ;
6. les hypothèses utilisées sont encore celles du registre, ou le registre a été mis à jour.
