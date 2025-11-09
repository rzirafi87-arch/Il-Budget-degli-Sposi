# Carousel Assets Manifest

Questo manifest sintetizza i 27 scatti richiesti, così puoi rigenerarli (AI, Figma, studio fotografico) e posizionarli in `public/images/carousels/`.

1. `home-1.jpg` — Interfaccia budget elegante su sfondo ivory, accenti bronze, elementi sage, luci morbide, look premium minimal.
2. `home-2.jpg` — Collage “wedding planning” flat-lay: carta Amalfi, fiocco sage, gypsophila, penna, smartphone con app aperta.
3. `home-3.jpg` — Coppia mani intrecciate, palette ivory/sage, overlay UI grafici (grafico a torta, lista to-do).
4. `budget-1.jpg` — Tabella budget pulita con chip sage e indicatori bronze, stile dashboard moderno.
5. `budget-2.jpg` — Close-up di ricevute, carta Amalfi, calcolatrice, toni ivory/sage.
6. `budget-3.jpg` — Grafico ad anello + barre soft, su sfondo ivory, micro-texture.
7. `timeline-1.jpg` — Roadmap orizzontale con milestones, accenti sage.
8. `timeline-2.jpg` — Calendario mensile minimal con tag colorati (sage/bronze).
9. `timeline-3.jpg` — Mano che spunta task su to-do elegante.
10. `vendors-1.jpg` — Moodboard venue naturali (legno chiaro, ivy/sage), card vendor UI.
11. `vendors-2.jpg` — Tavolo mise en place natural chic (lino, gypsophila).
12. `vendors-3.jpg` — Mappa con pin personalizzati, interfaccia cards fornitori.
13. `invites-1.jpg` — Invito su carta Amalfi con monogramma R & C in rilievo, tono ivory/sage.
14. `invites-2.jpg` — UI lista ospiti con tag RSVP, sfondo neutro.
15. `invites-3.jpg` — Composizione con busta, ceralacca, fiocco sage.
16. `gallery-1.jpg` — Griglia foto minimal, cornici soft, sfondo ivory.
17. `gallery-2.jpg` — Dettaglio still-life accessori matrimonio (anelli, nastro sage).
18. `gallery-3.jpg` — Mock di telefono con carosello fullscreen.
19. `traditions-1.jpg` — Collage elegante elementi Italia/Messico (molto soft, no cliché).
20. `traditions-2.jpg` — Card informative con bandierine desaturate.
21. `traditions-3.jpg` — Mappa con layer culture/timeline.
22. `settings-1.jpg` — UI schede impostazioni con toggle sage.
23. `settings-2.jpg` — Pattern lino/ivory con icone lineari scure.
24. `settings-3.jpg` — Mano su smartphone tema scuro dell’app.
25. `onboarding-1.jpg` — Schermata wizard stepper con accenti bronze.
26. `onboarding-2.jpg` — Illustrazione minimal di coppia + elementi botanical.
27. `onboarding-3.jpg` — CTA grande “Inizia” su sfondo ivory testurizzato.

Appena i JPG sono pronti, salvali in `public/images/carousels/` con i nomi sopra e ignora i placeholder SVG già presenti in `public/carousels`.

## Event Carousel Set

Sono stati generati automaticamente con `scripts/generate-event-carousels.mjs` tre scatti coordinati per ciascun tipo di evento disponibile nell'app. I file seguono la convenzione `<slug>-<indice>.jpg`:

- Matrimonio — `wedding-1.jpg`, `wedding-2.jpg`, `wedding-3.jpg`
- Battesimo — `baptism-1.jpg`, `baptism-2.jpg`, `baptism-3.jpg`
- Diciottesimo — `eighteenth-1.jpg`, `eighteenth-2.jpg`, `eighteenth-3.jpg`
- Anniversario di matrimonio — `anniversary-1.jpg`, `anniversary-2.jpg`, `anniversary-3.jpg`
- Gender Reveal — `gender-reveal-1.jpg`, `gender-reveal-2.jpg`, `gender-reveal-3.jpg`
- Compleanno — `birthday-1.jpg`, `birthday-2.jpg`, `birthday-3.jpg`
- 50 anni — `fifty-1.jpg`, `fifty-2.jpg`, `fifty-3.jpg`
- Pensione — `retirement-1.jpg`, `retirement-2.jpg`, `retirement-3.jpg`
- Cresima — `confirmation-1.jpg`, `confirmation-2.jpg`, `confirmation-3.jpg`
- Laurea — `graduation-1.jpg`, `graduation-2.jpg`, `graduation-3.jpg`
- Baby Shower — `babyshower-1.jpg`, `babyshower-2.jpg`, `babyshower-3.jpg`
- Festa di fidanzamento — `engagement-1.jpg`, `engagement-2.jpg`, `engagement-3.jpg`
- Proposta di matrimonio — `proposal-1.jpg`, `proposal-2.jpg`, `proposal-3.jpg`
- Comunione — `communion-1.jpg`, `communion-2.jpg`, `communion-3.jpg`
- Bar Mitzvah — `bar-mitzvah-1.jpg`, `bar-mitzvah-2.jpg`, `bar-mitzvah-3.jpg`
- Quinceañera — `quinceanera-1.jpg`, `quinceanera-2.jpg`, `quinceanera-3.jpg`
- Evento aziendale — `corporate-1.jpg`, `corporate-2.jpg`, `corporate-3.jpg`
- Charity / Gala — `charity-gala-1.jpg`, `charity-gala-2.jpg`, `charity-gala-3.jpg`

Per rigenerare gli asset è sufficiente eseguire `node scripts/generate-event-carousels.mjs` (richiede che le dipendenze del progetto siano installate, incluso `sharp`).
