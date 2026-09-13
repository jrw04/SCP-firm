# SCP Cloud Law Firm — Cabinet numérique & Extranet client

Plateforme métier complète pour un cabinet d'avocats : CRM client, chemise
virtuelle par dossier, workflow Kanban Parquet/Cour, GED versionnée,
générateur d'actes, agenda judiciaire avec rappels automatisés, extranet
client en lecture seule, et tableau de bord analytique.

Stack : **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Zustand · React Hook Form + Zod · Radix UI · Recharts · jsPDF · docx**.

Le backend est volontairement mockable (comme demandé) : toutes les
"tables" (`users`, `clients`, `dossiers`, `messages`, `gedFiles`,
`agendaEvents`, `auditLogs`, `notifications`…) vivent dans un store Zustand
unique (`store/useAppStore.ts`), préchargé avec un jeu de données réaliste
(`data/mockData.ts`). Le typage (`types/database.ts`) correspond 1:1 à ce à
quoi ressembleraient des tables Supabase/Prisma, donc brancher un vrai
backend plus tard revient à remplacer les actions du store par des appels
API, sans toucher aux composants.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000. Aucune variable d'environnement n'est requise.

```bash
npm run build   # build de production
npm run start   # sert le build de production
npm run lint     # ESLint (0 erreur)
npm run test     # suite de smoke tests (Vitest + Testing Library, 0 échec)
```

La suite de tests monte les vraies pages/composants (store rempli des données mock) dans un DOM simulé pour détecter les erreurs de rendu — utile après toute modification des sélecteurs Zustand ou du typage des données.

## Comptes de démonstration

Aucun mot de passe n'est nécessaire : la page de connexion liste les
utilisateurs mockés par rôle.

- **Avocats associés** : Me Camille Ferrand, Me Julien Moreau, Me Sophie
  Lambert, Me Antoine Reyer — accès complet.
- **Stagiaires** : Nora Haddad, Louis Petit, Maya Girard — accès filtré aux
  dossiers assignés, ou débloqué par code temporaire.
- **Client Extranet** : code `CBC-101`, email `contact@bellac-consulting.com`
  (voir `data/mockData.ts` pour les 4 autres clients).

Un code d'accès stagiaire actif est préchargé sur le dossier
`DOS-JTS103-2026-001` (token `7F3K-91QZ`, assigné à Maya Girard) pour tester
le déverrouillage sans repasser par un associé.

## Où trouver chaque module

| Module (cahier des charges) | Emplacement |
|---|---|
| 1. Authentification & RBAC | `components/auth/LoginScreen.tsx`, `app/(app)/layout.tsx`, `app/(client)/layout.tsx`, `components/dossiers/UnlockDossierButton.tsx`, `components/dossier-detail/AccessCodeModal.tsx` |
| 2. CRM Client & codification | `services/codeGenerator.ts`, `components/clients/*`, `app/(app)/clients/**` |
| 3. Chemise virtuelle & discussion | `app/(app)/dossiers/[id]/page.tsx`, `components/dossier-detail/*` |
| 4. Générateur de documents | `services/templateEngine.ts`, `services/pdfExport.ts`, `services/docxExport.ts`, `app/(app)/templates/page.tsx` |
| 5. Kanban Transit Parquet/Cour | `components/dossiers/KanbanBoard.tsx`, `TransitNoteModal.tsx`, `DossierCard.tsx` |
| 6. GED & versioning | `components/dossier-detail/GedTree.tsx` |
| 7. Agenda & notifications | `services/notificationEngine.ts`, `components/agenda/*`, `components/layout/NotificationCenter.tsx` |
| 8. Extranet client | `app/(client)/**`, `components/extranet/ExtranetTimeline.tsx` |
| 9. Dashboard analytique | `app/(app)/dashboard/page.tsx`, `app/(app)/archives/page.tsx`, `components/dashboard/*` |

## Notes d'implémentation

- **Charte graphique "luxury legal"** : pilotée par trois tokens de marque dans
  `app/globals.css` (`--color-brand-gold: #C5A059`, `--color-brand-dark: #0F172A`,
  `--color-brand-gray: #6B7280`), utilisés comme classes Tailwind `brand-gold`,
  `brand-dark`, `brand-gray` dans tous les composants. Le logo (`components/shared/Logo.tsx`)
  a deux variantes (`icon` = plume + balance, `full` = logo complet avec signature)
  générées à partir du fichier fourni, recadrées et passées en fond transparent
  (`public/logo-icon.png`, `public/logo-transparent.png`), avec repli textuel
  automatique si l'image ne charge pas.

- **Aucune police chargée en ligne** : la charte typographique repose sur des
  piles de polices système (serif pour l'identité/les actes, sans-serif pour
  l'interface, monospace pour les codes de référence) afin que le projet se
  construise sans accès réseau à Google Fonts.
- **Dates figées** : le jeu de données est ancré sur le 9 août 2026 (voir
  `APP_NOW` dans `store/useAppStore.ts`) pour que les libellés relatifs
  ("dans 2 jours", codes expirés, etc.) restent cohérents à la démo. Changez
  cette constante si vous voulez rejouer le scénario à la date du jour.
- **Persistance** : le store n'est pas persistant (pas de localStorage) —
  un rafraîchissement de page réinitialise la session et les données aux
  valeurs mockées. C'est volontaire pour garder la démo reproductible ; un
  vrai backend remplacerait simplement les actions du store.
- **Exclusions respectées** : aucune fonctionnalité de facturation,
  comptabilité, paiement ou SMS n'a été implémentée, conformément au cahier
  des charges.
