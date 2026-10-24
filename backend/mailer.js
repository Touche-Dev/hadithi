// mailer.js
const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP pour Gmail
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, ""), // Supprime les espaces éventuels du mot de passe à 16 lettres
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Erreur de configuration SMTP :", error.message);
    } else {
      console.log("✅ Serveur SMTP Gmail prêt à envoyer des e-mails !");
    }
  });
}

// Liens de la maison
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://linen-cassowary-757431.hostingersite.com";
const LOGO_URL = "https://linen-cassowary-757431.hostingersite.com/assets/logo-white-BcGHb_35.png";

// Réseaux sociaux Hadithi
const SOCIAL_LINKS = [
  { name: "LinkedIn", url: "https://linkedin.com/company/hadithi-publishers" },
  { name: "Instagram", url: "https://instagram.com/hadithipublishers" },
  { name: "X (Twitter)", url: "https://twitter.com/hadithipub" },
  { name: "Facebook", url: "https://facebook.com/hadithipublishers" }
];

/**
 * Gabarit HTML e-mail UNIQUE & UNIFORMISÉ compatible tous clients (Gmail, Outlook, Apple Mail)
 */
const emailLayout = (subject, contentHtml, badgeLabel = null, footerContext = null) => `
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F4EFEB; font-family: 'Georgia', serif; color: #05182E; }
    
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .content-padding { padding: 26px 20px !important; }
      .header-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="background-color: #F4EFEB; margin: 0; padding: 30px 10px;">
  <center style="width: 100%; background-color: #F4EFEB;">
    
    <!-- Wrapper Principal -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      
      <!-- EN-TÊTE AVEC LE LOGO BLANC -->
      <tr>
        <td align="center" style="background-color: #05182E; padding: 34px 30px;" class="header-padding">
          <a href="${SITE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="${LOGO_URL}" alt="Hadithi Publishers" width="180" style="display: block; max-width: 180px; width: 100%; height: auto;" border="0">
          </a>
          <p style="margin: 12px 0 0; color: #C5A880; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Maison d'édition &bull; Chaque histoire mérite une réponse
          </p>
        </td>
      </tr>

      <!-- CORPS DU MESSAGE -->
      <tr>
        <td style="background-color: #FFFFFF; padding: 40px 36px; border-left: 1px solid #E6E0D8; border-right: 1px solid #E6E0D8;" class="content-padding">
          
          ${badgeLabel ? `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #FAF6F0; border: 1px solid #E4DACB; border-radius: 20px; padding: 5px 14px; font-size: 12px; color: #6E5D4B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${badgeLabel}
              </td>
            </tr>
          </table>` : ''}

          <div style="font-size: 15px; line-height: 1.7; color: #1E2833;">
            ${contentHtml}
          </div>

          <!-- Signature -->
          <div style="margin-top: 36px; padding-top: 22px; border-top: 1px solid #EFEAE3;">
            <p style="margin: 0; font-size: 15px; color: #05182E; line-height: 1.5;">
              Chaleureusement,<br>
              <strong style="color: #05182E;">L'équipe éditoriale</strong><br>
              <span style="font-size: 13px; color: #7B8591;">Hadithi Publishers</span>
            </p>
          </div>

        </td>
      </tr>

      <!-- BANDEAU D'APPEL À L'ACTION : DÉCOUVRIR LES LIVRES -->
      <tr>
        <td align="center" style="background-color: #FAF6F0; padding: 26px 30px; border-left: 1px solid #E6E0D8; border-right: 1px solid #E6E0D8; border-top: 1px dashed #DCD5C9;">
          <p style="margin: 0 0 14px; font-size: 13px; color: #5C5549; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Découvrez nos dernières parutions et les voix que nous portons :
          </p>
          <a href="${SITE_URL}/livres" target="_blank" style="background-color: #05182E; color: #FFFFFF; text-decoration: none; padding: 11px 24px; border-radius: 2px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Découvrir nos livres &rarr;
          </a>
        </td>
      </tr>

      <!-- PIED DE PAGE : RÉSEAUX SOCIAUX & MENTIONS -->
      <tr>
        <td align="center" style="background-color: #ECE5DC; padding: 28px 24px; border-radius: 0 0 4px 4px; border: 1px solid #E0D7CC; border-top: none;">
          
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              ${SOCIAL_LINKS.map(
  (s) => `
                <td style="padding: 0 10px;">
                  <a href="${s.url}" target="_blank" style="color: #05182E; text-decoration: none; font-size: 12px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${s.name}
                  </a>
                </td>`
).join('<td style="color: #9C8E7E; font-size: 12px;">&bull;</td>')}
            </tr>
          </table>

          <p style="margin: 0 0 8px; font-size: 11px; color: #73695D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <a href="${SITE_URL}" target="_blank" style="color: #05182E; text-decoration: underline;">
              hadithipublishers.com
            </a>
            &nbsp;|&nbsp; Paris &bull; Cotonou &bull; Dakar
          </p>

          <p style="margin: 0; font-size: 11px; color: #8F8477; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">
            ${footerContext || "Cet e-mail vous est adressé par Hadithi Publishers."}<br>
            &copy; ${new Date().getFullYear()} Hadithi Publishers. Tous droits réservés.
          </p>

        </td>
      </tr>

    </table>
  </center>
</body>
</html>
`;

/**
 * Fonction interne sécurisée d'envoi
 */
async function sendEmail({ toName, toEmail, subject, html, logType }) {
  if (!transporter) {
    console.log(`\n📨 [SIMULATION EMAIL HADITHI] Vers: ${toEmail} | Sujet: ${subject}`);
    return;
  }

  // Nettoie l'adresse from (retire d'éventuels guillemets superflus du .env)
  const fromClean = (process.env.SMTP_FROM || process.env.SMTP_USER || "contact@hadithipublishers.com")
    .replace(/"/g, "")
    .trim();

  const mailOptions = {
    from: fromClean.includes("<") ? fromClean : `"Hadithi Publishers" <${fromClean}>`,
    to: `"${toName}" <${toEmail}>`,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email [${logType}] envoyé avec succès à ${toEmail} : ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Échec de l'envoi de l'email [${logType}] à ${toEmail} :`, err.message);
    throw err;
  }
}

/* =====================================================================
 *  1. NOTIFICATIONS MANUSCRITS
 * ===================================================================== */
const getStatusContent = (manuscript, authorName) => {
  const title = manuscript.title;
  const decisionHtml = manuscript.decision_note
    ? `
      <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 14px 18px; margin: 22px 0; font-style: italic; color: #374151; font-size: 14px;">
        <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A7B6B; font-weight: bold; margin-bottom: 6px; font-style: normal; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Note du comité de lecture :
        </span>
        ${manuscript.decision_note.replace(/\n/g, "<br>")}
      </div>
    `
    : "";

  switch (manuscript.status) {
    case "accuse_envoye":
      return {
        subject: `Accusé de réception : « ${title} » — Hadithi Publishers`,
        html: `
          <p>Bonjour ${authorName},</p>
          <p>Nous vous confirmons la bonne réception de votre projet d'ouvrage intitulé <strong>« ${title} »</strong>.</p>
          <p>Notre équipe a bien enregistré vos éléments. Le texte est à présent transmis à notre calendrier de lecture. Conformément à nos engagements de transparence, nous accordons toute notre attention à chaque dossier et nous efforçons de vous apporter un retour constructif dans un délai indicatif de <strong>8 à 10 semaines</strong>.</p>
          <p>Nous vous remercions chaleureusement pour votre confiance et pour l'intérêt que vous portez à la ligne éditoriale de Hadithi Publishers.</p>
        `,
      };

    case "en_comite":
      return {
        subject: `Votre manuscrit « ${title} » franchit une nouvelle étape — Hadithi Publishers`,
        html: `
          <p>Bonjour ${authorName},</p>
          <p>Nous tenions à vous informer que votre manuscrit <strong>« ${title} »</strong> a retenu toute l'attention de nos premiers lecteurs.</p>
          <p>Il a franchi avec succès la première étape d'évaluation et est désormais inscrit à l'ordre du jour de notre <strong>comité éditorial</strong>, qui réunit la direction littéraire et l'équipe d'édition pour les choix de publication définitifs.</p>
          <p>Nous reviendrons vers vous très prochainement avec nos conclusions.</p>
        `,
      };

    case "accepte":
      return {
        subject: `Décision favorable du comité : « ${title} » — Hadithi Publishers`,
        html: `
          <p>Bonjour ${authorName},</p>
          <p>C'est avec un très grand plaisir que nous vous annonçons que notre comité éditorial a validé la <strong>publication</strong> de votre ouvrage <strong>« ${title} »</strong> au sein de notre catalogue.</p>
          ${decisionHtml}
          <p>Nous serions honorés de porter votre voix. Notre équipe va prendre contact avec vous très rapidement afin de convenir d'un échange et de vous présenter les prochaines étapes de travail éditorial et contractuel.</p>
          <p>Toutes nos félicitations pour la qualité et la force de votre proposition.</p>
        `,
      };

    case "a_retravailler":
      return {
        subject: `Recommandations concernant votre manuscrit « ${title} » — Hadithi Publishers`,
        html: `
          <p>Bonjour ${authorName},</p>
          <p>Notre comité éditorial a achevé la lecture approfondie de votre projet <strong>« ${title} »</strong>.</p>
          <p>Votre texte témoigne d'un propos fort et de qualités réelles. Néanmoins, pour atteindre tout son potentiel et correspondre pleinement aux exigences de nos collections, nous estimons qu'un travail de reprise et de structuration est nécessaire.</p>
          ${decisionHtml}
          <p>Si ces observations résonnent avec votre vision d'auteur, nous serions ravis d'examiner une nouvelle version remaniée de votre manuscrit après ces ajustements.</p>
        `,
      };

    case "refuse":
      return {
        subject: `Retour de lecture : « ${title} » — Hadithi Publishers`,
        html: `
          <p>Bonjour ${authorName},</p>
          <p>Nous avons étudié votre manuscrit <strong>« ${title} »</strong> avec toute l'attention qu'il mérite.</p>
          <p>Malgré l'intérêt indiscutable de votre démarche, nous avons le regret de vous annoncer que nous ne pourrons pas le retenir pour une publication, ce texte ne s'inscrivant pas actuellement dans les orientations thématiques de notre programme à venir.</p>
          ${decisionHtml}
          <p>Cette décision ne remet nullement en question la valeur de votre démarche. Nous vous remercions sincèrement pour le partage de votre travail et vous souhaitons une belle continuation dans vos projets d'écriture.</p>
        `,
      };

    default:
      return null;
  }
};

async function sendManuscriptStatusNotification(manuscript, contact) {
  const emailData = getStatusContent(manuscript, contact.name);
  if (!emailData) return;

  const html = emailLayout(
    emailData.subject,
    emailData.html,
    `Manuscrit : <strong>« ${manuscript.title} »</strong>`,
    "Cet e-mail vous a été adressé personnellement suite au dépôt de votre manuscrit."
  );

  return sendEmail({
    toName: contact.name,
    toEmail: contact.email,
    subject: emailData.subject,
    html,
    logType: `Manuscrit: ${manuscript.status}`,
  });
}

/* =====================================================================
 *  2. NOTIFICATIONS HADITHI ACADEMY
 * ===================================================================== */
async function sendAcademyStatusNotification(request, contact) {
  if (!contact || !contact.email) return;

  const workshopTitles = {
    contactee: `Votre candidature à l'atelier « ${request.workshop} » — Hadithi Academy`,
    inscrit: `Confirmation de votre inscription à l'atelier « ${request.workshop} » — Hadithi Academy`,
    refusee: `Suite donnée à votre candidature — Hadithi Academy`,
  };

  const subject = workshopTitles[request.status];
  if (!subject) return;

  let bodyContent = "";

  if (request.status === "contactee") {
    bodyContent = `
      <p>Bonjour ${contact.name},</p>
      <p>Nous avons bien reçu votre candidature et la présentation de votre projet d'écriture <em>« ${request.project} »</em> pour l'atelier <strong>${request.workshop}</strong>.</p>
      <p>Votre démarche a retenu l'attention de notre équipe pédagogique et éditoriale. Nous souhaitons organiser un échange avec vous afin de mieux cerner vos objectifs et vous présenter les modalités pratiques ainsi que le déroulement de la prochaine session.</p>
      <p>Un membre de notre équipe prendra attache avec vous très prochainement par email ou téléphone.</p>
      <p>À très bientôt,</p>
    `;
  } else if (request.status === "inscrit") {
    bodyContent = `
      <p>Félicitations ${contact.name},</p>
      <p>C'est avec grand plaisir que nous vous confirmons votre inscription officielle à la prochaine session de l'atelier d'écriture :</p>
      
      <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 14px 18px; margin: 22px 0;">
        <strong style="color: #05182E; font-size: 15px;">${request.workshop}</strong><br>
        <span style="color: #6E5D4B; font-size: 13px; font-style: italic;">Projet accompagné : « ${request.project} »</span>
      </div>

      <p>Votre place est désormais réservée. Vous recevrez prochainement le calendrier complet des séances, les modalités d'accès ainsi que les lectures préparatoires conseillées.</p>
      <p>Nous nous réjouissons d'accompagner l'évolution de votre texte et de votre voix d'auteur.</p>
    `;
  } else if (request.status === "refusee") {
    bodyContent = `
      <p>Bonjour ${contact.name},</p>
      <p>Nous vous remercions sincèrement pour l'intérêt porté à Hadithi Academy et pour le partage de votre projet d'écriture <em>« ${request.project} »</em>.</p>
      <p>Le nombre de places par promotion étant volontairement restreint pour assurer un accompagnement individuel exigeant, nous avons le regret de vous informer que nous ne pourrons pas retenir votre candidature pour la session à venir de l'atelier <strong>${request.workshop}</strong>.</p>
      <p>Nous conservons vos coordonnées pour nos programmations futures et vous encourageons chaleureusement à poursuivre votre travail d'écriture.</p>
    `;
  }

  const html = emailLayout(
    subject,
    bodyContent,
    `Atelier : <strong>« ${request.workshop} »</strong>`,
    "Cet e-mail vous est adressé suite à votre candidature à Hadithi Academy."
  );

  return sendEmail({
    toName: contact.name,
    toEmail: contact.email,
    subject,
    html,
    logType: `Academy: ${request.status}`,
  });
}

/**
 * Accusé de réception envoyé au candidat qui postule depuis le site
 */
async function sendAcademyApplicationNotification(contact, workshop, project) {
  if (!contact || !contact.email) return;

  const subject = `Candidature reçue : atelier « ${workshop} » — Hadithi Academy`;

  const bodyContent = `
    <p>Bonjour ${contact.name},</p>
    <p>Nous accusons bonne réception de votre candidature pour participer à l'atelier d'écriture :</p>
    
    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 14px 18px; margin: 20px 0;">
      <strong style="color: #05182E; font-size: 15px;">${workshop}</strong><br>
      <p style="margin: 8px 0 0; color: #4B5563; font-size: 14px; font-style: italic;">
        « ${project} »
      </p>
    </div>

    <p>Notre équipe éditoriale examine votre proposition avec soin. Nous reviendrons vers vous très prochainement par email avec le calendrier prévisionnel des prochaines sessions et les détails pratiques.</p>
    <p>Nous vous remercions pour votre intérêt pour Hadithi Academy.</p>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Hadithi Academy : <strong>Candidature reçue</strong>`,
    "Vous recevez cet e-mail suite à votre demande d'inscription sur hadithipublishers.com."
  );

  return sendEmail({
    toName: contact.name,
    toEmail: contact.email,
    subject,
    html,
    logType: "Academy: Accusé Candidature",
  });
}

/**
 * Alerte envoyée à l'administrateur lors d'une candidature Academy
 */
async function sendAcademyAdminNotification(contact, workshop, project) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "abnegko@gmail.com";
  const subject = `[Hadithi Academy] Nouvelle candidature : ${contact.name} (${workshop})`;

  const dateNow = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyContent = `
    <p>Bonjour à l'équipe,</p>
    <p>Une nouvelle candidature pour <strong>Hadithi Academy</strong> vient d'être déposée :</p>

    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 16px 20px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Candidat :</strong> ${contact.name}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Email :</strong> <a href="mailto:${contact.email}" style="color: #05182E;">${contact.email}</a>
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Atelier visé :</strong> ${workshop}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Projet :</strong><br>
        <span style="font-style: italic; color: #374151;">${project}</span>
      </p>
      <p style="margin: 0; font-size: 13px; color: #6E5D4B;">
        <strong>Date & Heure :</strong> ${dateNow}
      </p>
    </div>

    <p style="font-size: 13px; color: #7B8591;">Retrouvez et gérez cette demande directement dans l'espace administration.</p>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Hadithi Academy : <strong>Nouvelle candidature</strong>`,
    "Notification automatique transmise par le système Hadithi Publishers."
  );

  return sendEmail({
    toName: "Équipe Hadithi",
    toEmail: adminEmail,
    subject,
    html,
    logType: "Academy: Notification Admin",
  });
}

/* =====================================================================
 *  3. BIENVENUE AU BOOK CLUB
 * ===================================================================== */
async function sendBookClubWelcomeNotification(contact, collectionName) {
  if (!contact || !contact.email) return;

  const subject = "Bienvenue au Book Club — Hadithi Publishers";

  const colText = collectionName && collectionName !== "Toutes collections"
    ? `Votre intérêt particulier pour notre collection <strong>${collectionName}</strong> a bien été enregistré.`
    : `Vous suivrez ainsi l'actualité littéraire de l'ensemble de nos collections (Legacy, Visions du Monde et Kids).`;

  const bodyContent = `
    <p>Bonjour ${contact.name},</p>
    <p>Nous sommes très heureux de vous compter parmi les membres du <strong>Book Club Hadithi</strong> !</p>
    <p>${colText}</p>
    
    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 14px 18px; margin: 22px 0;">
      <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A7B6B; font-weight: bold; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        En tant que membre privilégié :
      </span>
      <ul style="margin: 0; padding-left: 18px; color: #374151; font-size: 14px; line-height: 1.6;">
        <li>Vous recevrez nos lettres mensuelles avec extraits exclusifs en avant-première ;</li>
        <li>Vous bénéficierez d'invitations prioritaires à nos lancements et rencontres d'auteurs ;</li>
        <li>Vous découvrirez les coulisses de la création de nos ouvrages.</li>
      </ul>
    </div>

    <p>Nous sommes honorés de partager ces récits inspirants avec vous.</p>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Membre privilégié : <strong>Book Club Hadithi</strong>`,
    "Vous recevez cet e-mail car vous avez rejoint le Book Club Hadithi Publishers."
  );

  return sendEmail({
    toName: contact.name,
    toEmail: contact.email,
    subject,
    html,
    logType: "Book Club: Bienvenue",
  });
}

/**
 * Alerte envoyée à l'administrateur lors d'une nouvelle inscription au Book Club
 */
async function sendBookClubAdminNotification(contact, collectionName) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "abnegko@gmail.com";
  const subject = `[Hadithi] Nouvel inscrit au Book Club : ${contact.name}`;

  const dateNow = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyContent = `
    <p>Bonjour à l'équipe,</p>
    <p>Un lecteur vient de rejoindre le <strong>Hadithi Book Club</strong> :</p>

    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 16px 20px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Nom :</strong> ${contact.name}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Email :</strong> <a href="mailto:${contact.email}" style="color: #05182E;">${contact.email}</a>
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Collection d'intérêt :</strong> ${collectionName || "Toutes collections"}
      </p>
      <p style="margin: 0; font-size: 13px; color: #6E5D4B;">
        <strong>Date & Heure :</strong> ${dateNow}
      </p>
    </div>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Book Club : <strong>Nouvelle adhésion</strong>`,
    "Notification automatique transmise par le système Hadithi Publishers."
  );

  return sendEmail({
    toName: "Équipe Hadithi",
    toEmail: adminEmail,
    subject,
    html,
    logType: "Book Club: Notification Admin",
  });
}

/* =====================================================================
 *  4. NOTIFICATIONS NEWSLETTER (CLIENT & ADMINISTRATEUR)
 * ===================================================================== */

/**
 * Email de bienvenue envoyé au lecteur qui s'inscrit
 */
async function sendNewsletterWelcomeNotification(contact) {
  if (!contact || !contact.email) return;

  const subject = "Confirmation de votre inscription à la newsletter — Hadithi Publishers";

  const bodyContent = `
    <p>Bonjour ${contact.name},</p>
    <p>Nous vous remercions chaleureusement pour votre inscription à la <strong>newsletter de Hadithi Publishers</strong>.</p>
    
    <p>Une à deux fois par mois, nous partagerons avec vous :</p>
    
    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 14px 18px; margin: 22px 0;">
      <ul style="margin: 0; padding-left: 18px; color: #374151; font-size: 14px; line-height: 1.7;">
        <li>L'annonce de nos <strong>nouvelles parutions</strong> et rééditions ;</li>
        <li>Les <strong>coulisses éditoriales</strong> d'un manuscrit, du comité de lecture jusqu'au choix de couverture ;</li>
        <li>Les dates de nos <strong>rencontres, débats et dédicaces</strong> en marge des sommets et salons.</li>
      </ul>
    </div>

    <p>Nous nous attachons à publier des récits exigeants et singuliers. Nous sommes très heureux de vous compter parmi les abonnés à notre newsletter.</p>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Newsletter : <strong>Hadithi Publishers</strong>`,
    "Vous recevez cet e-mail suite à votre inscription à la newsletter sur hadithipublishers.com."
  );

  return sendEmail({
    toName: contact.name,
    toEmail: contact.email,
    subject,
    html,
    logType: "Newsletter: Bienvenue Lecteur",
  });
}

/**
 * Email de notification envoyé à l'équipe / administrateur
 */
async function sendNewsletterAdminNotification(contact) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "abnegko@gmail.com";
  const subject = `[Hadithi] Nouvel abonné à la newsletter : ${contact.name}`;

  const dateNow = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyContent = `
    <p>Bonjour à l'équipe,</p>
    <p>Un nouveau lecteur vient de <strong>s'inscrire à la newsletter</strong> depuis le site :</p>

    <div style="background-color: #FAF7F2; border-left: 3px solid #05182E; padding: 16px 20px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Nom & Prénoms :</strong> ${contact.name}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #05182E;">
        <strong>Email :</strong> <a href="mailto:${contact.email}" style="color: #05182E; text-decoration: underline;">${contact.email}</a>
      </p>
      <p style="margin: 0; font-size: 13px; color: #6E5D4B;">
        <strong>Date & Heure :</strong> ${dateNow}
      </p>
    </div>

    <p style="font-size: 13px; color: #7B8591;">L'abonné a été enregistré dans votre base de données avec le tag « newsletter ».</p>
  `;

  const html = emailLayout(
    subject,
    bodyContent,
    `Newsletter : <strong>Nouvelle inscription</strong>`,
    "Notification automatique suite à une inscription à la newsletter Hadithi Publishers."
  );

  return sendEmail({
    toName: "Équipe Hadithi",
    toEmail: adminEmail,
    subject,
    html,
    logType: "Newsletter: Notification Admin",
  });
}

module.exports = {
  sendManuscriptStatusNotification,
  sendAcademyStatusNotification,
  sendBookClubWelcomeNotification,
  sendBookClubAdminNotification,
  sendAcademyApplicationNotification,
  sendAcademyAdminNotification,
  sendNewsletterWelcomeNotification,
  sendNewsletterAdminNotification,
};