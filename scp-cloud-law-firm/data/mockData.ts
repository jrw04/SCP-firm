import type {
  User,
  Client,
  Dossier,
  DossierAccessToken,
  DossierMessage,
  DocumentTemplate,
  GedFile,
  AgendaEvent,
  AuditLog,
  AppNotification,
} from "@/types/database";

// Anchor date is fixed (not `new Date()`) so server/client renders never
// disagree during hydration, and the demo dataset reads coherently however
// far in the future it's opened.
const NOW = new Date("2026-08-09T09:00:00.000Z");
const iso = (deltaDays: number, hour = 9, minute = 0) => {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ----------------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------------
export const USERS: User[] = [
  { id: "assoc-1", name: "Me EK", email: "c.ferrand@scpcloud.law", role: "ASSOCIATE", initials: "CF", color: "#0E7490" },
  { id: "assoc-2", name: "Me ME", email: "j.moreau@scpcloud.law", role: "ASSOCIATE", initials: "JM", color: "#4F46E5" },
  { id: "assoc-3", name: "Me S", email: "s.lambert@scpcloud.law", role: "ASSOCIATE", initials: "SL", color: "#A21CAF" },
  { id: "assoc-4", name: "Me An", email: "a.reyer@scpcloud.law", role: "ASSOCIATE", initials: "AR", color: "#B45309" },
  { id: "intern-1", name: "Nora Haddad", email: "n.haddad@scpcloud.law", role: "INTERN", initials: "NH", color: "#0F766E" },
  { id: "intern-2", name: "Louis Petit", email: "l.petit@scpcloud.law", role: "INTERN", initials: "LP", color: "#334155" },
  { id: "intern-3", name: "Maya Girard", email: "m.girard@scpcloud.law", role: "INTERN", initials: "MG", color: "#7C3AED" },
];

export const ASSOCIATES = USERS.filter((u) => u.role === "ASSOCIATE");
export const INTERNS = USERS.filter((u) => u.role === "INTERN");

// ----------------------------------------------------------------------------
// Clients
// ----------------------------------------------------------------------------
export const CLIENTS: Client[] = [
  {
    id: "client-cbc101",
    codeClient: "CBC-101",
    nomRaisonSociale: "Cabinet Bellac Consulting",
    typeClient: "ENTREPRISE",
    email: "contact@bellac-consulting.com",
    telephone: "+237 6 77 12 34 56",
    adresse: "Immeuble Le Prestige, Bastos, Yaoundé",
    piecesIdentitePaths: ["RCCM_CBC.pdf", "CNI_gerant_CBC.pdf"],
    createdAt: iso(-410),
  },
  {
    id: "client-mor102",
    codeClient: "MOR-102",
    nomRaisonSociale: "MOR Industries SARL",
    typeClient: "ENTREPRISE",
    email: "juridique@mor-industries.cm",
    telephone: "+237 6 55 98 21 40",
    adresse: "Zone Industrielle Bassa, Douala",
    piecesIdentitePaths: ["RCCM_MOR.pdf", "Statuts_MOR.pdf"],
    createdAt: iso(-365),
  },
  {
    id: "client-jts103",
    codeClient: "JTS-103",
    nomRaisonSociale: "Julien Tsangou",
    typeClient: "PARTICULIER",
    email: "julien.tsangou@gmail.com",
    telephone: "+237 6 90 11 22 33",
    adresse: "Quartier Mvog-Ada, Yaoundé",
    piecesIdentitePaths: ["CNI_JTsangou.pdf"],
    createdAt: iso(-210),
  },
  {
    id: "client-nfi104",
    codeClient: "NFI-104",
    nomRaisonSociale: "Nguema Frères Import-Export",
    typeClient: "ENTREPRISE",
    email: "direction@nguemafreres.cm",
    telephone: "+237 6 82 44 10 09",
    adresse: "Akwa, Douala",
    piecesIdentitePaths: ["RCCM_NFI.pdf"],
    createdAt: iso(-540),
  },
  {
    id: "client-abe105",
    codeClient: "ABE-105",
    nomRaisonSociale: "Aïcha Belomo",
    typeClient: "PARTICULIER",
    email: "aicha.belomo@yahoo.fr",
    telephone: "+237 6 71 05 66 12",
    adresse: "Quartier Bonapriso, Douala",
    piecesIdentitePaths: ["CNI_ABelomo.pdf", "Livret_famille_ABelomo.pdf"],
    createdAt: iso(-95),
  },
];

// ----------------------------------------------------------------------------
// Dossiers
// ----------------------------------------------------------------------------
const checklist = (items: Array<[string, boolean]>) =>
  items.map(([label, checked], i) => ({ id: `chk-${i}`, label, checked }));

export const DOSSIERS: Dossier[] = [
  {
    id: "dos-cbc101-001",
    dossierRef: "DOS-CBC101-2026-001",
    titre: "Contentieux commercial — rupture abusive de contrat",
    clientId: "client-cbc101",
    associeReferentId: "assoc-1",
    stagiairesAssignesIds: ["intern-1"],
    isRestricted: false,
    paperasseComplete: false,
    checklistPaperasse: checklist([
      ["Copie du contrat litigieux", true],
      ["Mise en demeure envoyée", true],
      ["Justificatifs de préjudice", false],
      ["Pouvoir signé du client", false],
    ]),
    status: "CONSTITUTION",
    createdAt: iso(-18),
    updatedAt: iso(-2),
  },
  {
    id: "dos-cbc101-002",
    dossierRef: "DOS-CBC101-2026-002",
    titre: "Recouvrement de créances — facture impayée",
    clientId: "client-cbc101",
    associeReferentId: "assoc-1",
    stagiairesAssignesIds: ["intern-2"],
    isRestricted: false,
    paperasseComplete: true,
    checklistPaperasse: checklist([
      ["Factures impayées", true],
      ["Relances envoyées", true],
      ["Accusé de réception", true],
    ]),
    status: "DEPOT_PARQUET",
    createdAt: iso(-40),
    updatedAt: iso(-5),
  },
  {
    id: "dos-mor102-001",
    dossierRef: "DOS-MOR102-2026-001",
    titre: "Litige social — contestation de licenciement",
    clientId: "client-mor102",
    associeReferentId: "assoc-2",
    stagiairesAssignesIds: ["intern-1", "intern-3"],
    isRestricted: false,
    paperasseComplete: true,
    checklistPaperasse: checklist([
      ["Contrat de travail", true],
      ["Lettre de licenciement", true],
      ["Bulletins de salaire (12 derniers mois)", true],
      ["Attestation employeur", true],
    ]),
    status: "VISA_SIGNATURE",
    createdAt: iso(-60),
    updatedAt: iso(-3),
  },
  {
    id: "dos-jts103-001",
    dossierRef: "DOS-JTS103-2026-001",
    titre: "Affaire pénale — plainte pour escroquerie",
    clientId: "client-jts103",
    associeReferentId: "assoc-3",
    stagiairesAssignesIds: ["intern-2"],
    isRestricted: true,
    paperasseComplete: true,
    checklistPaperasse: checklist([
      ["Copie de la plainte", true],
      ["Pièces d'identité", true],
      ["Preuves matérielles (relevés, échanges)", true],
    ]),
    status: "AUDIENCE",
    createdAt: iso(-140),
    updatedAt: iso(-1),
  },
  {
    id: "dos-nfi104-001",
    dossierRef: "DOS-NFI104-2026-001",
    titre: "Contentieux douanier — redressement à l'import",
    clientId: "client-nfi104",
    associeReferentId: "assoc-4",
    stagiairesAssignesIds: ["intern-3"],
    isRestricted: false,
    paperasseComplete: true,
    checklistPaperasse: checklist([
      ["Déclarations douanières", true],
      ["Notification de redressement", true],
      ["Correspondance douanes", true],
    ]),
    status: "DELIBERE",
    createdAt: iso(-260),
    updatedAt: iso(-9),
  },
  {
    id: "dos-nfi104-002",
    dossierRef: "DOS-NFI104-2026-002",
    titre: "Propriété intellectuelle — contrefaçon de marque",
    clientId: "client-nfi104",
    associeReferentId: "assoc-4",
    stagiairesAssignesIds: ["intern-1"],
    isRestricted: false,
    paperasseComplete: false,
    checklistPaperasse: checklist([
      ["Certificat de dépôt de marque", true],
      ["Constat d'huissier", false],
      ["Échantillons/photos des produits contrefaits", false],
    ]),
    status: "CONSTITUTION",
    createdAt: iso(-7),
    updatedAt: iso(-1),
  },
  {
    id: "dos-abe105-001",
    dossierRef: "DOS-ABE105-2026-001",
    titre: "Divorce par consentement mutuel",
    clientId: "client-abe105",
    associeReferentId: "assoc-3",
    stagiairesAssignesIds: ["intern-3"],
    isRestricted: true,
    paperasseComplete: false,
    checklistPaperasse: checklist([
      ["Acte de mariage", true],
      ["Convention de divorce signée", false],
      ["Pièces d'identité des deux parties", true],
      ["Livret de famille", false],
    ]),
    status: "DEPOT_PARQUET",
    createdAt: iso(-30),
    updatedAt: iso(-4),
  },
  {
    id: "dos-cbc101-2025-014",
    dossierRef: "DOS-CBC101-2025-014",
    titre: "Contentieux fiscal — redressement clôturé",
    clientId: "client-cbc101",
    associeReferentId: "assoc-2",
    stagiairesAssignesIds: ["intern-2"],
    isRestricted: false,
    paperasseComplete: true,
    checklistPaperasse: checklist([
      ["Avis de redressement", true],
      ["Mémoire en réponse", true],
      ["Décision définitive", true],
    ]),
    status: "ARCHIVE",
    createdAt: iso(-520),
    updatedAt: iso(-70),
  },
];

// ----------------------------------------------------------------------------
// Access tokens (module de déverrouillage temporaire pour stagiaire)
// ----------------------------------------------------------------------------
export const ACCESS_TOKENS: DossierAccessToken[] = [
  {
    id: "tok-1",
    dossierId: "dos-jts103-001",
    stagiaireId: "intern-3",
    tokenCode: "7F3K-91QZ",
    expiresAt: iso(1, 18, 0),
    isActive: true,
    createdAt: iso(-1),
    createdByUserId: "assoc-3",
  },
  {
    id: "tok-2",
    dossierId: "dos-abe105-001",
    stagiaireId: "intern-1",
    tokenCode: "2B7C-40LX",
    expiresAt: iso(-3, 18, 0),
    isActive: false,
    createdAt: iso(-6),
    createdByUserId: "assoc-3",
  },
];

// ----------------------------------------------------------------------------
// Messages (fil de discussion interne — masqué à l'extranet client)
// ----------------------------------------------------------------------------
export const MESSAGES: DossierMessage[] = [
  {
    id: "msg-1",
    dossierId: "dos-cbc101-001",
    authorId: "assoc-1",
    authorName: "Me Camille Ferrand",
    authorRole: "ASSOCIATE",
    content: "@Nora Haddad peux-tu relancer le client pour les justificatifs de préjudice avant vendredi ?",
    createdAt: iso(-3, 10, 15),
  },
  {
    id: "msg-2",
    dossierId: "dos-cbc101-001",
    authorId: "intern-1",
    authorName: "Nora Haddad",
    authorRole: "INTERN",
    content: "C'est fait, relance envoyée ce matin par email. J'ajoute l'accusé de réception dès réception.",
    createdAt: iso(-2, 9, 5),
  },
  {
    id: "msg-3",
    dossierId: "dos-cbc101-001",
    authorId: "assoc-1",
    authorName: "Me Camille Ferrand",
    authorRole: "ASSOCIATE",
    content: "Parfait, merci. On vise un dépôt de dossier complet la semaine prochaine.",
    createdAt: iso(-2, 11, 40),
  },
  {
    id: "msg-4",
    dossierId: "dos-jts103-001",
    authorId: "assoc-3",
    authorName: "Me Sophie Lambert",
    authorRole: "ASSOCIATE",
    content: "Dossier sensible — merci de ne rien communiquer au client avant l'audience de vendredi.",
    createdAt: iso(-4, 14, 0),
  },
  {
    id: "msg-5",
    dossierId: "dos-jts103-001",
    authorId: "intern-3",
    authorName: "Maya Girard",
    authorRole: "INTERN",
    content: "Bien noté. J'ai classé les nouvelles pièces matérielles dans la GED, dossier 01_Pieces_Client.",
    createdAt: iso(-1, 8, 30),
  },
  {
    id: "msg-6",
    dossierId: "dos-mor102-001",
    authorId: "intern-1",
    authorName: "Nora Haddad",
    authorRole: "INTERN",
    content: "@Me Julien Moreau le client a signé l'attestation, je la scanne et l'ajoute au dossier.",
    createdAt: iso(-3, 16, 20),
  },
  {
    id: "msg-7",
    dossierId: "dos-mor102-001",
    authorId: "assoc-2",
    authorName: "Me Julien Moreau",
    authorRole: "ASSOCIATE",
    content: "Merci Nora. On envoie l'assignation dès validation du visa.",
    createdAt: iso(-3, 16, 45),
  },
];

// ----------------------------------------------------------------------------
// Document templates
// ----------------------------------------------------------------------------
export const TEMPLATES: DocumentTemplate[] = [
  {
    id: "tpl-bordereau",
    title: "Bordereau de pièces",
    category: "Procédure",
    contentTemplate:
      "BORDEREAU DE PIÈCES\n\nDossier : {{DOSSIER_REF}}\nClient : {{CLIENT_NOM}} ({{CLIENT_CODE}})\nAvocat responsable : {{AVOCAT_RESPONSABLE}}\nFait le : {{DATE_DU_JOUR}}\n\nListe des pièces communiquées :\n1. ....................................\n2. ....................................\n3. ....................................\n\nCertifié conforme,\n{{AVOCAT_RESPONSABLE}}\nSCP Cloud Law Firm",
  },
  {
    id: "tpl-relance-parquet",
    title: "Lettre de relance Parquet",
    category: "Correspondance",
    contentTemplate:
      "SCP CLOUD LAW FIRM\n{{DATE_DU_JOUR}}\n\nÀ l'attention de Monsieur le Procureur\n\nObjet : Relance — Dossier {{DOSSIER_REF}} ({{CLIENT_NOM}})\n\nMonsieur le Procureur,\n\nNous nous permettons de revenir vers vous concernant le dossier référencé {{DOSSIER_REF}}, transmis à votre Parquet pour le compte de notre client {{CLIENT_NOM}} (réf. client {{CLIENT_CODE}}), et restant à ce jour sans suite connue de notre étude.\n\nNous vous saurions gré de bien vouloir nous indiquer l'état d'avancement de ce dossier.\n\nDans l'attente, nous vous prions d'agréer, Monsieur le Procureur, l'expression de notre haute considération.\n\n{{AVOCAT_RESPONSABLE}}\nSCP Cloud Law Firm",
  },
  {
    id: "tpl-assignation",
    title: "Assignation type",
    category: "Procédure",
    contentTemplate:
      "ASSIGNATION\n\nL'AN DEUX MILLE VINGT-SIX, à la requête de {{CLIENT_NOM}} (réf. {{CLIENT_CODE}}), ayant pour conseil {{AVOCAT_RESPONSABLE}}, SCP Cloud Law Firm,\n\nDOSSIER : {{DOSSIER_REF}}\n\nEST DONNÉ ASSIGNATION à comparaître aux fins ci-après exposées.\n\nFait le {{DATE_DU_JOUR}}.\n\n{{AVOCAT_RESPONSABLE}}",
  },
  {
    id: "tpl-convocation-client",
    title: "Convocation client — point d'étape",
    category: "Correspondance",
    contentTemplate:
      "SCP CLOUD LAW FIRM\n{{DATE_DU_JOUR}}\n\nCher(e) {{CLIENT_NOM}},\n\nNous souhaiterions vous rencontrer afin de faire un point d'étape sur votre dossier {{DOSSIER_REF}}.\n\nMerci de nous indiquer vos disponibilités dans les prochains jours.\n\nCordialement,\n{{AVOCAT_RESPONSABLE}}",
  },
];

// ----------------------------------------------------------------------------
// GED — arborescence + versioning
// ----------------------------------------------------------------------------
export const GED_FILES: GedFile[] = [
  {
    id: "ged-1",
    dossierId: "dos-cbc101-001",
    folder: "01_Pieces_Client",
    baseName: "contrat-litigieux",
    extension: "pdf",
    sharedWithClient: false,
    versions: [
      { version: 1, uploadedByUserId: "intern-1", uploadedByName: "Nora Haddad", uploadedAt: iso(-17), fileName: "contrat-litigieux_v1.pdf", sizeBytes: 812400 },
    ],
  },
  {
    id: "ged-2",
    dossierId: "dos-cbc101-001",
    folder: "03_Correspondances",
    baseName: "mise-en-demeure",
    extension: "pdf",
    sharedWithClient: true,
    versions: [
      { version: 1, uploadedByUserId: "assoc-1", uploadedByName: "Me Camille Ferrand", uploadedAt: iso(-14), fileName: "mise-en-demeure_v1.pdf", sizeBytes: 145200 },
      { version: 2, uploadedByUserId: "assoc-1", uploadedByName: "Me Camille Ferrand", uploadedAt: iso(-12), fileName: "mise-en-demeure_v2.pdf", sizeBytes: 151800 },
    ],
  },
  {
    id: "ged-3",
    dossierId: "dos-mor102-001",
    folder: "01_Pieces_Client",
    baseName: "contrat-travail",
    extension: "pdf",
    sharedWithClient: false,
    versions: [
      { version: 1, uploadedByUserId: "intern-1", uploadedByName: "Nora Haddad", uploadedAt: iso(-58), fileName: "contrat-travail_v1.pdf", sizeBytes: 623100 },
    ],
  },
  {
    id: "ged-4",
    dossierId: "dos-mor102-001",
    folder: "02_Actes_Et_Procedure",
    baseName: "projet-assignation",
    extension: "docx",
    sharedWithClient: false,
    versions: [
      { version: 1, uploadedByUserId: "assoc-2", uploadedByName: "Me Julien Moreau", uploadedAt: iso(-10), fileName: "projet-assignation_v1.docx", sizeBytes: 48200 },
      { version: 2, uploadedByUserId: "assoc-2", uploadedByName: "Me Julien Moreau", uploadedAt: iso(-6), fileName: "projet-assignation_v2.docx", sizeBytes: 51900 },
      { version: 3, uploadedByUserId: "intern-3", uploadedByName: "Maya Girard", uploadedAt: iso(-3), fileName: "projet-assignation_v3.docx", sizeBytes: 53400 },
    ],
  },
  {
    id: "ged-5",
    dossierId: "dos-jts103-001",
    folder: "04_Decisions_Et_Jugements",
    baseName: "convocation-audience",
    extension: "pdf",
    sharedWithClient: true,
    versions: [
      { version: 1, uploadedByUserId: "assoc-3", uploadedByName: "Me Sophie Lambert", uploadedAt: iso(-5), fileName: "convocation-audience_v1.pdf", sizeBytes: 210500 },
    ],
  },
  {
    id: "ged-6",
    dossierId: "dos-nfi104-001",
    folder: "04_Decisions_Et_Jugements",
    baseName: "decision-commission",
    extension: "pdf",
    sharedWithClient: true,
    versions: [
      { version: 1, uploadedByUserId: "assoc-4", uploadedByName: "Me Antoine Reyer", uploadedAt: iso(-9), fileName: "decision-commission_v1.pdf", sizeBytes: 1340000 },
    ],
  },
];

// ----------------------------------------------------------------------------
// Agenda
// ----------------------------------------------------------------------------
export const AGENDA_EVENTS: AgendaEvent[] = [
  {
    id: "evt-1",
    dossierId: "dos-jts103-001",
    title: "Audience correctionnelle",
    type: "AUDIENCE",
    eventDate: iso(2, 9, 0),
    location: "Tribunal de Grande Instance, Yaoundé — Salle 3",
    notifiedUserIds: ["assoc-3", "intern-2"],
  },
  {
    id: "evt-2",
    dossierId: "dos-mor102-001",
    title: "Dépôt du visa au greffe",
    type: "PARQUET_GREFFE",
    eventDate: iso(1, 11, 0),
    location: "Greffe du Tribunal du Travail, Douala",
    notifiedUserIds: ["assoc-2", "intern-1", "intern-3"],
  },
  {
    id: "evt-3",
    dossierId: "dos-cbc101-001",
    title: "Réunion client — point d'étape",
    type: "REUNION_CLIENT",
    eventDate: iso(0, 15, 30),
    location: "Cabinet — Salle Turenne",
    notifiedUserIds: ["assoc-1", "intern-1"],
  },
  {
    id: "evt-4",
    dossierId: "dos-abe105-001",
    title: "Audition au commissariat",
    type: "COMMISSARIAT",
    eventDate: iso(5, 9, 30),
    location: "Commissariat Central, Douala",
    notifiedUserIds: ["assoc-3", "intern-3"],
  },
  {
    id: "evt-5",
    dossierId: "dos-nfi104-002",
    title: "Constat d'huissier — produits contrefaits",
    type: "REUNION_CLIENT",
    eventDate: iso(9, 10, 0),
    location: "Entrepôt Akwa, Douala",
    notifiedUserIds: ["assoc-4", "intern-1"],
  },
];

// ----------------------------------------------------------------------------
// Audit log
// ----------------------------------------------------------------------------
export const AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    dossierId: "dos-cbc101-002",
    userId: "intern-2",
    userName: "Louis Petit",
    action: "CHANGEMENT_STATUT",
    details: "Dossier déposé au Parquet par le stagiaire Louis Petit, récépissé n°882.",
    timestamp: iso(-5, 10, 0),
  },
  {
    id: "log-2",
    dossierId: "dos-mor102-001",
    userId: "assoc-2",
    userName: "Me Julien Moreau",
    action: "CHANGEMENT_STATUT",
    details: "Passage en attente de visa/signature après validation du dossier complet.",
    timestamp: iso(-3, 9, 20),
  },
  {
    id: "log-3",
    dossierId: "dos-jts103-001",
    userId: "assoc-3",
    userName: "Me Sophie Lambert",
    action: "GENERATION_CODE_ACCES",
    details: "Génération d'un code d'accès temporaire pour Maya Girard (48 heures).",
    timestamp: iso(-1, 8, 0),
  },
  {
    id: "log-4",
    dossierId: "dos-nfi104-001",
    userId: "assoc-4",
    userName: "Me Antoine Reyer",
    action: "CHANGEMENT_STATUT",
    details: "Dossier placé en délibéré suite à l'audience du 28 juillet.",
    timestamp: iso(-9, 14, 10),
  },
  {
    id: "log-5",
    dossierId: "dos-cbc101-2025-014",
    userId: "assoc-2",
    userName: "Me Julien Moreau",
    action: "ARCHIVAGE",
    details: "Dossier clôturé et archivé après décision définitive.",
    timestamp: iso(-70, 16, 0),
  },
  {
    id: "log-6",
    dossierId: "dos-abe105-001",
    userId: "intern-1",
    userName: "Nora Haddad",
    action: "DEVERROUILLAGE_CODE",
    details: "Accès débloqué via code temporaire (token 2B7C-40LX).",
    timestamp: iso(-6, 9, 45),
  },
];

// ----------------------------------------------------------------------------
// Notifications (moteur J-7 / J-2 / 24h / 2h)
// ----------------------------------------------------------------------------
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    userId: "assoc-3",
    title: "Audience dans 2 jours",
    body: "Audience correctionnelle — dossier DOS-JTS103-2026-001, Tribunal de Grande Instance, Yaoundé.",
    dossierId: "dos-jts103-001",
    eventId: "evt-1",
    leadTime: "J-2",
    createdAt: iso(0, 8, 0),
    read: false,
    emailSimulated: true,
  },
  {
    id: "notif-2",
    userId: "intern-2",
    title: "Audience dans 2 jours",
    body: "Audience correctionnelle — dossier DOS-JTS103-2026-001, Tribunal de Grande Instance, Yaoundé.",
    dossierId: "dos-jts103-001",
    eventId: "evt-1",
    leadTime: "J-2",
    createdAt: iso(0, 8, 0),
    read: false,
    emailSimulated: true,
  },
  {
    id: "notif-3",
    userId: "assoc-2",
    title: "Dépôt de visa demain",
    body: "Dépôt du visa au greffe — dossier DOS-MOR102-2026-001, Douala.",
    dossierId: "dos-mor102-001",
    eventId: "evt-2",
    leadTime: "24H",
    createdAt: iso(0, 8, 0),
    read: false,
    emailSimulated: true,
  },
  {
    id: "notif-4",
    userId: "assoc-1",
    title: "Réunion client aujourd'hui",
    body: "Réunion client — point d'étape, dossier DOS-CBC101-2026-001, 15h30, Salle Turenne.",
    dossierId: "dos-cbc101-001",
    eventId: "evt-3",
    leadTime: "2H",
    createdAt: iso(0, 8, 30),
    read: false,
    emailSimulated: true,
  },
  {
    id: "notif-5",
    userId: "intern-1",
    title: "Réunion client aujourd'hui",
    body: "Réunion client — point d'étape, dossier DOS-CBC101-2026-001, 15h30, Salle Turenne.",
    dossierId: "dos-cbc101-001",
    eventId: "evt-3",
    leadTime: "2H",
    createdAt: iso(0, 8, 30),
    read: true,
    emailSimulated: true,
  },
  {
    id: "notif-6",
    userId: "assoc-4",
    title: "Nouvelle pièce déposée",
    body: "Une nouvelle version de « projet-assignation » a été déposée sur DOS-NFI104-2026-002.",
    dossierId: "dos-nfi104-002",
    createdAt: iso(-1, 17, 0),
    read: false,
    emailSimulated: false,
  },
];
