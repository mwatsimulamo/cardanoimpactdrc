# Système de design

Système visuel de CIPot-DR Congo, pour le site public et l'administration (D-09). Le programme présenté s'appelle Cardano Learning & Research for Real Use Cases in Goma, DR Congo (D-40). La règle appliquée aux fichiers d'interface est `.cursor/rules/design-system.mdc`.

## Intention

Le site doit ressembler à un document d'organisation : hiérarchie typographique nette, espacements réguliers, couleur rare, comportement responsive soigné. La référence de tenue est https://www.chosenfintech.org/. Elle ne fournit ni le texte, ni le logo, ni les couleurs, ni les médias, ni le thème sombre.

L'interface actuelle du dépôt est le modèle `create-next-app` : police Geist, palette zinc, variantes `dark:` et boutons en pilule. Ce n'est pas ce système. Ces fichiers ne sont pas à restyler tant que la construction de l'interface n'est pas la tâche demandée (D-10).

## Couleur

Couleurs imposées :

| Rôle | Valeur |
| --- | --- |
| Bleu principal | `#0033AD` |
| Blanc | `#FFFFFF` |

Palette dérivée (A-15). Elle existe pour le texte, les bordures, les états de formulaire et le survol. Ce ne sont pas des couleurs de marque supplémentaires.

| Token Tailwind | Valeur | Emploi |
| --- | --- | --- |
| `ink` | `#E8EEF8` | Texte sur le fond sombre et sur les cases |
| `muted` | `#C5D0E2` | Texte secondaire |
| `brand` | `#B7CDFF` | Lien, numéro de phase, repère de page, liseré de carte |
| `brand-hover` | `#E4EDFF` | Survol d'un lien |
| `brand-pressed` | `#001C5C` | Voile de l'image d'accueil |
| `action` | `#0033AD` | Fond du bouton principal |
| `action-hover` | `#2454D6` | Survol du bouton principal |
| `action-pressed` | `#002688` | Bouton principal enfoncé |
| `canvas` | `rgb(10 22 52 / 86%)` | Case, en-tête, menu |
| `surface` | `rgb(18 36 74 / 92%)` | Champ, survol de case, message neutre |
| `line` | `rgb(90 130 190 / 28%)` | Bordures et séparateurs (discret, sans barre blanche) |
| `danger` / `danger-surface` | `#FFC1CB` / `rgb(72 18 32 / 90%)` | Erreur de formulaire |
| `success` / `success-surface` | `#B6ECD4` / `rgb(10 48 34 / 90%)` | Confirmation d'envoi |
| `warning` / `warning-surface` | `#F6D48A` / `rgb(58 38 8 / 90%)` | Information à vérifier |

Cible d'accessibilité : WCAG 2.2 niveau AA. Texte courant au moins 4,5:1. Contour d'un champ et texte en grand au moins 3:1. Le bouton principal reste `#0033AD` avec un texte blanc. Les liens sont `#B7CDFF`, soulignés dans une phrase. Les cases ne sont pas blanches : elles reprennent le bleu nuit du fond, un peu plus couvrant, pour laisser passer le réseau sans masquer le texte.

Déclaration prévue, uniquement lors de la construction, dans le `@theme` déjà utilisé par Tailwind 4 :

```css
@theme inline {
  --color-ink: #e8eef8;
  --color-muted: #c5d0e2;
  --color-brand: #b7cdff;
  --color-brand-hover: #e4edff;
  --color-brand-pressed: #001c5c;
  --color-action: #0033ad;
  --color-action-hover: #2454d6;
  --color-action-pressed: #002688;
  --color-canvas: rgb(10 22 52 / 86%);
  --color-surface: rgb(18 36 74 / 92%);
  --color-line: rgb(90 130 190 / 28%);
  --color-danger: #ffc1cb;
  --color-danger-surface: rgb(72 18 32 / 90%);
  --color-success: #b6ecd4;
  --color-success-surface: rgb(10 48 34 / 90%);
  --color-warning: #f6d48a;
  --color-warning-surface: rgb(58 38 8 / 90%);
  --font-sans: var(--font-source-sans);
}
```

Aucun token n'est introduit par une tâche autre que la construction de l'interface.

## Typographie

Hypothèse A-11, en l'absence d'une police fournie par les organisateurs : Source Sans 3, chargée avec `next/font/google`, sous-ensembles `latin` et `latin-ext`, graisses 400, 600 et 700. La graisse 300 est exclue. Une seule famille sert aux titres et au texte. L'italique est réservé à un titre d'œuvre, pas à de longs paragraphes.

| Style | Taille | Graisse | Interligne |
| --- | --- | --- | --- |
| Titre de page | `2.25rem`, puis `2.5rem` dès 768 px et `2.75rem` dès 1280 px | 600 | 1,15 |
| Titre de section | `1.5rem`, puis `1.75rem` dès 768 px | 600 | 1,25 |
| Titre de bloc | `1.25rem`, puis `1.5rem` dès 768 px | 600 | 1,35 |
| Corps | `1rem`, puis `1.0625rem` dès 768 px | 400 | 1,7 |
| Texte secondaire | `0.9375rem` | 400 | 1,5 |

Le contenu public est centré et limité à `72rem`. Les paragraphes, listes et formulaires utilisent cette largeur. Ils ne sont pas resserrés dans une colonne d'environ `66ch`. Un paragraphe de contenu occupe toute la case qui le porte. À partir de 768 px, il est justifié, avec césure automatique. En dessous, il reste aligné à gauche pour éviter les grands blancs entre les mots.

## Espacement et forme

Échelle utilisée : 4, 8, 12, 16, 24, 32, 48, 64, 96 pixels. Éviter les marges isolées hors de cette échelle.

- Gouttière de page : 20 pixels, puis 32 pixels à partir de `md`.
- Espace vertical d'une section : 48 pixels, puis 96 pixels à partir de `md`.
- Espace entre un titre et son paragraphe : 12 pixels.
- Rayon des boutons et des champs : 2 pixels.
- Cartes, listes et tableaux : angles droits, bordure de 1 pixel `line`.
- Aucune ombre portée décorative.
- Aucun dégradé sur les cartes, les boutons ou le texte.
- Le fond de toutes les pages est la constellation approuvée par D-02, composant `ConstellationBackground`, conservé tel quel. Dégradé radial de `--constellation-bg-outer` (`#050b1f`) vers `--constellation-bg-inner` (`#0a1a4a`), nœuds et lignes pilotés par les variables `--constellation-*` dans `src/app/globals.css`. Il est fixe, en `z-index: -1`, et ignore le pointeur. `prefers-reduced-motion` fige le dessin. Le texte est `#E8EEF8`. Les cases utilisent `canvas`, un bleu nuit translucide. L'en-tête et le pied de page sont `#0033AD`. On ne remplace pas ce fond et on n'en ajoute pas un autre.
- L'accueil ouvre sur le visuel fourni `public/accueil.webp`, en pleine largeur et sur la hauteur de l'écran sous l'en-tête. Le titre du programme, la phrase en `#8EAFFF` et les deux actions sont centrés dans cette image, avec un voile `#001C5C` à 75 % pour le contraste. Le premier bouton est blanc avec le texte `#001C5C`. Le second a le fond `#0033AD` et le texte blanc. Le fichier est animé et affiché sans recompression.
- Les six phases et les domaines sont des cartes `canvas`, avec un liseré `#B7CDFF`. Les cartes de l'accueil ont le liseré en haut. Les pages détaillées l'ont à gauche.

Hors de la constellation de D-02 et du visuel d'accueil, le mouvement se limite au changement de couleur en 150 millisecondes sur le survol et le focus, plus deux exceptions d'apparition : les trois parcours de la page Programme (`.path-reveal`) et les écrans d'administration (`.admin-in-left`, `.admin-in-right`, `.admin-in-up`, `.admin-stagger`), où titres, cases et formulaires glissent depuis les extrémités. Ces apparitions sont désactivées si `prefers-reduced-motion` est actif. Pas de défilement parallaxe, de carrousel ni de compteur animé.

## Structure des pages publiques

En-tête fixe, barre rectangulaire haute de 80 pixels, sans rayon, fond `#0033AD`. Le nom, les menus et Inscription tiennent sur une seule ligne, du bord gauche au bord droit de la barre. Le texte est blanc. Le bouton Inscription est blanc, avec le libellé `#0033AD`.

- à gauche, le nom « CIPot-DR Congo », avec en dessous « Goma · 2026 » (A-12) ;
- au centre, Accueil, puis les menus Programme (les parties de la page, puis le calendrier), Concours, Activités et Informations (annonces, contact). Les titres n'ajoutent pas « Le » ni « The » ;
- à droite, un petit menu FAQ, puis un bouton de langue (globe, code courant, chevron) qui ouvre Français et English, puis Inscription.

Le lien de la page courante porte `aria-current="page"` et une petite case blanche sous le libellé. Un menu s'ouvre au clic et ne montre que ses propres liens. Il se ferme avec Échap ou un clic à l'extérieur. Les cases de menu sont rectangulaires, sans rayon.

Largeur étroite : le bouton texte « Menu » ouvre la liste dans la même barre. Le même bouton devient « Fermer ». La liste défile dans l'écran. Pas d'icône sans libellé.

Seul le guide Concours se lit ainsi : sommaire à gauche, fond blanc, texte `#1B2430`. Les explications du guide sont sous Concours. Évaluations, Équipes participantes et Résultats sont à côté, au même niveau. Programme, Calendrier, Activités et FAQ restent des pages distinctes sur le fond de D-02. Annonces et Contact se suivent dans le même défilement. L'adresse place sa rubrique sous l'en-tête.

Chaque adresse publique est une page. Le menu ouvre cette page. Le menu actif porte une petite case blanche au bas de la barre. Le menu complet s'affiche à partir de 1120 pixels. En dessous, le bouton « Menu » ouvre la liste.

Pied de page : même fond `#0033AD`, sans choix de langue. Sous la grille, le formulaire de lettre de D-41 reprend les champs clairs sur ce fond. Menu Programme : les parties de la page et le calendrier, sans accueil, sans feuille de route et sans équipe. Pas de colonne Activités. Pas de menu Informations. Menu Participer : inscription, concours et résultats. Équipes participantes et Évaluations restent dans le menu Concours de l'en-tête. L'en-tête place Évaluations, Équipes participantes et Résultats dans le menu Concours (D-33, D-34). La colonne « Contactez-nous » / « Contact Us » est dans la même grille que les autres menus. Elle contient le courriel `mailto:`, le profil X et le groupe WhatsApp de D-32, avec des icônes SVG blanches accompagnées de leur libellé. Aucun autre réseau et aucun service d'envoi ne sont inventés. Sous cette grille, à gauche : « cardanoimpactdrc © 2026 » suivi de « Tous droits réservés. » / « All rights reserved. » À droite : « Développé par » / « Developed by », puis le nom Olivier Mwatsimulamo lié à https://github.com/mwatsimulamo, nouvel onglet, `noopener` et `noreferrer`. Le fond animé de D-02 ne change pas.

Une galerie d'activité (D-31) affiche des photographies fournies par les organisateurs. L'original déposé n'est pas remplacé. Aucune transformation automatique n'est proposée. Une image publiée a une légende ou un texte alternatif.

Le contenu éditorial suit cet ordre : titre, résumé d'une ou deux phrases, puis sections. L'accueil fait exception : son premier écran est l'image fournie, avec le texte centré.

## Composants

### Bouton principal

Fond `#0033AD`, texte blanc, graisse 600, rayon 2 pixels. Survol `#2454D6`. Pression `#002688`. Focus : anneau de 2 pixels `#E8EEF8`, décalé de 2 pixels, afin de rester visible sur le bleu.

### Bouton secondaire

Fond `canvas`, texte `#E8EEF8`, bordure `line`. Survol : fond `surface`. Focus : anneau `#B7CDFF`.

### Lien

Dans un texte : `#B7CDFF`, souligné, décalage du soulignement de 2 pixels. Dans la navigation : non souligné, avec le repère de page courante décrit plus haut.

### Champ

Étiquette au-dessus du champ, en `0.875rem` et graisse 600. Si le champ est exigé, le mot « obligatoire » fait partie de l'étiquette, en graisse 400 et en couleur `muted`. Le contour au repos est `line`. Le focus colore le contour en `#B7CDFF`. L'aide, puis l'erreur, se placent sous le champ. L'erreur utilise `#FFC1CB` et `aria-describedby`.

Un champ désactivé a un fond `#F5F7FA` et un texte `#445066`. Il ne dépend pas d'une simple opacité.

### Message d'état

Une bande pleine, bordure de 1 pixel, texte dans la couleur d'état, fond dans la surface d'état. Le message recommence par le fait : « Demande enregistrée. » ou « La demande n'a pas été envoyée. »

### Tableau d'administration

Texte `0.9375rem`, en-tête en graisse 600, séparateurs `line`, ligne survolée en `surface`. Sous 768 pixels, chaque enregistrement devient une liste de paires libellé / valeur, dans le même ordre que les colonnes. Les actions sont des boutons texte : « Confirmer », « Refuser », « Exporter ».

L'espace organisateurs conserve le même système sombre. La barre latérale fixe le menu et le retour au site. Le tableau de bord ouvre sur les décomptes réels, les raccourcis de publication, les alertes à traiter, les campagnes récentes et l'état du calendrier. Les formulaires d'édition tiennent dans une case `canvas` avec titre explicite. Les entrées arrivent en léger glissement depuis la gauche ou la droite, en décalage, sans ombre ni dégradé.

## Responsive

Conception à partir de la largeur étroite. Points de contrôle : 360, 768 et 1280 pixels.

- La navigation tient sans défilement horizontal.
- Les cibles tactiles font au moins 44 pixels de haut.
- Les boutons d'envoi prennent toute la largeur sous 768 pixels.
- Les tableaux larges ne sont pas le seul moyen de lire une fiche.
- Le titre de page passe de `2.25rem` à `2.75rem` sans changer le sens du texte.

## Hors du système

Emoji. Dégradés décoratifs. Ombres longues. Boutons en pilule. Illustrations génériques de blockchain, de globe ou de jeunesse. Carrousel. Bandeau de logos. Chiffres d'impact. Thème sombre et classes `dark:`. Photo ou icône dont la licence et l'origine ne sont pas dans le dépôt.

Le logo officiel est `public/brand/logo.png` (A-12). Il apparaît directement, sans cadre ni fond ajouté, dans l'en-tête, le pied de page et l'administration, à côté du nom « CIPot-DR Congo ». Le dessin n'est pas recoloré. Aucun autre signe n'est importé.
