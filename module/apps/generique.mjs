/**
 * Générique façon intro spatiale (v0.18.0), d'après la maquette validée par l'auteur
 * (https://claude.ai/artifact/JRU8AwQ4TW15FLA1Um8KrW) : champ d'étoiles, phrase d'ouverture bleue, logo qui recule,
 * texte jaune qui défile en perspective. Le MJ le diffuse depuis une page de journal « Générique » : tous les
 * clients connectés le jouent en même temps (socket). Le MJ a « Passer » et « Arrêter » pour tout le monde ; chacun
 * peut fermer l'écran chez lui (Échap ou croix).
 */

const CANAL = "system.galactic-wars";
const ID = "gw-generique";
const t = (cle) => game.i18n.localize(`GALACTICWARS.Generique.${cle}`);

let courant = null;

/** Le MJ diffuse le générique d'une page à tous les clients (et le joue chez lui). */
export function diffuserGenerique(page) {
  if (!game.user.isGM) return ui.notifications.warn(t("ReserveMJ"));
  const donnees = page.system.diffusion;
  game.socket.emit(CANAL, { type: "generique", action: "lancer", donnees });
  jouerGenerique(donnees);
}

/** Aperçu local (personne d'autre ne le voit). */
export function apercuGenerique(page) {
  jouerGenerique(page.system.diffusion, { apercu: true });
}

function commander(action) {
  game.socket.emit(CANAL, { type: "generique", action });
  if (action === "passer") courant?.passer();
  if (action === "arreter") courant?.fermer();
}

/** À appeler au hook "ready". */
export function enregistrerSocketGenerique() {
  game.socket.on(CANAL, (message) => {
    if (message?.type !== "generique") return;
    if (message.action === "lancer") jouerGenerique(message.donnees);
    else if (message.action === "passer") courant?.passer();
    else if (message.action === "arreter") courant?.fermer();
  });
}

/**
 * Joue le générique en plein écran chez ce client.
 * @param {{episode, titre, ouverture, paragraphes: string[], vitesse: number, musique: string, fond: string}} donnees
 */
export function jouerGenerique(donnees, { apercu = false } = {}) {
  courant?.fermer();
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const echapper = foundry.utils.escapeHTML;
  const commandesMJ = game.user.isGM && !apercu;

  const racine = document.createElement("div");
  racine.id = ID;
  racine.className = "gw-generique";
  racine.setAttribute("role", "dialog");
  racine.setAttribute("aria-label", t("Titre"));
  racine.innerHTML = `
    ${donnees.fond ? `<div class="gw-gen-fond" style="background-image: url('${encodeURI(donnees.fond)}')"></div>` : ""}
    <canvas class="gw-gen-etoiles" aria-hidden="true"></canvas>
    <div class="gw-gen-ouverture">${echapper(donnees.ouverture ?? "")}</div>
    <div class="gw-gen-logo" aria-hidden="true">Galactic<br>Wars</div>
    <div class="gw-gen-perspective"><div class="gw-gen-defilement">
      <p class="gw-gen-episode">${echapper(donnees.episode ?? "")}</p>
      <p class="gw-gen-titre">${echapper(donnees.titre ?? "")}</p>
      ${(donnees.paragraphes ?? []).map((p) => `<p>${echapper(p)}</p>`).join("")}
    </div></div>
    <div class="gw-gen-commandes">
      ${apercu ? `<span class="gw-gen-etiquette">${t("Apercu")}</span>` : ""}
      ${commandesMJ ? `<button type="button" data-gen="passer"><i class="fa-solid fa-forward"></i> ${t("Passer")}</button>
      <button type="button" data-gen="arreter"><i class="fa-solid fa-stop"></i> ${t("ArreterTous")}</button>` : ""}
      <button type="button" data-gen="fermer" data-tooltip="${t("FermerHint")}"><i class="fa-solid fa-xmark"></i> ${t("Fermer")}</button>
    </div>`;
  document.body.append(racine);

  const canvas = racine.querySelector(".gw-gen-etoiles");
  const ctx = canvas.getContext("2d");
  const ouverture = racine.querySelector(".gw-gen-ouverture");
  const logo = racine.querySelector(".gw-gen-logo");
  const defilement = racine.querySelector(".gw-gen-defilement");
  let etoiles = [];
  let actif = true;
  const animations = [];
  const minuteurs = [];

  const dimensionner = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(racine.clientWidth * dpr);
    canvas.height = Math.round(racine.clientHeight * dpr);
    const n = Math.round((racine.clientWidth * racine.clientHeight) / 1400);
    etoiles = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: (Math.random() < 0.08 ? 1.6 : Math.random() * 0.9 + 0.3) * dpr,
      a: Math.random() * 0.6 + 0.3, v: Math.random() * 0.0015 + 0.0004, p: Math.random() * Math.PI * 2
    }));
  };
  const dessiner = (temps) => {
    if (!actif) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const e of etoiles) {
      ctx.globalAlpha = reduit ? e.a : e.a * (0.65 + 0.35 * Math.sin(temps * e.v + e.p));
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduit) requestAnimationFrame(dessiner);
  };
  dimensionner();
  requestAnimationFrame(dessiner);
  window.addEventListener("resize", dimensionner);

  // Musique : jouée chez chaque client, arrêtée à la fermeture.
  let son = null;
  if (donnees.musique) {
    foundry.audio.AudioHelper.play({ src: donnees.musique, volume: 0.8, loop: false }, false)
      .then((s) => { if (actif) son = s; else s?.stop(); })
      .catch(() => null);
  }

  const lancerDefilement = () => {
    defilement.style.opacity = 1;
    if (reduit) {
      defilement.style.transform = "translateX(-50%) rotateX(24deg) translateY(0%)";
      return;
    }
    // Vitesse en pixels, proportionnelle à la taille du texte (même rythme de lecture quelle que soit la taille de
    // l'écran) ; le texte part déjà au bas de l'écran (80 %) pour ne pas laisser un long vide après le logo.
    const hauteur = defilement.offsetHeight || 600;
    const taille = parseFloat(getComputedStyle(defilement).fontSize) || 32;
    const pixelsParSeconde = taille * 1.6 * (donnees.vitesse || 1);
    const duree = Math.max(15000, ((hauteur * 2.4) / pixelsParSeconde) * 1000);
    const a = defilement.animate([
      { transform: "translateX(-50%) rotateX(24deg) translateY(80%)" },
      { transform: "translateX(-50%) rotateX(24deg) translateY(-160%)" }
    ], { duration: duree, easing: "linear", fill: "forwards" });
    a.onfinish = () => minuteurs.push(setTimeout(() => fermer(), 1500));
    animations.push(a);
  };

  const arreterTout = () => {
    animations.forEach((a) => a.cancel());
    animations.length = 0;
    minuteurs.forEach(clearTimeout);
    minuteurs.length = 0;
    [ouverture, logo, defilement].forEach((el) => (el.style.opacity = 0));
  };

  function fermer() {
    if (!actif) return;
    actif = false;
    arreterTout();
    son?.stop();
    window.removeEventListener("resize", dimensionner);
    document.removeEventListener("keydown", surTouche, true);
    racine.classList.add("gw-gen-sortie");
    setTimeout(() => racine.remove(), 600);
    if (courant?.racine === racine) courant = null;
  }
  function passer() {
    if (!actif) return;
    arreterTout();
    lancerDefilement();
  }
  function surTouche(e) {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    e.preventDefault();
    fermer();
  }
  document.addEventListener("keydown", surTouche, true);

  racine.addEventListener("click", (e) => {
    const action = e.target.closest("[data-gen]")?.dataset.gen;
    if (action === "fermer") fermer();
    else if (action === "passer") commander("passer");
    else if (action === "arreter") commander("arreter");
  });

  // Séquence : ouverture (5 s) → logo (8,5 s) → défilement (démarré quand le logo est déjà loin).
  if (reduit) {
    lancerDefilement();
  } else {
    animations.push(ouverture.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }],
      { duration: 5000, fill: "forwards" }
    ));
    minuteurs.push(setTimeout(() => {
      animations.push(logo.animate([
        { opacity: 1, transform: "translate(-50%, -50%) scale(1.25)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(0.05)", offset: 0.92 },
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.02)" }
      ], { duration: 8500, easing: "cubic-bezier(.2,.0,.6,1)", fill: "forwards" }));
    }, 5600));
    minuteurs.push(setTimeout(lancerDefilement, 10200));
  }

  courant = { racine, fermer, passer };
  return courant;
}
