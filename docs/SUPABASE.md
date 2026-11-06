# Configuration locale de Supabase

Les clients Next.js App Router sont préparés. Aucune table n'est créée. Les pages publiques et d'administration n'appellent pas encore ces clients.

## Où récupérer les valeurs

Dans le projet Supabase déjà créé pour cette application, ouvrir **Connect** ou **Project Settings → API**.

| Variable | Emplacement dans le tableau de bord |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable (configuration actuelle) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé `anon` / `legacy anon`, si la clé publishable n'est pas affichée |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé `service_role` ou secret, **uniquement serveur** |

Ne coller aucune de ces valeurs dans Git, dans le chat, ni dans un fichier commité.

Une seule des deux clés publiques est nécessaire. Le code utilise `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` si elle est renseignée, sinon `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Ne jamais préfixer la clé `service_role` par `NEXT_PUBLIC_`. Elle ne doit pas figurer dans un composant client.

## Fichiers locaux

1. Copier `.env.example` vers `.env.local` à la racine du dépôt (pas dans `src/`).
2. Y coller les valeurs du projet existant. Ne pas créer un autre projet Supabase.
3. Redémarrer `npm run dev`. Next.js ne relit `.env.local` qu'au démarrage.

`.env.local` est ignoré par Git. `.env.example` ne contient que les noms des variables. `ADMIN_EMAIL` et `ADMIN_PASSWORD` y figurent vides : ce sont le seul courriel et le seul mot de passe de l'administration (D-39). `RESEND_API_KEY` y figure vide : elle sert uniquement au serveur pour D-41. Le mot de passe compte au moins 8 caractères. Ils ne sont pas commités.

## Clients dans le code

| Fichier | Usage |
| --- | --- |
| `src/lib/supabase/browser.ts` | Composants client. URL et clé publique seulement. |
| `src/lib/supabase/server.ts` | Composants serveur, Server Actions, Route Handlers. Même clé publique, cookies de session. |
| `src/lib/supabase/service-role.ts` | Serveur uniquement. Contourne le RLS. Non importé par les pages pour le moment. |
| `src/lib/supabase/proxy.ts` | Rafraîchissement de session dans `src/proxy.ts`, uniquement si les variables publiques sont présentes. |

Les lectures et écritures de données restent côté serveur (D-08). Cette phase n'active pas l'inscription, n'invite pas d'administrateur et n'ouvre pas Auth.

## Connexion

Les identifiants sont dans `.env.local`, ignoré par Git. L'URL du projet est l'origine `https://…supabase.co`, sans chemin `/rest/v1/`. Un contrôle en lecture seule a répondu : Auth 200, REST avec la clé service 200, schéma `public` encore vide.

`@supabase/supabase-js` 2.114 avertit que Node.js 20 ne sera plus pris en charge dans une version future. Le serveur de développement tourne sur Node 20. L'avertissement n'empêche pas les pages de répondre. Node 22 retirera cet avertissement.

## Schéma

La proposition complète est `docs/DATABASE_SCHEMA.md`.

La première tranche est écrite dans `supabase/migrations/20261105163000_team_registration.sql` : `admin_profiles` vide, `teams`, `team_members`, la vue `public_teams`, et la fonction `register_submitted_team`. Elle n'est pas encore appliquée au projet dont l'URL est dans `.env.local`. Le compte CLI Supabase de cette machine ne voit pas ce projet. Aucun compte administrateur n'est créé. Le formulaire public reste fermé.
