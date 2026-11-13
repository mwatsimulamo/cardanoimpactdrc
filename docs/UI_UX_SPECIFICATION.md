# Spécification d'interface

Plan d'écran de CIPot-DR Congo, site de Cardano Learning & Research for Real Use Cases in Goma, DR Congo. Ce document ne construit aucune page. Il s'appuie sur `docs/PROJECT_CONTEXT.md`, `docs/FUNCTIONAL_REQUIREMENTS.md`, `docs/DESIGN_SYSTEM.md` et `docs/DATABASE_SCHEMA.md`.

Les adresses publiques `/fr` et `/en` restent l'hypothèse A-02. Elles servent de plan de travail. L'administration est en français sous `/fr/admin` (D-39).

## Lecture de la référence

https://www.chosenfintech.org/ a été observé comme référence de tenue, pas comme modèle à recopier.

Ce qui éclaire notre plan :

- L'en-tête est fixe. Le nom de l'organisation reste visible. La page courante est marquée.
- Sur une largeur étroite, la navigation se replie derrière un contrôle.
- L'ouverture de page nomme l'organisation et propose peu d'actions.
- Le contenu suit des sections : un titre, une phrase d'introduction, puis le corps.
- Les éléments répétés, comme les événements, forment une liste de titres et de courts textes, chacun menant à une page.
- Le pied de page regroupe des liens et une ligne de contact.
- La police de la référence est une seule sans-serif. Les interactions visibles sont le survol et le changement de page, pas une animation de scène.
- Le passage d'une largeur étroite à une largeur large change la barre de navigation sans changer le sens du contenu.

Ce qui n'est pas repris :

- Le logo, les couleurs, les photos, les textes et les réseaux de la référence. Le fond à motif de la référence n'est pas repris : le fond du site est la constellation de D-02.
- La barre flottante en capsule et les pastilles très arrondies.
- Le bouton de thème. D-02 fixe le fond sombre actuel. Il n'y a pas de bascule clair / sombre.
- Les compteurs, les logos de partenaires, les citations et les formules promotionnelles (D-05).
- Aucune adresse, aucun courriel et aucun réseau qui ne figure pas dans D-32. Le courriel, le profil X et le groupe WhatsApp y sont approuvés.

Notre barre est un rectangle `#0033AD`, haut de 80 pixels, sans rayon. Le nom, les menus et Inscription tiennent sur une seule ligne, du bord gauche au bord droit.

## Identité appliquée

| Élément | Règle |
| --- | --- |
| Bleu | `#0033AD` |
| Blanc | `#FFFFFF` |
| Neutres et états | Palette A-15, encore hypothétique |
| Police | Source Sans 3, graisses 400, 600 et 700 (A-11), encore hypothétique |
| Langue | Français par défaut, anglais secondaire, mêmes faits (D-06) |
| Forme | Rayon de 2 pixels sur les contrôles, angles droits sur les blocs, bordure de 1 pixel, pas d'ombre décorative |
| Mouvement | Changement de couleur en 150 ms au survol et au focus. Pas d'entrée animée |

Les noms « CIPot-DR Congo » et « Cardano Learning & Research for Real Use Cases in Goma, DR Congo » ne sont pas traduits (D-01, D-40).

## Plan du site

Plan de travail sous A-02. Une adresse entre parenthèses est une répartition proposée, pas une page déjà exigée.

### Public

| Écran | Adresse de travail | Statut |
| --- | --- | --- |
| Accueil | `/fr`, `/en` | Exigé |
| L'initiative | Section de l'accueil et du programme. Page séparée non retenue | Proposition d'écran, pas une route approuvée |
| Programme | `/fr/programme` | Exigé |
| Calendrier | Section `#home-phases` de l'accueil | Plus de page `/calendrier` séparée ; l'admin conserve `/fr/admin/calendrier` |
| Formations en ligne | Section du programme et ligne du calendrier | Pas une route séparée tant qu'elle n'est pas approuvée |
| Concours | `/fr/concours` | Exigé |
| Équipes participantes | `/fr/equipes` | Exigé par D-34. Fiches de même équilibre : nom, effectif, membres, titre et lien d'article s'ils sont publiés. Le profil Forum des membres reste pour les organisateurs. |
| Évaluations | `/fr/evaluations` | Exigé par D-33. Sans nom de juré, sans note et sans classement |
| Participation en équipe | Section du concours et page `/equipes` | Données personnelles hors public |
| Inscription | `/fr/inscription` | Exigé |
| Annonces | `/fr/annonces`, `/fr/annonces/[slug]` | Exigé |
| Activités | `/fr/activites`, `/fr/activites/[slug]` | Exigé par D-31. Pages publiques construites, liste vide. Les équivalents anglais utilisent `/en` |
| Résultats | `/fr/resultats` | Exigé |
| FAQ | `/fr/faq` | Exigé |
| Contact | `/fr/contact` | Exigé. Canaux de D-32. Le formulaire reste A-08 |

Le pied de page est commun à toutes les pages publiques.

### Administration

Décision D-39 : interface en français, sous `/fr/admin`. Une visite de `/en/admin` redirige vers le même chemin en `/fr/admin`. Il n'y a pas de choix de langue dans cet espace. Le site public reste bilingue.

| Écran | Adresse de travail |
| --- | --- |
| Connexion | `/fr/admin/connexion` |
| Tableau de bord | `/fr/admin` |
| Équipes | `/fr/admin/equipes` |
| Fiche d'équipe | `/fr/admin/equipes/[id]` |
| Annonces | `/fr/admin/annonces` |
| Présences | `/fr/admin/presences` |
| Activités documentées | `/fr/admin/activites`, `/fr/admin/activites/[id]` |
| Intervenants | `/fr/admin/intervenants` |
| Résultats et évaluation | `/fr/admin/resultats` |
| Exports | `/fr/admin/exports` |

ADM-03 décrit l'accès du responsable, pas un écran d'inscriptions individuelles.

L'écran des messages de contact n'existe que si A-08 est un jour approuvée. D-28 l'exigerait alors à côté des autres écrans.

L'écran Activités enregistre une date, un texte français et une photographie. La galerie publique reçoit ses propres images et descriptions. Ces originaux restent dans la base. Les cartes de l'équipe du programme, y compris les rôles de formateur et de jury déjà fournis, viennent du code. Leur photographie est un fichier local. Il n'y a pas d'écran Équipe du programme ni de Médiathèque. Les noms des jurés ne sont pas saisis.

## Navigation

### Publique

Français : Accueil, Programme, Calendrier, Activités, Concours, Évaluations, Équipes participantes, Résultats, Annonces, FAQ, Contact. Action séparée : Inscription.

English : Home, Program, Schedule, Activities, Competition, Participating teams, Evaluations, Results, Announcements, FAQ, Contact. Action : Register.

Le menu Programme reprend quatre parties : « C'est quoi ce programme ? », « Comment y participer ? », « Calendrier » vers « Et maintenant, quelles sont les prochaines étapes ? », puis « Équipe ». Activités est un menu propre, avant Informations. La FAQ est un petit menu placé avant le choix de langue, hors du menu Informations. Évaluations, Équipes participantes et Résultats se placent dans le menu Concours, après Concours (D-33, D-34).

Le choix de langue est un bouton avec un globe, le code courant et un chevron. Il ouvre « FR Français » et « EN English ». Il conserve le chemin. `html lang` suit la locale.

La page courante porte `aria-current="page"` et une petite case blanche sous le libellé.

Ouvrir Programme, Concours, Activités ou Informations n'affiche que les liens de ce menu. Échap ou un clic à l'extérieur ferme la liste. Programme, Calendrier et FAQ sont des pages distinctes. Annonces et Contact se suivent dans le même défilement. Activités et Galerie se suivent dans le même défilement. Dans le guide Concours, le sommaire à gauche place les explications sous Concours, et Évaluations, Équipes participantes et Résultats au même niveau. On passe de l'une à l'autre en défilant.

Sous 1120 pixels, les liens passent dans un panneau ouvert par le bouton « Menu », refermé par « Fermer ». Ce panneau défile à l'intérieur de l'écran : Accueil, Programme, Concours, Activités et Informations restent accessibles sans revenir en haut. L'action Inscription reste visible à côté de ce bouton.

### Administration

Liens après connexion : Tableau de bord, Participants, Inscriptions, Équipes, Annonces, Présences, Activités, Intervenants, Résultats, Exports. Action : Se déconnecter. Activités et Intervenants suivent D-31 et ne sont pas encore des écrans.

La connexion n'apparaît pas dans ce menu. Sous 768 pixels, le même principe « Menu » / « Fermer » s'applique. Les libellés restent des mots, pas des icônes seules.

## Composants communs

| Composant | Rôle |
| --- | --- |
| Barre publique | Nom en texte, « Goma · 2026 », navigation, langue, action Inscription |
| En-tête | Barre rectangulaire `#0033AD`, menus Programme, Concours, Activités et Informations, petit menu FAQ avant le choix de langue, interrupteur visible par le code courant. Le menu Programme suit les parties de la page. Le menu Concours contient Concours, Évaluations, Équipes participantes et Résultats. |
| Pied de page | Fond `#0033AD`, sans langue et sans lettre d'information. Programme sans accueil, sans feuille de route et sans équipe. Pas de colonne Activités. Pas de menu Informations. Concours et Résultats dans Participer. Équipes participantes et Évaluations n'y figurent pas. Section Contactez-nous selon D-32. Bas de page : cardanoimpactdrc © 2026, tous droits réservés, et le crédit vers https://github.com/mwatsimulamo. |
| Bouton principal | Fond `#0033AD`, texte blanc, libellé explicite |
| Bouton secondaire | Fond blanc, bordure `#D5DCE6` |
| Champ | Étiquette au-dessus, mot « obligatoire » dans l'étiquette si le champ l'est, erreur reliée par `aria-describedby` |
| Message | Bande à bordure, texte d'état, sans emoji |
| Liste de faits | Titre court et une ou deux phrases. Pas de carte illustrée |
| Tableau admin | Texte `0.875rem`. Sous 768 pixels, chaque ligne devient une liste libellé / valeur |
| Lien externe | `forum.cardano.org` s'ouvre dans un nouvel onglet avec un libellé qui le dit |

## États transverses

| État | Comportement |
| --- | --- |
| Chargement | Le titre de page est déjà là. La zone de données affiche « Chargement. » et `aria-busy="true"`. Pas de squelette décoratif |
| Vide | Une phrase approuvée, puis l'action utile s'il y en a une |
| Succès | Bande verte et message approuvé. Le succès d'inscription ne dit pas que la demande est acceptée |
| Erreur de champ | Texte sous le champ, en `#8E1B2C`, relié au champ |
| Erreur d'envoi | « La demande n'a pas été envoyée. Vous pouvez réessayer. » / « The request was not sent. You can try again. » |
| Erreur de lecture | « Les informations n'ont pas pu être chargées. » / « The information could not be loaded. » et un bouton « Réessayer » |
| Page inconnue | Titre « Page introuvable. » et lien vers l'accueil. Un brouillon d'annonce ne se révèle pas par ce message |
| Interdit | « Cet espace est réservé aux organisateurs. » sans donnée |

## Accessibilité

- Contraste WCAG 2.2 AA, comme dans le système de design.
- Tout le parcours au clavier. L'ordre de tabulation suit l'ordre visuel.
- Focus visible : anneau `#0033AD` décalé de 2 pixels, ou `#1B2430` sur un bouton bleu.
- Cibles d'au moins 44 pixels de haut.
- Chaque membre du formulaire d'équipe a des champs étiquetés. Le rôle est une liste, pas un pictogramme seul.
- La langue de la page est celle du contenu.
- Une date sans heure ne reçoit pas d'heure inventée.
- Les notes du jury et les données personnelles ne sont pas dans une page publique.

## Parcours du participant

```text
Découvrir
  → Comprendre le programme
    → Sessions et atelier : s'inscrire sur Luma
    → Concours : le responsable enregistre l'équipe (3 à 5 membres)
      → L'équipe apparaît (nom et effectif)
        → Le responsable complète les profils forum, puis l'article
          → Suivre les annonces
            → Lire les résultats après leur publication
```

L'inscription Luma, l'enregistrement d'équipe et le compte Cardano Forum sont trois actes distincts (D-14, D-37).

| Étape | Ce que la personne peut faire | Ce que cela ne fait pas |
| --- | --- | --- |
| Découvrir | Lire l'accueil et le décompte réel d'équipes | Voir des noms de membres |
| Comprendre | Lire le programme, le calendrier officiel (D-30) et le concours | Inventer une heure, un lien, un intervenant ou une adresse |
| Sessions / atelier | S'inscrire sur Luma | S'inscrire au concours |
| Concours | Le responsable enregistre toute l'équipe | Créer un compte par membre, ni un compte forum |
| Liste publique | Voir le nom et le nombre de membres | Voir courriels ou profils |
| Profils forum | Les créer sur https://forum.cardano.org/, les saisir plus tard dans l'espace du responsable | Les faire créer par ce site |
| Article | Le responsable dépose le lien du 30 novembre au 13 décembre 2026 | Valider automatiquement l'article |
| Suites | Lire les annonces et, après publication, les résultats | Voir des notes de jury |

Les sessions et l'atelier n'exigent pas de compte forum. Le concours l'exige pour chaque membre avant que l'équipe soit prête (D-20).

Tant que la notice A-13 n'existe pas, le bouton d'enregistrement d'équipe reste inactif.

### Compte forum après l'enregistrement

Chaque membre crée son compte sur https://forum.cardano.org/. Ce site ne le crée pas. Les champs ne sont pas sur le formulaire initial. Le responsable les saisit dans son espace, après D-24. Un administrateur peut aussi les corriger.

## Écrans publics

Chaque écran existe en français et en anglais. Le contenu anglais dit les mêmes faits. Les formules citées viennent des exigences fonctionnelles.

### Accueil

But : dire ce qu'est l'initiative et ouvrir les pages utiles.

Ouverture, sous la barre, centrée dans l'image :

1. Titre : « Cardano Learning & Research for Real Use Cases in Goma, DR Congo », en blanc, graisse 700, sur deux ou trois lignes (D-40).
2. Phrase : « Un programme qui explore le potentiel de Cardano et de la blockchain face aux défis réels de la RDC, à travers l'apprentissage, la recherche et l'exploration de cas d'usage concrets. » En anglais : « A program that explores the potential of Cardano and blockchain in the face of real challenges in the DRC, through learning, research, and the exploration of concrete use cases. » Couleur `#8EAFFF`.
3. Action : « Découvrir le programme », fond blanc, texte `#001C5C`, vers la page Programme. En anglais : « Discover the program ».
4. Action : « S'inscrire au programme », fond `#0033AD`, texte blanc, vers la page Inscription. En anglais : « Register for the program ».

Les deux boutons sont côte à côte à partir de 768 pixels, empilés en dessous. L'action de la barre reste le libellé de navigation « Inscription ». Le fond de l'ouverture reste l'image fournie et le voile sombre. La constellation de D-02 n'est pas retirée.

Sous l'ouverture :

1. Six phases de D-30, en frise verticale, cartes alternées à partir de 768 pixels. Chaque carte porte le numéro, l'état, le titre et la date officielle. L'état vient des validations organisateur : à venir, en cours, faite ou reportée. Il n'est pas calculé à partir de la date. Le repère sur la ligne est plein pour une phase faite ou en cours, bordé pour une phase reportée, et vide pour une phase à venir. Les formules longues restent sur Programme, Calendrier et Feuille de route. Dates : lancement et inscriptions du 9 au 21 novembre 2026 ; sessions de formation en ligne du 23 au 24 novembre 2026 ; constitution des équipes du 25 au 29 novembre 2026 ; concours et soumission des articles du 30 novembre au 13 décembre 2026 ; évaluation par le jury du 14 au 17 décembre 2026 ; atelier de clôture en présentiel le vendredi 18 décembre 2026 à Goma.
2. Six domaines, comme sujets d'exploration : éducation, agriculture, entrepreneuriat, traçabilité, certification, inclusion financière.

Aucun témoignage, aucun partenaire et aucune réalisation inventée. Le seul chiffre d'équipes, s'il est supérieur à zéro, est le nombre réel d'équipes `submitted`. S'il est zéro, le bloc n'est pas affiché.

Composants : barre, ouverture centrée, deux boutons, liste de six phases, liste de six domaines, pied.

Interactions : chaque adresse est une page. Le menu ouvre cette page. Une petite case blanche marque le menu correspondant, au bas de la barre. L'accès direct et le rafraîchissement affichent la page demandée. Le choix de langue conserve le chemin.

Responsive : le titre passe de `2.25rem` à `2.75rem`. Le texte suit la largeur de contenu, au plus `72rem`.

États : l'ouverture est du contenu versionné. Elle n'a pas d'état vide.

La liste d'annonces décrite plus bas n'est pas dans cet écran tant qu'elle n'est pas approuvée.

### L'initiative

But : regrouper les faits connus sur l'organisation du programme, sans page biographique.

Ce n'est pas une route séparée dans le périmètre actuel. Le contenu tient dans l'accueil et le programme :

- le nom et le lieu, Goma, République démocratique du Congo ;
- le rôle du site : comprendre, s'inscrire, recevoir les informations, suivre l'avancement ;
- l'existence d'un espace privé pour les organisateurs, sans en montrer les données ;
- l'absence de liste de partenaires et de témoignages. Le décompte d'équipes suit D-05 révisée.

Aucune histoire d'organisation, aucun nom de responsable et aucun logo tiers ne sont ajoutés. Une page « À propos » séparée demanderait une approbation.

### Programme

But : présenter les six phases de D-30 et mener au calendrier et à l'inscription.

Hiérarchie :

1. Titre « Programme ».
2. Les six phases, dans l'ordre de D-30, avec les formules bilingues approuvées.
3. Pour les sessions de formation, la phrase qui dit qu'aucun compte Cardano Forum n'est requis.
4. Pour la constitution des équipes, le rappel du responsable principal unique et de l'adjoint facultatif, sans liste d'équipes.
5. Pour l'évaluation par le jury, le rappel que les noms, les places et les notes ne sont pas affichés avant la publication des résultats.
6. Pour l'atelier du vendredi 18 décembre 2026, la date, Goma, et l'absence d'heure et d'adresse. Aucune activité supplémentaire n'est listée.
7. Phrase sur les six domaines, comme exploration et non comme résultats obtenus.
8. Lien « Calendrier » et bouton « Inscription ».
9. Renvoi vers le concours pour la condition du compte forum.

Le coût, l'éligibilité, la langue des sessions et l'organisateur juridique ne sont pas affichés, parce qu'ils ne sont pas connus. Aucun bouton de portefeuille n'est ajouté.

Interactions : ancres internes vers chaque phase, puis liens de page.

Responsive : une colonne. Les six phases ne deviennent pas un carrousel.

États : contenu versionné, donc pas d'état vide. Erreur de page seulement si la route échoue.

### Calendrier

But : afficher le calendrier officiel D-30. D-29 n'est plus affiché.

Hiérarchie :

1. Titre « Calendrier ».
2. Lancement et inscriptions, du 9 au 21 novembre 2026.
3. Sessions de formation en ligne, du 23 au 24 novembre 2026. L'heure et le lien de connexion ne sont pas publiés.
4. Constitution des équipes, du 25 au 29 novembre 2026.
5. Concours de recherche et soumission des articles, du 30 novembre au 13 décembre 2026, sur https://forum.cardano.org/. Les équipes y mènent leurs recherches et y publient leurs articles.
6. Évaluation par le jury, du 14 au 17 décembre 2026. Les noms des jurés et les notes ne sont pas publiés.
7. Atelier de clôture en présentiel, vendredi 18 décembre 2026, à Goma, en République démocratique du Congo. L'heure et l'adresse ne sont pas publiées. Aucune activité supplémentaire n'est listée.
8. Les activités confirmées plus tard dans l'administration s'ajoutent si leur état est `confirmed` et si le titre existe dans la langue de la page. Elles ne remplacent pas ces six phases.

La version anglaise reprend les mêmes dates et les mêmes jours. Aucune phase officielle n'affiche « Date à confirmer ». Aucune période de rapport final n'est ajoutée.

Interactions : lien vers la phase correspondante et vers l'inscription.

États : chargement de la liste dynamique ; erreur de lecture ; les six phases versionnées restent visibles si ce chargement échoue.

### Formations en ligne

But : isoler le volet qui n'exige pas de compte forum.

Ce contenu est une section du programme et une ligne du calendrier, pas une page propre tant qu'elle n'est pas approuvée.

Information affichée :

- sessions de formation en ligne : du 23 au 24 novembre 2026 ;
- l'heure et le lien de connexion ne sont pas affichés ;
- la phrase « Aucun compte Cardano Forum n'est requis pour participer aux formations en ligne. » En anglais : « No Cardano Forum account is required to take part in the online training sessions. » ;
- lien vers l'inscription.

Cette phrase remplace, sur cet écran seulement, l'emploi ambigu de « Compte forum incomplet ». Cette dernière formule reste celle du concours, où le compte est obligatoire.

Aucun programme horaire, aucun intervenant et aucun support ne sont inventés.

### Concours de recherche

But : expliquer le concours et la condition du compte personnel.

Hiérarchie :

1. La page s'ouvre sur « Aperçu » / « Overview ».
2. Sommaire à gauche, sur fond blanc, réservé à ce guide. Concours ouvre sur « Aperçu » / « Overview », qui dit à quoi sert le guide. Les autres explications sont des sous-entrées de Concours. Évaluations, Équipes participantes et Résultats sont des entrées du même niveau. Le texte se lit en continu, sans case autour de chaque information.
3. La section Cardano Forum décrit la plateforme, ce que l'on peut y faire, et le lien visible https://forum.cardano.org/. Elle dit que le concours s'y déroule et invite à créer son propre compte. Les formules « Inscription distincte », « Compte forum incomplet », « Présentation encouragée » et « Invitation forum » restent ensuite.
4. Période officielle : du 30 novembre au 13 décembre 2026. Les équipes mènent leurs recherches et publient leurs articles sur le forum.
5. Condition : compte personnel obligatoire pour participer et pour chaque membre. Pas pour les sessions de formation en ligne ni pour l'atelier du 18 décembre.
6. Présentation personnelle encouragée, non exigée (D-18).
7. Équipes constituées par les organisateurs. La page des équipes participantes reste vide tant qu'aucune équipe réelle n'est saisie.
8. Liens vers l'inscription, les évaluations et les résultats.

Ce qui reste non publié : montants en ADA, noms des jurés, heures et adresse précise à Bakanja.

Interactions : le lien forum s'ouvre dans un nouvel onglet. Le site ne crée pas le compte et ne demande pas de mot de passe.

États : contenu versionné. Le lien vers les résultats mène à l'état vide tant que rien n'est publié.

### Participation en équipe

But : expliquer que le responsable enregistre l'équipe, de 3 à 5 membres, un leader, un adjoint facultatif. Le compte forum de chacun reste personnel. La liste publique ne montre que le nom et l'effectif.

### Inscription au concours

But : enregistrer une équipe, pas une personne isolée.

Hiérarchie :

1. Titre Inscription, deux phrases (Luma / concours), trois cartes Luma.
2. Formulaire d'équipe plus bas, fermé tant que A-13 manque : nom d'équipe, ville, 3 à 5 membres (prénom, nom, courriel, rôle). Le pays n'est pas demandé. Pas de forum. Pas d'article.
3. Période : 9–21 novembre 2026.
4. Succès : « Votre équipe a été enregistrée. Elle apparaît parmi les équipes participantes. » Le code d'accès du team leader est affiché, avec un bouton « Copier » / « Copy ».

Interactions : notice absente → bouton inactif ; courriel déjà lié → message approuvé ; moins de 3 ou plus de 5 membres → erreur sous le groupe. Aucun mot de passe forum.

### Équipes participantes

But : montrer les équipes soumises, sans courriel.

Hiérarchie : titre, une petite carte sobre (conditions, formation, informations affichées, puces simples), fiches de même équilibre (nom, effectif, membres, titre du sujet, courte description, bouton bleu vers l'article), état vide « Aucune équipe n'est encore enregistrée. ». Après publication, les trois équipes placées sont vertes et montrent leur rang en numéro. Les notes n'y figurent pas.

### Accueil — statistique d'équipes

Un seul chiffre, s'il est supérieur à zéro : le nombre d'équipes `submitted`. Source : données réelles. Pas de chiffre inventé, pas d'effectif total de personnes si cela révèle trop, pas de palmarès.

### Espace du responsable

Documenté, non construit. Demande d'accès par courriel, puis tableau de bord de sa seule équipe : membres, forum, article, statuts. Pas de compte classique.

### Annonces

But : publier les informations des organisateurs.

Liste :

1. Titre « Annonces ».
2. Annonces `published` dont la date de publication est passée, de la plus récente à la plus ancienne.
3. Chaque ligne : titre dans la langue de la page, date de publication en forme longue, sans heure si l'heure n'est pas utile à l'affichage.

Détail :

1. Titre.
2. Corps en texte échappé, retours à la ligne conservés.
3. Lien « Retour aux annonces ».

Interactions : ouvrir le détail. Pas de commentaire public.

États : vide avec la formule approuvée ; chargement ; erreur de lecture ; détail inconnu ou non publié en 404, sans dire qu'un brouillon existe.

Proposition d'accueil, à approuver : sous les six domaines, au plus trois annonces `published`, de la plus récente à la plus ancienne. Chaque ligne montre le titre dans la langue de la page et la date de publication, puis mène au détail déjà prévu. S'il n'existe aucune annonce publiée, le bloc n'est pas rendu : pas de titre vide et pas de formule de remplacement. La source est la liste publique existante. L'administration continue de gérer ces textes dans l'écran Annonces. Aucun second outil de publication n'est ajouté. Tant que cette proposition n'est pas approuvée, l'accueil ne contient pas ce bloc.

### Résultats

But : montrer uniquement ce que le jury a permis de publier.

Avant publication :

1. Titre « Résultats ».
2. « Les résultats du concours n'ont pas encore été publiés. »
3. Lien vers le concours et vers les annonces.
4. Aucune place, aucun nom d'équipe, aucune note.

Après publication, dans cet ordre :

1. Trois fiches vertes : rang en numéro, nom de l'équipe, bouton « Lire l'article complet sur Cardano Forum » lorsque le lien existe.
2. Texte du résultat final dans la langue de la page.
3. Bouton « Consultez les résultats totaux des équipes », seulement si un lien Google Sheet a été indiqué ou si le classeur original a été déposé. Il ouvre le lien ou télécharge le fichier. Le site n'importe ni l'un ni l'autre.
4. Lien vers les annonces.

Les notes, les commentaires du jury et les intérêts cochés n'apparaissent pas sur la page.

Interactions : lire seulement. Pas de filtre par note.

États : chargement ; erreur de lecture ; vide tant que `published` n'est pas posé ; succès de publication visible seulement après le passage admin, sans animation de palmarès.

### FAQ

But : tenir une adresse stable pour les questions fournies par les organisateurs. La page est distincte d'Annonces et de Contact. Son lien est le petit menu placé avant le choix de langue.

Hiérarchie : titre « FAQ », puis chaque question en titre suivie de sa réponse, dans la langue de la page. Les questions établies sont dans `src/lib/public-data.ts`. La formule approuvée reste l'état vide si cette liste n'a plus de question. L'administration n'a pas d'écran pour les écrire (D-11).

États : questions publiées ; liste vide avec la formule approuvée. Pas de question de démonstration.

### Pied de page et contact

L'en-tête et le pied de page partagent le fond `#0033AD`. L'en-tête est une barre rectangulaire : nom, Accueil, menus Programme, Concours, Activités et Informations, petit menu FAQ, bouton de langue, bouton Inscription blanc. Le menu Concours ouvre Concours, Évaluations, Équipes participantes et Résultats.

Le pied de page, sur chaque page publique :

- nom du site et le lieu, sans la phrase sur l'origine des informations ;
- menu Programme : les parties de la page et le calendrier, sans accueil, sans feuille de route et sans équipe ;
- pas de menu Informations ;
- menu Participer : inscription, concours et résultats, sans Équipes participantes, sans Évaluations, sans choix de langue et sans lettre d'information ;
- section « Contactez-nous » / « Contact Us », dans la même grille, en texte blanc sur `#0033AD` ;
- sous la grille, à gauche « cardanoimpactdrc © 2026 » puis « Tous droits réservés. » / « All rights reserved. », à droite « Développé par » / « Developed by » Olivier Mwatsimulamo, lien vers https://github.com/mwatsimulamo, nouvel onglet, `noopener` et `noreferrer`.

La section contact, dans les deux langues :

1. Titre de section.
2. Courriel `mwatsimulamoolivier@gmail.com`, lien `mailto:`, assez grand pour être lu et activé au doigt.
3. Lien « Suivez-nous sur X » / « Follow us on X », icône X locale à gauche du libellé, vers https://x.com/OlivierMWATSIM1, nouvel onglet, `rel="noopener noreferrer"`.
4. Lien « Rejoindre notre groupe WhatsApp » / « Join our WhatsApp Group », icône WhatsApp locale à gauche du libellé, vers https://chat.whatsapp.com/BqgI2xN2EDNI34a06TsNTZ, mêmes attributs de lien externe. La colonne Contactez-nous est dans la même grille que Programme et Participer.

Les icônes sont des SVG du projet, d'une seule couleur blanche, d'environ 20 pixels, avec le libellé visible. Elles ne sont pas le seul nom accessible du lien. Sur une largeur étroite, les trois canaux passent l'un sous l'autre, sans défilement horizontal. Le reste du pied de page reste en place.

Page Contact :

1. Titre « Contact ».
2. Les mêmes trois canaux que le pied de page, avec les mêmes règles.
3. La formule « coordonnées non publiées » ne couvre que le canal WhatsApp tant que A-20 est vide. Elle ne masque pas le courriel ni le profil X.

Le pied de page et la page Contact affichent ces canaux. Le lien WhatsApp reste absent tant que A-20 est vide.

Le formulaire n'est pas dessiné comme écran retenu (A-08). S'il était approuvé, D-28 imposerait les champs nom, courriel et message, le message de succès approuvé, la limite de 2 000 caractères, et un écran d'administration pour lire, marquer comme lu et conserver. Cet écran conditionnel n'est pas dans le menu tant que A-08 n'est pas approuvée.

États de la page actuelle : contenu statique, pas d'envoi. États du formulaire conditionnel, non construit : validation, succès, erreur réseau, et liste admin vide « Aucun message. »

## Parcours d'administration

Connexion par le seul courriel et le seul mot de passe de D-39. Pas de page pour créer un compte. Les deux valeurs se règlent sur le serveur, hors de l'interface.

Une session absente revient à la connexion. Le contenu des écrans n'est pas envoyé. Le message réservé est « Cet espace est réservé aux organisateurs. »

Ensuite :

```text
Tableau de bord
  → Équipes
    → Fiche : membres, forum, article, journal
      → Vérifier les profils et les liens
        → Suspendre ou rejeter si besoin
          → Saisir les trois places après consolidation hors site
            → Annonces et exports
```

Les présences sont un parcours parallèle. Les activités documentées aussi. L'évaluation chiffrée de la première édition est hors site (D-38).

## Écrans d'administration

Même système visuel, densité plus forte, titres à `1.75rem`. Les actions destructives demandent une confirmation en mots, avec le nom de la personne ou de l'équipe.

### Connexion

But : ouvrir l'espace privé.

Hiérarchie : titre « Connexion », courriel, mot de passe, bouton « Afficher » ou « Masquer » dans le champ, bouton « Se connecter ». Pas de lien « Créer un compte » ni de lien « Mot de passe oublié » tant que ce parcours n'est pas décidé.

Interactions : erreur « La connexion n'a pas abouti. » / « Sign-in did not succeed. » sans dire lequel des deux champs est faux. Si le compte n'est pas configuré sur le serveur : « Le compte administrateur n'est pas encore configuré sur le serveur. » Succès : arrivée sur le tableau de bord. Le bouton reste occupé pendant l'envoi. La déconnexion revient à la connexion.

Responsive : formulaire étroit, centré, une colonne.

### Tableau de bord

But : voir les décomptes réels et entrer dans les écrans.

Hiérarchie :

1. Titre et phrase d'orientation de l'espace organisateurs.
2. Décomptes réels en cases : équipes soumises, responsables, membres, abonnés, annonces publiées, activités publiées, résultat publié, courriels envoyés.
3. Raccourcis vers nouvelle annonce, nouvelle activité, nouvelle image et saisie des résultats.
4. Bloc « À traiter », campagnes récentes, puis état du calendrier D-30.
5. Aucun lauréat inventé et aucun chiffre fictif.

Apparition : les titres, cases et formulaires glissent depuis les extrémités, en décalage. `prefers-reduced-motion` fige l'affichage.

États : chargement des décomptes ; erreur de lecture ; zéro affiché comme « 0 », pas comme un état vide masqué.

### Équipes

But : voir toutes les équipes, corriger, vérifier, suspendre.

Liste : nom, statut `submitted` / `suspended` / `rejected`, effectif, complétude, article, date.

Fiche : nom, ville, pays, membres (prénom, nom, courriel, rôle), profils forum, article courant, historique, journal.

Interactions : corriger ; ajouter ou retirer dans 3–5 ; transférer le leader ; marquer un profil `verified` ou `mismatch` ; marquer un article `verified` ou `correction_requested` ; suspendre ou rejeter avec justification ; envoyer un accès responsable. Tout est journalisé. Pas de mot de passe forum. Pas de note de jury.

États : liste vide « Aucune équipe. » ; succès « Équipe enregistrée. »

### Évaluation du jury

Hors du site pour la première édition (D-38). L'écran Résultats ne saisit pas de notes. Il publie les trois places après consolidation hors site et peut recevoir un lien Google Sheet ou le classeur original.

### Résultats finaux

But : publier trois places après le jury et après le départage.

Hiérarchie :

1. Rappel : rien n'est publié tant que l'écran est en brouillon. Phrase « Les résultats du concours n'ont pas encore été publiés. »
2. Place 1, place 2, place 3, chacune liée à une équipe distincte.
3. Texte français et texte anglais du résultat.
4. Rappel des articles déjà publics.
5. Bouton « Publier les résultats ».

Interactions :

- la publication est refusée s'il manque une place, un texte, ou si la procédure de départage n'est pas indiquée comme approuvée avant le concours ;
- en cas d'ex æquo dans les notes, le bouton reste inactif et le texte explique que les organisateurs doivent appliquer la procédure, sans proposer un vainqueur ;
- `published` enregistre l'organisateur et l'instant.

États : brouillon ; refus de publication ; succès « Résultats publiés. » ; erreur. Aucune place de démonstration.

La manière d'enregistrer que la procédure a été approuvée, par une case ou par un document, n'est pas décidée. Voir les décisions en attente.

### Annonces

But : rédiger puis publier un texte bilingue.

Liste : titre français, état `draft`, `published` ou `archived`, date.

Fiche : slug, titre français, titre anglais, corps français, corps anglais, date de publication.

Interactions : enregistrer le brouillon même si une langue manque ; publier seulement si les quatre textes et la date sont remplis ; archiver. Le corps reste du texte brut.

États : liste vide ; erreur de slug ; succès « Annonce publiée. » ; l'aperçu public n'existe pas pour un brouillon.

### Présences

But : noter la présence à une activité qui l'autorise.

Hiérarchie : choix de l'activité, puis liste des participants concernés, chacun avec `expected`, `present`, `absent` ou `excused`.

L'atelier du vendredi 18 décembre 2026 peut exister sans heure, de même que les sessions du 23 et du 24 novembre 2026. Les formations et le concours n'apparaissent que si un organisateur a créé l'activité et autorisé la présence. Aucune de ces fiches ne reçoit une heure inventée.

Interactions : enregistrer une ligne par personne et par activité. L'auteur et l'instant sont gardés.

États : aucune activité « Aucune activité ne demande de présence. » ; liste vide ; succès « Présences enregistrées. » ; erreur.

### Activités documentées

But : rédiger, illustrer et publier les activités tenues (D-31). L'écran n'est pas construit.

Hiérarchie de la liste : filtres catégorie et statut, puis lignes titre, catégorie, date, statut. Action « Nouvelle activité ».

Hiérarchie de la fiche :

1. Titres, résumés, descriptions et points marquants, français puis anglais.
2. Catégorie, date réelle, date de fin facultative, format en ligne ou en présentiel, lieu.
3. Intervenants associés, ordre, rôle bilingue, case d'autorisation du nom.
4. Galerie : fichier original, légendes, textes alternatifs, ordre, statut, case de personnes reconnaissables et case d'autorisation.
5. Ressources : type, titres, URL, ordre.
6. Aperçu français et aperçu anglais.
7. Actions « Enregistrer le brouillon », « Publier », « Retirer de la publication ».

La fiche intervenant est séparée : nom, fonction, biographie, organisation, URL, langue préférée, portrait, autorisations. Elle se rouvre depuis plusieurs activités.

États : liste vide « Aucune activité documentée. » ; brouillon ; publié ; retiré ; aperçu ; erreur « L'activité n'a pas pu être enregistrée. » ; refus « La publication demande les deux titres, la catégorie et une date réelle déjà passée. » ; refus « Cette image identifiable ne peut pas être publiée sans autorisation. »

Aucune fiche, aucun portrait et aucune galerie de démonstration.

### Exports CSV

But : télécharger trois fichiers, sans les stocker.

Choix : Inscriptions, Équipes, Présences. Colonnes fixées par ADM-07. Les intérêts sont `true` ou `false`. Les rôles sont `leader`, `deputy` ou `member`.

Le fichier commence par `cardano-impact-pot-`, puis le type et la date UTC `YYYYMMDD`. Encodage UTF-8 avec BOM.

Il ne contient pas la note interne, les messages de contact, les notes du jury, ni un secret.

États : bouton « Exporter » ; génération en cours « Préparation du fichier. » ; erreur « L'export n'a pas pu être créé. » ; succès par le téléchargement, sans page de palmarès.

## Responsive

Largeurs de contrôle : 360, 768 et 1280 pixels.

- La navigation publique reste complète, par le bouton « Menu » sous 1120 pixels. L'administration, lorsqu'elle existera, reprend le bouton « Menu » sous 768 pixels.
- Les formulaires passent sur une colonne et les boutons d'envoi prennent la largeur.
- Les tableaux admin deviennent des fiches empilées, dans l'ordre des colonnes.
- Les trois places des résultats restent trois blocs lisibles, pas un tableau large.
- Aucun texte approuvé n'est retiré sur un petit écran.

## Décisions de design encore à approuver

| Sujet | Plan proposé ici | Pourquoi ce n'est pas tranché |
| --- | --- | --- |
| Routes publiques | Plan A-02 | Déjà examiné, non approuvé. L'administration en français est retenue par D-39. |
| Pages séparées | Initiative, formations et équipes restent des sections | Les exigences ont un programme, un calendrier et un concours, pas ces routes |
| Annonces sur l'accueil | Au plus trois annonces publiées, masquées s'il n'y en a aucune, même source que la page Annonces | Proposition non approuvée |
| En-tête | Rectangle `#0033AD`, 80 pixels, sans rayon | La capsule flottante n'est pas retenue |
| Police et neutres | Source Sans 3 et palette A-15 | Hypothèses A-11 et A-15 |
| Logo officiel | À côté du nom « CIPot-DR Congo », sans cadre | A-12, fichier `public/brand/logo.png` |
| Contact | Canaux D-32 dans le pied de page et sur la page Contact. Formulaire non dessiné | A-08 non approuvée, D-28 conditionnel. L'URL WhatsApp reste A-20 |
| Activités réalisées | Liste et fiche par slug, administration associée | D-31 approuvée. Les pages ne sont pas construites. Le texte d'autorisation des portraits n'est pas rédigé |
| Inscriptions réelles | Bouton inactif sans notice | A-13 non rédigée |
| Modification de fiche | Pas d'écran public | D-24 non construit |
| Preuve de la procédure de départage | Publication bloquée tant qu'elle n'est pas marquée approuvée | Le support de cette marque, case ou document, n'est pas choisi |
| Écran des inscriptions | Conservé à part des participants | Exigé par ADM-03, absent de la liste de départ |

Le calendrier D-30 n'est pas dans ce tableau. C'est une décision de contenu approuvée. L'écran Calendrier l'affiche. D-29 est conservé dans le registre, et il n'est plus affiché.
