/**
 * Editorial adapter input only; intentionally unused by public routing/flags.
 * Metadata records the explicitly reviewed choices, not approval of the whole
 * workbook, translation QA, a generated photograph, or event activation.
 * referenceCopy is transcribed verbatim from the named workbook at sourceSHA;
 * invitation examples remain editorial references, not approved user data.
 * No guest data, private notes or sample identities are imported.
 */
export const editorialLocales = ["it", "en", "fr", "es", "de"] as const;
export type EditorialLocale = typeof editorialLocales[number];
export type ReviewedEditorialEvent = "baptism" | "communion" | "graduation" | "confirmation";
export type LocalizedEditorialText = Readonly<Record<EditorialLocale, string>>;
export interface ReviewedEditorialContent {
  readonly event: ReviewedEditorialEvent;
  readonly status: "reviewed_choices_only";
  readonly publicActivationApproved: false;
  readonly sourceSHA: string;
  readonly sourceWorkbook: string;
  readonly approvedChoices: {
    readonly tone: "familial" | "solemn" | null;
    readonly invitationVoice: "family_plural" | "self_first_person_other_names_graduate" | null;
    readonly approvedChoiceIds: readonly string[];
    readonly sceneKeys: readonly string[];
    readonly roleKeys: readonly string[];
    readonly invitationKeys: readonly string[];
  };
  readonly referenceCopy: Readonly<Record<string, LocalizedEditorialText>>;
}

export const reviewedEditorialContent = {
  "baptism": {
    "event": "baptism",
    "status": "reviewed_choices_only",
    "publicActivationApproved": false,
    "sourceSHA": "e81df80a84d46c871c24a483adcc601252e0f30a",
    "sourceWorkbook": "docs/eventi/battesimo/Battesimo_Testi_Budget_e_Mappa.xlsx",
    "approvedChoices": {
      "tone": "familial",
      "invitationVoice": "family_plural",
      "approvedChoiceIds": [
        "community_label",
        "gathering_label",
        "familial_opening",
        "three_photographic_scenes",
        "ivory_powder_blue_palette"
      ],
      "sceneKeys": [
        "baptism.images.homeAlt",
        "baptism.images.lunchAlt",
        "baptism.images.hallAlt"
      ],
      "roleKeys": [
        "baptism.details.godparents"
      ],
      "invitationKeys": [
        "baptism.invite.intro"
      ]
    },
    "referenceCopy": {
      "events.baptism": {
        "it": "Battesimo",
        "en": "Baptism",
        "es": "Bautizo",
        "fr": "Baptême",
        "de": "Taufe"
      },
      "baptism.setup.communityName": {
        "it": "Comunità scelta",
        "en": "Chosen community",
        "es": "Comunidad elegida",
        "fr": "Communauté choisie",
        "de": "Gewählte Gemeinde"
      },
      "baptism.setup.childName": {
        "it": "Nome da mostrare nell’evento",
        "en": "Name to display for the event",
        "es": "Nombre que aparecerá en el evento",
        "fr": "Prénom à afficher pour l’événement",
        "de": "Anzeigename für die Taufe"
      },
      "baptism.details.godparents": {
        "it": "Padrino o madrina",
        "en": "Godparent or godparents",
        "es": "Padrino o madrina",
        "fr": "Parrain ou marraine",
        "de": "Patin oder Pate"
      },
      "baptism.invite.intro": {
        "it": "Ci farebbe piacere avervi con noi per il battesimo di {childName}.",
        "en": "We’d love you to join us for {childName}’s baptism.",
        "es": "Nos encantaría que nos acompañarais en el bautizo de {childName}.",
        "fr": "Nous serions heureux de vous retrouver pour le baptême de {childName}.",
        "de": "Wir würden uns freuen, wenn ihr bei der Taufe von {childName} dabei seid."
      },
      "baptism.images.homeAlt": {
        "it": "Tavolo di casa con una torta, bicchieri e tovaglioli chiari.",
        "en": "A table at home with a cake, glasses and light-coloured napkins.",
        "es": "Mesa de casa con una tarta, vasos y servilletas claras.",
        "fr": "Table à la maison avec un gâteau, des verres et des serviettes claires.",
        "de": "Tisch zu Hause mit einer Torte, Gläsern und hellen Servietten."
      },
      "baptism.images.lunchAlt": {
        "it": "Tavola apparecchiata per il pranzo, con un seggiolone accanto.",
        "en": "A table set for lunch with a high chair beside it.",
        "es": "Mesa puesta para la comida con una trona al lado.",
        "fr": "Table dressée pour le déjeuner, avec une chaise haute à côté.",
        "de": "Gedeckter Mittagstisch mit einem Hochstuhl daneben."
      },
      "baptism.images.hallAlt": {
        "it": "Sala luminosa con tavoli apparecchiati e un corridoio centrale.",
        "en": "A bright hall with set tables and a central aisle.",
        "es": "Salón luminoso con mesas puestas y un pasillo central.",
        "fr": "Salle lumineuse avec des tables dressées et une allée centrale.",
        "de": "Heller Festsaal mit gedeckten Tischen und einem Mittelgang."
      },
      "baptism.dashboard.reception": {
        "it": "Ritrovo",
        "en": "Get-together",
        "es": "Reunión",
        "fr": "Rassemblement",
        "de": "Beisammensein"
      }
    }
  },
  "communion": {
    "event": "communion",
    "status": "reviewed_choices_only",
    "publicActivationApproved": false,
    "sourceSHA": "e14a8b4c824846117c4b9fb2eed5863b2dc6d2bf",
    "sourceWorkbook": "docs/events/communion/Prima_Comunione_Testi_Budget_Destinazioni.xlsx",
    "approvedChoices": {
      "tone": "solemn",
      "invitationVoice": null,
      "approvedChoiceIds": [
        "event_name",
        "solemn_tone",
        "church_entrance_opening_scene"
      ],
      "sceneKeys": [
        "communion.images.ceremony.alt"
      ],
      "roleKeys": [],
      "invitationKeys": [
        "communion.invite.home"
      ]
    },
    "referenceCopy": {
      "events.communion": {
        "it": "Prima Comunione",
        "en": "First Communion",
        "es": "Primera comunión",
        "fr": "Première communion",
        "de": "Erstkommunion"
      },
      "communion.setup.name": {
        "it": "Nome di chi fa la Prima Comunione",
        "en": "Name of the person receiving First Communion",
        "es": "Nombre de quien hace la primera comunión",
        "fr": "Prénom de la personne qui fait sa première communion",
        "de": "Name der Person, die zur Erstkommunion geht"
      },
      "communion.invite.home": {
        "it": "Con gioia vi invitiamo alla Prima Comunione di {name} il {eventDate}. La celebrazione è alle {ceremonyTime} presso {ceremonyPlace}. Pranziamo a casa alle {receptionTime}, a {receptionPlace}. Vi chiediamo di comunicarci entro il {rsvpDate} se parteciperete a pranzo e se serve un menù bambini.",
        "en": "We warmly invite you to celebrate the First Communion of {name} on {eventDate}. The ceremony is at {ceremonyTime} at {ceremonyPlace}. We’ll have lunch at home at {receptionTime}, at {receptionPlace}. Please reply by {rsvpDate} and let us know if you’ll stay for lunch and need a children’s menu.",
        "es": "Tenemos el honor de invitarles a la primera comunión de {name} el {eventDate}. La celebración es a las {ceremonyTime} en {ceremonyPlace}. Comemos en casa a las {receptionTime}, en {receptionPlace}. Les rogamos que nos confirmen a más tardar el {rsvpDate} si asistirán a comer y si necesitan un menú infantil.",
        "fr": "Nous avons la joie de vous inviter à la première communion de {name} le {eventDate}. La célébration aura lieu à {ceremonyTime} à {ceremonyPlace}. Nous déjeunerons à la maison à {receptionTime}, à {receptionPlace}. Merci de nous dire au plus tard le {rsvpDate} si vous restez déjeuner et s’il faut un menu enfant.",
        "de": "Wir laden Sie herzlich zur Erstkommunion von {name} am {eventDate} ein. Die kirchliche Feier beginnt um {ceremonyTime} in {ceremonyPlace}. Um {receptionTime} essen wir bei uns zu Hause in {receptionPlace}. Bitte teilen Sie uns bis {rsvpDate}, mit, ob Sie zum Essen bleiben und ein Kindermenü benötigen."
      },
      "communion.images.ceremony.alt": {
        "it": "Ingresso di una chiesa con una porta aperta e luce del mattino.",
        "en": "Church entrance with an open door and morning light.",
        "es": "Entrada de una iglesia con la puerta abierta y luz de la mañana.",
        "fr": "Entrée d’une église avec une porte ouverte et la lumière du matin.",
        "de": "Kircheneingang mit offener Tür im Morgenlicht."
      }
    }
  },
  "graduation": {
    "event": "graduation",
    "status": "reviewed_choices_only",
    "publicActivationApproved": false,
    "sourceSHA": "d7a7f7455eaeb6efa15986365cc9d7a37517c43d",
    "sourceWorkbook": "docs/eventi/laurea/Festa_di_laurea_Testi_e_budget.xlsx",
    "approvedChoices": {
      "tone": null,
      "invitationVoice": "self_first_person_other_names_graduate",
      "approvedChoiceIds": [
        "event_name",
        "self_first_person_other_names_graduate",
        "toast_near_university_scene"
      ],
      "sceneKeys": [
        "graduation.image.toastAlt"
      ],
      "roleKeys": [],
      "invitationKeys": [
        "graduation.message.ceremonyIntroSelf",
        "graduation.message.partyIntroSelf",
        "graduation.message.ceremonyIntro",
        "graduation.message.partyIntro"
      ]
    },
    "referenceCopy": {
      "events.graduation": {
        "it": "Laurea",
        "en": "Graduation",
        "es": "Graduación",
        "fr": "Remise de diplôme",
        "de": "Studienabschluss"
      },
      "graduation.setup.nameSelf": {
        "it": "Il tuo nome per gli inviti",
        "en": "Your name for the invitations",
        "es": "Tu nombre para las invitaciones",
        "fr": "Votre prénom pour les invitations",
        "de": "Dein Name für die Einladungen"
      },
      "graduation.setup.nameOther": {
        "it": "Nome di chi si laurea",
        "en": "Graduate’s name",
        "es": "Nombre de quien se gradúa",
        "fr": "Prénom de la personne diplômée",
        "de": "Name der Person, die ihren Abschluss feiert"
      },
      "graduation.message.ceremonyIntroSelf": {
        "it": "Mi farebbe piacere averti alla mia proclamazione!",
        "en": "I’d love you to come to my graduation ceremony!",
        "es": "¡Me encantaría que vinieras a mi ceremonia de graduación!",
        "fr": "J’aimerais beaucoup que vous veniez à ma cérémonie de remise de diplôme !",
        "de": "Ich würde mich freuen, wenn du zu meiner Abschlusszeremonie kommst!"
      },
      "graduation.message.partyIntroSelf": {
        "it": "Festeggio la mia laurea e mi farebbe piacere averti con me!",
        "en": "I’m celebrating my graduation and I’d love you to join me!",
        "es": "¡Celebro mi graduación y me encantaría que vinieras!",
        "fr": "Je fête mon diplôme et j’aimerais beaucoup que vous veniez !",
        "de": "Ich feiere meinen Abschluss und würde mich freuen, wenn du dabei bist!"
      },
      "graduation.message.ceremonyIntro": {
        "it": "Sei tra le persone invitate alla proclamazione di {graduateName}.",
        "en": "You’re invited to {graduateName}’s graduation ceremony.",
        "es": "Te invitamos a la ceremonia de graduación de {graduateName}.",
        "fr": "Vous êtes invité à la cérémonie de remise de diplôme de {graduateName}.",
        "de": "Du bist zur Abschlusszeremonie von {graduateName} eingeladen."
      },
      "graduation.message.partyIntro": {
        "it": "Festeggiamo la laurea di {graduateName}. Ci farebbe piacere averti con noi!",
        "en": "We’re celebrating {graduateName}’s graduation and would love you to join us!",
        "es": "¡Celebramos la graduación de {graduateName} y nos encantaría que vinieras!",
        "fr": "Nous fêtons le diplôme de {graduateName} et nous serions ravis de vous retrouver !",
        "de": "Wir feiern den Abschluss von {graduateName} und würden uns freuen, wenn du dabei bist!"
      },
      "graduation.image.toastAlt": {
        "it": "Amici alzano i calici a un tavolino vicino all’università.",
        "en": "Friends raise their glasses at a café table near the university.",
        "es": "Un grupo de amigos brinda en una mesa cerca de la universidad.",
        "fr": "Des amis lèvent leurs verres à une table de café près de l’université.",
        "de": "Freunde stoßen an einem Cafétisch nahe der Universität an."
      }
    }
  },
  "confirmation": {
    "event": "confirmation",
    "status": "reviewed_choices_only",
    "publicActivationApproved": false,
    "sourceSHA": "b06b8d781b53a14623e101ddaed4b957253f1c3e",
    "sourceWorkbook": "docs/events/confirmation/Cresima_Testi_e_budget.xlsx",
    "approvedChoices": {
      "tone": null,
      "invitationVoice": null,
      "approvedChoiceIds": [
        "recipient_name_label",
        "renameable_sponsor_suggestion",
        "adult_with_companion_scene"
      ],
      "sceneKeys": [
        "confirmation.photo.ceremonyAlt"
      ],
      "roleKeys": [
        "confirmation.community.sponsorSuggestion"
      ],
      "invitationKeys": [
        "confirmation.messages.inviteSelf",
        "confirmation.messages.inviteOther"
      ]
    },
    "referenceCopy": {
      "events.confirmation": {
        "it": "Cresima",
        "en": "Confirmation",
        "es": "Confirmación",
        "fr": "Confirmation",
        "de": "Firmung"
      },
      "confirmation.setup.personName": {
        "it": "Nome di chi riceve la Cresima",
        "en": "Name of the person being confirmed",
        "es": "Nombre de quien recibe la Confirmación",
        "fr": "Nom de la personne qui reçoit la confirmation",
        "de": "Name der Person, die gefirmt wird"
      },
      "confirmation.community.sponsorSuggestion": {
        "it": "Padrino o Madrina",
        "en": "Confirmation sponsor",
        "es": "Padrino o madrina",
        "fr": "Parrain ou marraine",
        "de": "Firmpate oder Firmpatin"
      },
      "confirmation.messages.inviteSelf": {
        "it": "Mi farebbe piacere averti con me il giorno della mia Cresima.",
        "en": "I’d love you to join me for my Confirmation.",
        "es": "Me haría mucha ilusión que me acompañaras el día de mi Confirmación.",
        "fr": "J’aimerais que vous soyez à mes côtés le jour de ma confirmation.",
        "de": "Ich würde mich freuen, wenn du bei meiner Firmung dabei bist."
      },
      "confirmation.messages.inviteOther": {
        "it": "Ci farebbe piacere averti con noi per la Cresima di {personName}.",
        "en": "We’d love you to join us for {personName}’s Confirmation.",
        "es": "Nos haría mucha ilusión que nos acompañaras en la Confirmación de {personName}.",
        "fr": "Nous serions heureux de vous avoir à nos côtés pour la confirmation de {personName}.",
        "de": "Wir würden uns freuen, wenn du bei der Firmung von {personName} dabei bist."
      },
      "confirmation.photo.ceremonyAlt": {
        "it": "Una persona adulta accanto a chi la accompagna all’ingresso di una chiesa.",
        "en": "An adult with their companion at the entrance to a church.",
        "es": "Una persona adulta junto a quien la acompaña a la entrada de una iglesia.",
        "fr": "Une personne adulte et la personne qui l’accompagne à l’entrée d’une église.",
        "de": "Eine erwachsene Person mit ihrer Begleitung am Eingang einer Kirche."
      }
    }
  }
} as const satisfies Readonly<Record<ReviewedEditorialEvent, ReviewedEditorialContent>>;
