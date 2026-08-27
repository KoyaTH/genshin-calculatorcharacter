const API = "https://genshin-db-api.vercel.app/api/v5";
const ENKA_UI = "https://enka.network/ui/";
const GENSHIN_DEV_MATERIAL = "https://genshin.jmp.blue/materials/";
const colors = {
    Pyro: "var(--pyro)",
    Hydro: "var(--hydro)",
    Electro: "var(--electro)",
    Cryo: "var(--cryo)",
    Anemo: "var(--anemo)",
    Geo: "var(--geo)",
    Dendro: "var(--dendro)",
  },
  phases = [
    ["ascend1", 20],
    ["ascend2", 40],
    ["ascend3", 50],
    ["ascend4", 60],
    ["ascend5", 70],
    ["ascend6", 80],
  ],
  talents = ["combat1", "combat2", "combat3"];
const weaponPhases = [
  ["ascend1", 20],
  ["ascend2", 40],
  ["ascend3", 50],
  ["ascend4", 60],
  ["ascend5", 70],
  ["ascend6", 80],
];

const locales = {
  pt: {
    charactersTitle: "Personagens", selectedTitle: "Configura\u00e7\u00e3o", settingsToggle: "Configura\u00e7\u00f5es",
    resetAll: "Resetar tudo", resetMaterials: "Resetar materiais", settingsNote: "Nomes de armas e materiais v\u00eam da API p\u00fablica.", clearCache: "Limpar dados deste dispositivo",
    clearCharacters: "Remover todos os personagens", noCharacters: "Nenhum personagem encontrado.", noSelected: "Nenhum personagem selecionado ainda. Clique em um personagem acima para come\u00e7ar.", loading: "carregando\u2026",
    characterLevel: "N\u00edvel do personagem", weaponLabel: "Arma", weaponLevel: "N\u00edvel da arma", searchingWeapon: "Buscando arma\u2026", weaponNotFound: "Arma n\u00e3o encontrada. Verifique o nome e tente novamente.", goalComplete: "Meta conclu\u00edda \u2713", goalLabel: "Concluir meta",
    talentLabel: "Talento", ownsLabel: "Possui", remainingLabel: "Faltam", materialsHeader: "Lista de materiais", materialsSub: " materiais para coletar", totalLabel: "Itens necess\u00e1rios (sem Mora)", categoryMora: "Mora", categoryAscension: "Ascens\u00e3o", categoryTalent: "Talento", categoryOther: "Outros", selectAll: "Selecionar todos", calcLabel: "Calcular materiais necess\u00e1rios", calculating: "Calculando\u2026", export: "Exportar dados", import: "Importar dados", restore: "Planejar novamente", completeSection: "Personagens completos",
    cacheWarning: "Isso vai apagar permanentemente todos os personagens, metas, invent\u00e1rio, idioma e cache deste dispositivo. Deseja continuar?", importWarning: "Importar substituir\u00e1 todos os dados atuais deste dispositivo. Deseja continuar?", invalidImport: "Arquivo de backup inv\u00e1lido.", apiError: "N\u00e3o foi poss\u00edvel carregar os personagens. Tente atualizar a p\u00e1gina."
  },
  en: {
    charactersTitle: "Characters", selectedTitle: "Setup", settingsToggle: "Settings", resetAll: "Reset all", resetMaterials: "Reset materials", settingsNote: "Weapon and material names come from the public API.", clearCache: "Clear this device's data", clearCharacters: "Remove all characters", noCharacters: "No characters found.", noSelected: "No character selected yet. Click a character above to begin.", loading: "loading\u2026", characterLevel: "Character level", weaponLabel: "Weapon", weaponLevel: "Weapon level", searchingWeapon: "Searching weapon\u2026", weaponNotFound: "Weapon not found. Check the name and try again.", goalComplete: "Goal complete \u2713", goalLabel: "Complete goal", talentLabel: "Talent", ownsLabel: "Owned", remainingLabel: "Remaining", materialsHeader: "Material list", materialsSub: " materials to collect", totalLabel: "Required items (excluding Mora)", categoryMora: "Mora", categoryAscension: "Ascension", categoryTalent: "Talent", categoryOther: "Other", selectAll: "Select all", calcLabel: "Calculate required materials", calculating: "Calculating\u2026", export: "Export data", import: "Import data", restore: "Plan again", completeSection: "Completed characters", cacheWarning: "This permanently deletes all characters, goals, inventory, language, and cached data on this device. Continue?", importWarning: "Importing replaces all current data on this device. Continue?", invalidImport: "Invalid backup file.", apiError: "Characters could not be loaded. Please refresh the page."
  }
};

function t(key) {
  return locales[state?.language]?.[key] ?? locales.pt[key] ?? key;
}

function gameAssetUrl(source) {
  if (!source) return null;
  if (source.startsWith("http://") || source.startsWith("https://")) return source;
  if (source.startsWith("//")) return window.location.protocol + source;

  const filename = decodeURIComponent(source.split("?")[0].split("/").pop());

  if (!filename.startsWith("UI_")) return null;
  const ext = filename.includes(".") ? "" : ".png";
  // Use Enka UI for game asset filenames (UI_*) to avoid CORB issues with other hosts
  return ENKA_UI + filename + ext;
}

function assetUrl(...sources) {
  return sources.map(gameAssetUrl).find(Boolean) || null;
}

function buildAlternateUrls(source) {
  if (!source) return [];
  const urls = [];
  if (source.startsWith("http://") || source.startsWith("https://") || source.startsWith("//")) {
    const s = source.startsWith("//") ? window.location.protocol + source : source;
    urls.push(s);
    try {
      const filename = decodeURIComponent(s.split("?")[0].split("/").pop());
      if (filename && filename.startsWith("UI_")) {
        const ext = filename.includes(".") ? "" : ".png";
        urls.push(ENKA_UI + filename + ext);
        const base = "https://upload-os-bbs.mihoyo.com/game_record/genshin/";
        ['character_icon','item_icon','equip_icon','weapon_icon','character_side_icon'].forEach(folder=>urls.push(base+folder+"/"+filename+ext));
      }
    } catch (e) {}
    return urls;
  }
  // source is likely a UI_ filename
  const filename = decodeURIComponent(source.split("?")[0].split("/").pop());
  const ext = filename.includes(".") ? "" : ".png";
  urls.push(ENKA_UI + filename + ext);
  const base = "https://upload-os-bbs.mihoyo.com/game_record/genshin/";
  ['character_icon','item_icon','equip_icon','weapon_icon','character_side_icon'].forEach(folder=>urls.push(base+folder+"/"+filename+ext));
  return urls;
}

function attachImageFallback(img, original) {
  if (!img) return;
  let candidates = [];
  if (Array.isArray(original)) candidates = original.filter(Boolean);
  else candidates = buildAlternateUrls(original || img.src || img.getAttribute('src'));
  if (!candidates.length) return;
  img.dataset.fallbackIndex = 0;
  img.dataset.candidates = JSON.stringify(candidates);
  // set initial src if not already set
  try { if (!img.src || img.src === window.location.href) img.src = candidates[0]; } catch (e) {}
  img.addEventListener('error', function onErr() {
    const list = JSON.parse(this.dataset.candidates || '[]');
    let i = Number(this.dataset.fallbackIndex || 0) + 1;
    if (i >= list.length) {
      this.removeEventListener('error', onErr);
      this.remove();
      return;
    }
    this.dataset.fallbackIndex = i;
    this.src = list[i];
  });
}

function materialIconUrl(name) {
  return GENSHIN_DEV_MATERIAL + encodeURIComponent(normalizeKey(name).replace(/\s+/g, "-")) + "/icon";
}
function game8MaterialCandidates(name) {
  const slug = normalizeKey(name).replace(/\s+/g, "-");
  return slug ? [`https://img.game8.co/3316241/${encodeURIComponent(slug)}.png/show`] : [];
}

function normalizeKey(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function loadGame8Mapping() {
  // cached in-memory
  if (window._game8_items_map) return window._game8_items_map;
  // try localStorage cache
  try {
    const cached = localStorage.getItem("game8-items-v1");
    if (cached) {
      window._game8_items_map = JSON.parse(cached);
      return window._game8_items_map;
    }
  } catch (e) {}

  // try fetching the Game8 page directly (may be blocked by CORS)
  // NOTE: fetching Game8 directly from the browser commonly triggers CORS.
  // To avoid CORS issues, we DO NOT attempt to fetch Game8 here.
  // Instead, prefer a local mapping file (`/assets/game8-items.json`) or
  // the cached `localStorage` entry. For updates, run a server-side scraper
  // or use the tools/fetch-game8-icons.js utility and populate the JSON.

  // fallback: try loading bundled JSON if present on same origin
  try {
    const r = await fetch("/assets/game8-items.json");
    if (r.ok) {
      const map = await r.json();
      window._game8_items_map = map;
      try { localStorage.setItem("game8-items-v1", JSON.stringify(map)); } catch (e) {}
      return map;
    }
  } catch (e) {}

  window._game8_items_map = {};
  return window._game8_items_map;
}

async function game8ImageForName(name) {
  if (!name) return null;
  const map = await loadGame8Mapping();
  const key = normalizeKey(name);
  return map[key] || null;
}
// expose helpers for testing in page console
try {
  window.fetchGame8Mapping = loadGame8Mapping;
  window.game8ImageForName = game8ImageForName;
} catch (e) {}
class Api {
  constructor() {
    this.characters = new Map();
    this.talents = new Map();
    this.weapons = new Map();
    this.materials = new Map();
    this.icons = new Map();
  }
  async request(path) {
    const key = "genshin-up-api-v1:" + path;
    const ttl = path.includes("query=names") ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    try {
      const cached = JSON.parse(localStorage.getItem(key) || "null");
      if (cached && Date.now() - cached.savedAt < ttl) return cached.data;
    } catch {}
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(API + path, { signal: controller.signal });
      if (!response.ok) throw Error("API " + response.status);
      const json = await response.json();
      const data = json.result ?? json;
      try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
  async list() {
    const items = await this.request(
      "/characters?query=names&matchCategories=true&verboseCategories=true&dumpResult=true",
    );
    items.filter(Boolean).forEach((x) => this.characters.set(x.name, x));
    return [...this.characters.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
  }
  async character(name) {
    if (this.characters.get(name)?.costs) return this.characters.get(name);
    const x = await this.request(
      "/characters?query=" + encodeURIComponent(name) + "&dumpResult=true",
    );
    this.characters.set(name, x);
    return x;
  }
  async talent(name) {
    if (!this.talents.has(name))
      this.talents.set(
        name,
        this.request(
          "/talents?query=" + encodeURIComponent(name) + "&dumpResult=true",
        ).catch(() => null),
      );
    return this.talents.get(name);
  }
  async material(name) {
    if (!name) return null;
    if (!this.materials.has(name))
      this.materials.set(
        name,
        this.request(
          "/materials?query=" + encodeURIComponent(name) + "&dumpResult=true&matchNames=true",
        ).catch(() => null),
      );
    return this.materials.get(name);
  }
  async weaponList() {
    const items = await this.request(
      "/weapons?query=names&matchCategories=true&verboseCategories=true&dumpResult=true",
    );
    items.filter(Boolean).forEach((x) => this.weapons.set(x.name, x));
    return [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }
  async weapon(name) {
    if (!name) return null;
    if (this.weapons.get(name)?.costs) return this.weapons.get(name);
    const x = await this.request(
      "/weapons?query=" + encodeURIComponent(name) + "&dumpResult=true&matchNames=true",
    );
    const resolved = x?.name ? x : null;
    this.weapons.set(name, resolved);
    return resolved;
  }
  async icon(name) {
    const cacheKey = name;
    if (!this.icons.has(cacheKey)) {
      this.icons.set(
        cacheKey,
        (async () => {
          const material = await this.material(name);
          const filename = material?.images?.icon || material?.images?.filename_icon || material?.images?.icon_mihoyo || material?.images?.mihoyo_icon;
          const candidates = [];
          if (filename) {
            const f = gameAssetUrl(filename) || (filename.startsWith('http') ? filename : null);
            if (f) candidates.push(f);
          }
          // include genshin.dev / jmp hosted material icon
          const devIcon = materialIconUrl(name);
          if (devIcon) candidates.push(devIcon);
          // include Game8 candidates
          const g8 = game8MaterialCandidates(name);
          g8.forEach((u) => candidates.push(u));
          // try dynamic mapping (may fetch Game8 and parse) and prefer it first
          try {
            const g8map = await game8ImageForName(name);
            if (g8map) candidates.unshift(g8map);
          } catch (e) {}
          // dedupe and return array (attachImageFallback will handle it)
          return Array.from(new Set(candidates.filter(Boolean)));
        })(),
      );
    }
    return this.icons.get(cacheKey);
  }
}
class LocalStore {
  load() {
    try {
      return {
        selected: [],
        completed: [],
        inventory: {},
        language: "pt",
        ...JSON.parse(localStorage.getItem("genshin-up-state-v3") || localStorage.getItem("genshin-up-state-v2") || "{}"),
      };
    } catch {
      return { selected: [], completed: [], inventory: {}, language: "pt" };
    }
  }
  save(selected, completed, inventory, language) {
    localStorage.setItem(
      "genshin-up-state-v3",
      JSON.stringify({
        selected: [...selected.values()].map(
          ({ data, loading, error, ...x }) => x,
        ),
        completed: [...completed.values()].map(
          ({ data, loading, error, ...x }) => x,
        ),
        inventory,
        language,
      }),
    );
  }
}
class Calculator {
  constructor(api) {
    this.api = api;
  }
  async calculate(selected) {
    const totals = new Map(),
      categories = new Map(),
      add = (item, cat) => {
        if (!item?.name) return;
        totals.set(
          item.name,
          (totals.get(item.name) || 0) + Number(item.count || 0),
        );
        if (!categories.has(item.name)) categories.set(item.name, new Set());
        categories.get(item.name).add(cat);
      };
    for (const [name, x] of selected) {
      if (!x.data) continue;
      for (const [k, l] of phases)
        if (x.curLevel <= l && x.tgtLevel > l)
          (x.data.costs?.[k] || []).forEach((i) => add(i, "Ascens\u00e3o"));
      const data = await this.api.talent(name);
      for (const t of talents)
        for (let l = x.talents[t].cur + 1; l <= x.talents[t].tgt; l++)
          (data?.costs?.["lvl" + l] || []).forEach((i) => add(i, "Talento"));
      if (x.weapon?.name && x.weapon.cur < x.weapon.tgt) {
        const weapon = await this.api.weapon(x.weapon.name);
        if (weapon?.costs) {
          for (const [k, l] of weaponPhases)
            if (x.weapon.cur <= l && x.weapon.tgt > l)
              (weapon.costs?.[k] || []).forEach((i) => add(i, "Ascens\u00e3o"));
        }
      }
    }
    return { totals, categories };
  }
}
const pic = (x) =>
    assetUrl(
      x?.images?.mihoyo_icon,
      x?.images?.['hoyolab-avatar'],
      x?.images?.portrait,
      x?.images?.card,
      x?.images?.hoyowiki_icon,
      x?.images?.fandom,
      x?.images?.filename_icon,
    );
const clamp = (x, min, max) => Math.max(min, Math.min(max, Number(x) || min));
class Components {
  static grid(root, chars, selected, toggle) {
    root.replaceChildren();
    if (!chars.length) {
      root.innerHTML = '<p class="note">' + t("noCharacters") + '</p>';
      return;
    }
    const selectedNames = selected instanceof Map ? selected : new Map(selected);
    chars.forEach((x) => {
      const b = document.createElement("button"),
        im = pic(x),
        color = colors[x.elementText] || "#777";
      b.dataset.name = x.name;
      const selectedData = selectedNames.get(x.name);
      const weaponImage = selectedData?.weapon?.data
        ? gameAssetUrl(
            selectedData.weapon.data.images?.mihoyo_icon ||
              selectedData.weapon.data.images?.icon ||
              selectedData.weapon.data.images?.filename_icon,
          )
        : null;
      b.type = "button";
      b.className = "chip" + (selectedNames.has(x.name) ? " selected" : "");
      b.innerHTML =
        (im
          ? '<img class="icon" src="' + im + '" alt="">'
          : '<i class="dot" style="background:' + color + '"></i>') +
        (weaponImage
          ? '<img class="weapon-icon icon" src="' +
            weaponImage +
            '" alt="Arma">'
          : "") +
        '<span>' + x.name + "</span>";
      const imgEl = b.querySelector("img");
      if (imgEl) {
        imgEl.loading = 'lazy';
        attachImageFallback(imgEl, im);
      }
      b.onclick = () => toggle(x.name);
      root.append(b);
    });
  }
  static selected(root, map, remove, change) {
    root.replaceChildren();
    if (!map.size) {
      root.innerHTML =
        '<p class="note">' + t("noSelected") + '</p>';
      return;
    }
    for (const [name, x] of map) {
      const c = document.createElement("article");
      c.className = "card";
      if (x.loading) {
        c.innerHTML =
          '<div class="head"><span class="name">' +
          name +
          '</span><span class="elem">' +
          t("loading") +
          '</span></div>';
        root.append(c);
        continue;
      }
      if (x.error) {
        c.innerHTML =
          '<div class="head"><span class="name">' +
          name +
          '</span><button class="remove">' +
          (state.language === "pt" ? "Remover" : "Remove") +
          '</button></div>';
        c.querySelector("button").onclick = () => remove(name);
        root.append(c);
        continue;
      }
      const im = pic(x.data);
      const weaponImage = gameAssetUrl(
        x.weapon?.data?.images?.mihoyo_icon ||
          x.weapon?.data?.images?.icon ||
          x.weapon?.data?.images?.filename_icon,
      );
      const weaponIcon = weaponImage
        ? '<img class="weapon-icon icon" src="' + weaponImage + '" alt="' +
          (x.weapon?.name || t("weaponLabel")) +
          '">'
        : "";
      const color = colors[x.elem] || "#777";
      const hasCompleteGoal =
        x.tgtLevel === 90 &&
        talents.every((talent) => x.talents[talent].tgt === 10) &&
        (!x.weapon || x.weapon.tgt === x.weapon.cur);
      const weaponStatus = x.weapon
        ? x.weapon.loading
          ? t("searchingWeapon")
          : x.weapon.error
          ? t("weaponNotFound")
          : x.weapon.data
          ? (x.weapon.data.name || x.weapon.name) +
            (x.weapon.data.rarity ? " • " + x.weapon.data.rarity + "★" : "")
          : x.weapon.name
        : "";
      const weaponPreview = x.weapon
        ? '<div class="weapon-preview">' +
          (weaponImage
            ? weaponIcon
            : '<span class="dot" style="background:' + color + '"></span>') +
          '<span>' + weaponStatus + '</span></div>'
        : "";
      c.innerHTML =
        '<div class="head">' +
        (im ? '<img class="icon" src="' + im + '" alt="">' : '') +
        '<span class="name">' +
        name +
        '</span><span class="elem">' +
        x.elem +
        '</span><button class="remove" type="button">' +
        (state.language === "pt" ? "Remover" : "Remove") +
        '</button><button class="goal" type="button">' +
        (hasCompleteGoal ? t("goalComplete") : t("goalLabel")) +
        '</button></div><div class="fields"><div class="field"><label>' +
        t("characterLevel") +
        '</label><div class="pair"><input data-f="curLevel" type="number" min="1" max="90" value="' +
        x.curLevel +
        '"><span>→</span><input data-f="tgtLevel" type="number" min="1" max="90" value="' +
        x.tgtLevel +
        '"></div></div><div class="field"><label>' +
        t("weaponLabel") +
        '</label><div class="pair"><input data-f="weaponName" list="weaponNames" type="text" autocomplete="off" value="' +
        ((x.weapon && x.weapon.name) || "") +
        '" placeholder="' +
        (state.language === "pt" ? "Buscar arma…" : "Search weapon…") +
        '"></div></div>' +
        weaponPreview +
        '<div class="field"><label>' +
        t("weaponLevel") +
        '</label><div class="pair"><input data-f="weaponCur" type="number" min="1" max="90" value="' +
        ((x.weapon && x.weapon.cur) || 1) +
        '"><span>→</span><input data-f="weaponTgt" type="number" min="1" max="90" value="' +
        ((x.weapon && x.weapon.tgt) || 80) +
        '"></div></div></div><div class="talents">' +
        talents
          .map(
            (talentKey, i) =>
              '<div class="field"><span class="talent">' +
              t("talentLabel") +
              ' ' +
              (i + 1) +
              '</span><div class="pair"><input data-t="' +
              talentKey +
              '" data-k="cur" type="number" min="1" max="10" value="' +
              x.talents[talentKey].cur +
              '"><span>→</span><input data-t="' +
              talentKey +
              '" data-k="tgt" type="number" min="1" max="10" value="' +
              x.talents[talentKey].tgt +
              '"></div></div>',
          )
          .join("") +
        "</div>";
      const inputs = c.querySelectorAll("input");
      inputs.forEach((input, index) => {
        input.id =
          "character-" + name.replace(/[^a-z0-9]/gi, "-") + "-" + index;
        input.name = input.id;
        input.autocomplete = "off";
      });
      c.querySelectorAll(".field").forEach((field) => {
        const label = field.querySelector("label");
        const input = field.querySelector("input");
        if (label && input) label.htmlFor = input.id;
      });
      const headImg = c.querySelector(".head .icon");
      if (headImg) { headImg.loading = 'lazy'; attachImageFallback(headImg, im); }
      const wimg = c.querySelector(".weapon-icon");
      if (wimg) { wimg.loading = 'lazy'; attachImageFallback(wimg, weaponImage); }
      c.querySelector(".goal").onclick = () => change(name, "complete");
      c.querySelector(".remove").onclick = () => remove(name);
      c.querySelectorAll("[data-f]").forEach((i) => {
        i.onchange = (e) => {
          const field = e.target.dataset.f;
          if (field === "weaponName") {
            change(name, field, e.target.value.trim());
            return;
          }
          change(name, field, clamp(e.target.value, 1, 90));
        };
      });
      c.querySelectorAll("[data-t]").forEach(
        (i) =>
          (i.onchange = (e) =>
            change(
              name,
              "talent",
              clamp(e.target.value, 1, 10),
              e.target.dataset.t,
              e.target.dataset.k,
            )),
      );
      root.append(c);
    }
  }
  static completed(root, map, restore) {
    root.replaceChildren();

    for (const [name, character] of map) {
      const card = document.createElement("article");
      const image = pic(character.data);
      card.className = "completed-card";
      card.innerHTML =
        (image ? '<img class="icon" src="' + image + '" alt="">' : "") +
        '<div><span class="name">' +
        name +
        "</span><small>Nível " +
        character.curLevel +
        " · talentos " +
        talents.map((key) => character.talents[key].cur).join("/") +
        '</small></div><button class="restore" type="button">Planejar novamente</button>';

      card.querySelector(".restore").onclick = () => restore(name);
      card.querySelector(".icon")?.addEventListener("error", (event) => {
        event.currentTarget.remove();
      });
      root.append(card);
    }
  }
  static async receipt(root, result, inventory, api, onOwned) {
    root.innerHTML = '<p class="note">' + t("loading") + '</p>';
    const groups = {};
    for (const [name, need] of result.totals) {
      const cats = result.categories.get(name),
        rawCat =
          name === "Mora"
            ? "Mora"
            : cats?.has("Ascens\u00e3o") || cats?.has("Ascension")
            ? "Ascens\u00e3o"
            : cats?.has("Talento") || cats?.has("Talent")
            ? "Talento"
            : "Outros";
      (groups[rawCat] ??= []).push({ name, need });
    }
    const icons = Object.fromEntries(
        await Promise.all(
          [...result.totals.keys()].map(async (n) => [n, await api.icon(n)]),
        ),
      ),
      fmt = (x) => Number(x).toLocaleString(state.language === "pt" ? "pt-BR" : "en-US"),
      box = document.createElement("article");
    box.className = "receipt";
    box.innerHTML =
      '<h3>' + t("materialsHeader") + '</h3><p class="rsub">' +
      result.totals.size +
      t("materialsSub") +
      '</p>';
    for (const rawCat of ["Mora", "Ascens\u00e3o", "Talento", "Outros"]) {
      if (!groups[rawCat]) continue;
      const g = document.createElement("div");
      g.className = "group";
      const label =
        rawCat === "Mora"
          ? t("categoryMora")
          : rawCat === "Ascens\u00e3o"
          ? t("categoryAscension")
          : rawCat === "Talento"
          ? t("categoryTalent")
          : t("categoryOther");
      g.innerHTML = '<div class="cat">' + label + "</div>";
      groups[rawCat]
        .sort((a, b) => b.need - a.need)
        .forEach(({ name, need }) => {
          const have = Math.max(0, Number(inventory[name] || 0)),
            left = Math.max(0, need - have),
            r = document.createElement("div");
          r.className = "mat" + (!left ? " complete" : "");
          const icon = Array.isArray(icons[name]) ? icons[name][0] : icons[name];
          const iconHtml = icon ? '<img class="icon" src="' + icon + '" alt="">' : "";
          r.innerHTML =
            '<div class="matname">' +
            iconHtml +
            "<span>" +
            name +
            '</span></div><strong class="amount">' +
            fmt(need) +
            '</strong><label class="owned" for="inventory-' +
            name.replace(/[^a-z0-9]/gi, "-") +
            '">' +
            t("ownsLabel") +
            ' <input id="inventory-' +
            name.replace(/[^a-z0-9]/gi, "-") +
            '" name="inventory-' +
            name.replace(/[^a-z0-9]/gi, "-") +
            '" type="number" min="0" value="' +
            have +
            '"></label><span class="amount remaining">' +
            t("remainingLabel") +
            ' ' +
            fmt(left) +
            "</span>";
          r.querySelector("input").onchange = (e) => {
            const v = Math.max(0, Number(e.target.value) || 0);
            e.target.value = v;
            onOwned(name, v);
            r.classList.toggle("complete", v >= need);
            r.querySelector(".remaining").textContent =
              t("remainingLabel") + " " + fmt(Math.max(0, need - v));
          };
          attachImageFallback(r.querySelector(".icon"), icons[name]);
          g.append(r);
        });
      box.append(g);
    }
    box.insertAdjacentHTML(
      "beforeend",
      '<div class="total"><span>' +
        t("totalLabel") +
        '</span><span>' +
        fmt(
          [...result.totals]
            .filter(([n]) => n !== "Mora")
            .reduce((s, [, v]) => s + v, 0),
        ) +
        "</span></div>",
    );
    root.replaceChildren(box);
  }
}
const api = new Api(),
  store = new LocalStore(),
  calculator = new Calculator(api),
  saved = store.load(),
  state = {
    selected: new Map(saved.selected.map((x) => [x.name, x])),
    completed: new Map(saved.completed.map((x) => [x.name, x])),
    inventory: saved.inventory,
    language: saved.language || "pt",
  },
  el = {
    grid: document.querySelector("#charGrid"),
    search: document.querySelector("#search"),
    list: document.querySelector("#selectedList"),
    weaponList: document.querySelector("#weaponNames"),
    completedList: document.querySelector("#completedList"),
    completedSection: document.querySelector("#completedSection"),
    btn: document.querySelector("#calcBtn"),
    section: document.querySelector("#resultSection"),
    result: document.querySelector("#resultBox"),
    count: document.querySelector("#charCount"),
    sel: document.querySelector("#selCount"),
    completeCount: document.querySelector("#completeCount"),
    settingsToggle: document.querySelector("#settingsToggle"),
    settingsPanel: document.querySelector("#settingsPanel"),
    resetAllBtn: document.querySelector("#resetAllBtn"),
    resetMaterialsBtn: document.querySelector("#resetMaterialsBtn"),
    clearCharactersBtn: document.querySelector("#clearCharactersBtn"),
    languageSwitch: document.querySelector("#languageSwitch"),
    clearCacheBtn: document.querySelector("#clearCacheBtn"),
    exportBtn: document.querySelector("#exportBtn"),
    importBtn: document.querySelector("#importBtn"),
    importFile: document.querySelector("#importFile"),
    languageLabel: document.querySelector("#languageLabel"),
    settingsNote: document.querySelector("#settingsNote"),
    charactersTitle: document.querySelector("#charactersTitle"),
    selectedTitle: document.querySelector("#selectedTitle"),
    selectAllBtn: document.querySelector("#selectAllBtn"),
  };
let chars = [], weapons = [];
let gridInitialized = false;
let lastSearch = "";
const save = () => store.save(state.selected, state.completed, state.inventory, state.language),
  filter = () => {
    const q = el.search.value.trim().toLocaleLowerCase("pt-BR");
    return q
      ? chars.filter((x) => x.name.toLocaleLowerCase("pt-BR").includes(q))
      : chars;
  };
function render() {
  if (el.charactersTitle.firstChild)
    el.charactersTitle.firstChild.textContent = t("charactersTitle") + " ";
  if (el.selectedTitle.firstChild)
    el.selectedTitle.firstChild.textContent = t("selectedTitle") + " ";
  el.count.textContent = chars.length + " " + (state.language === "pt" ? "disponíveis" : "available");
  el.sel.textContent = state.selected.size + " " + (state.language === "pt" ? "selecionados" : "selected");
  el.completeCount.textContent = state.completed.size + " " + (state.language === "pt" ? "completos" : "complete");
  el.settingsToggle.textContent = t("settingsToggle");
  el.resetAllBtn.textContent = t("resetAll");
  el.resetMaterialsBtn.textContent = t("resetMaterials");
  el.clearCharactersBtn.textContent = t("clearCharacters");
  el.clearCacheBtn.textContent = t("clearCache");
  el.exportBtn.textContent = t("export");
  el.importBtn.textContent = t("import");
  el.languageSwitch.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
  });
  el.settingsNote.textContent = t("settingsNote");
  el.languageLabel.textContent = state.language === "pt" ? "Idioma" : "Language";
  el.completedSection.hidden = !state.completed.size;
  el.btn.disabled = !state.selected.size;
  el.btn.textContent = t("calcLabel");
  if (el.selectAllBtn) el.selectAllBtn.textContent = t("selectAll");
  const q = el.search.value.trim().toLocaleLowerCase("pt-BR");
  if (!gridInitialized || q !== lastSearch) {
    Components.grid(el.grid, filter(), state.selected, toggle);
    gridInitialized = true;
    lastSearch = q;
  } else {
    // update chip selected state only
    el.grid.querySelectorAll('.chip').forEach((chip) => {
      const name = chip.dataset.name;
      if (!name) return;
      chip.classList.toggle('selected', state.selected.has(name));
    });
  }
  Components.selected(el.list, state.selected, remove, change);
  Components.completed(el.completedList, state.completed, restoreCompleted);
}
async function toggle(name) {
  if (state.selected.has(name)) return remove(name);
  state.selected.set(name, { name, loading: true });
  render();
  try {
    const data = await api.character(name);
    state.selected.set(name, {
      name,
      data,
      elem: data.elementText || "Anemo",
      curLevel: 1,
      tgtLevel: 90,
      talents: {
        combat1: { cur: 1, tgt: 10 },
        combat2: { cur: 1, tgt: 10 },
        combat3: { cur: 1, tgt: 10 },
      },
    });
  } catch {
    state.selected.set(name, { name, error: true });
  }
  save();
  render();
}
function remove(name) {
  state.selected.delete(name);
  save();
  render();
}
function restoreCompleted(name) {
  const character = state.completed.get(name);
  if (!character) return;
  state.completed.delete(name);
  state.selected.set(name, character);
  save();
  render();
}
function change(name, f, v, t, k) {
  const x = state.selected.get(name);
  if (f === "complete") {
    // Preserve exactly the user's current/target configuration. Completion only
    // removes this character from active material calculations.
    state.selected.delete(name);
    state.completed.set(name, x);
  } else if (f === "talent") {
    x.talents[t][k] = v;
  } else if (f === "weaponName") {
    x.weapon = x.weapon || { cur: 1, tgt: 80, name: "", data: null, loading: false, error: false };
    x.weapon.name = v;
    x.weapon.data = null;
    x.weapon.error = false;
    x.weapon.loading = Boolean(v);
    if (v) {
      api.weapon(v).then((data) => {
        const current = state.selected.get(name);
        if (current?.weapon?.name === v) {
          current.weapon.loading = false;
          current.weapon.data = data;
          current.weapon.error = !data;
          save();
          render();
        }
      });
    }
  } else if (f === "weaponCur") {
    x.weapon = x.weapon || { cur: 1, tgt: 80, name: "", data: null, loading: false, error: false };
    x.weapon.cur = v;
  } else if (f === "weaponTgt") {
    x.weapon = x.weapon || { cur: 1, tgt: 20, name: "" };
    x.weapon.tgt = v;
  } else {
    x[f] = v;
  }
  save();
  render();
}
el.search.oninput = render;
el.settingsToggle.onclick = () => {
  el.settingsPanel.hidden = !el.settingsPanel.hidden;
};
el.resetAllBtn.onclick = () => {
  state.selected.clear();
  state.completed.clear();
  state.inventory = {};
  state.language = "pt";
  el.settingsPanel.hidden = true;
  save();
  render();
  document.documentElement.lang = "pt-BR";
};
el.resetMaterialsBtn.onclick = () => {
  state.inventory = {};
  save();
  if (!el.section.hidden) {
    el.section.hidden = true;
  }
};
el.clearCharactersBtn.onclick = () => {
  state.selected.clear();
  state.completed.clear();
  save();
  render();
};
el.selectAllBtn.onclick = () => {
  // Select all characters (load data as needed)
  chars.forEach((c) => {
    if (!state.selected.has(c.name)) toggle(c.name);
  });
};
function serializableCollection(collection) {
  return [...collection.values()].map(({ data, loading, error, ...item }) => item);
}
function exportBackup() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: {
      selected: serializableCollection(state.selected),
      completed: serializableCollection(state.completed),
      inventory: state.inventory,
      language: state.language,
    },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "genshin-up-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  link.click();
  URL.revokeObjectURL(link.href);
}
function clearLocalData() {
  if (!window.confirm(t("cacheWarning"))) return;
  Object.keys(localStorage).filter((key) => key.startsWith("genshin-up-") || key === "game8-items-v1").forEach((key) => localStorage.removeItem(key));
  window.location.reload();
}
async function importBackup(file) {
  if (!file || !window.confirm(t("importWarning"))) return;
  try {
    const payload = JSON.parse(await file.text());
    const imported = payload.app || payload;
    if (!Array.isArray(imported.selected) || !Array.isArray(imported.completed) || !imported.inventory || typeof imported.inventory !== "object") throw Error("invalid");
    state.selected = new Map(imported.selected.filter((item) => item?.name).map((item) => [item.name, item]));
    state.completed = new Map(imported.completed.filter((item) => item?.name).map((item) => [item.name, item]));
    state.inventory = imported.inventory;
    state.language = imported.language === "en" ? "en" : "pt";
    save();
    window.location.reload();
  } catch {
    window.alert(t("invalidImport"));
  }
}
el.languageSwitch.onclick = (event) => {
  const language = event.target.closest("[data-language]")?.dataset.language;
  if (!language || language === state.language) return;
  state.language = language;
  document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  save();
  render();
};
el.clearCacheBtn.onclick = clearLocalData;
el.exportBtn.onclick = exportBackup;
el.importBtn.onclick = () => el.importFile.click();
el.importFile.onchange = (event) => {
  importBackup(event.target.files?.[0]);
  event.target.value = "";
};
el.btn.onclick = async () => {
  el.btn.disabled = true;
  el.btn.textContent = t("calculating");
  const result = await calculator.calculate(state.selected);
  await Components.receipt(
    el.result,
    result,
    state.inventory,
    api,
    (name, v) => {
      state.inventory[name] = v;
      save();
    },
  );
  el.section.hidden = false;
  el.section.scrollIntoView({ behavior: "smooth", block: "start" });
  render();
};
async function init() {
  document.documentElement.lang = state.language === "pt" ? "pt-BR" : "en";
  try {
    [chars, weapons] = await Promise.all([api.list(), api.weaponList()]);
    el.weaponList.replaceChildren();
    weapons.forEach((weapon) => {
      const option = document.createElement("option");
      option.value = weapon.name;
      el.weaponList.append(option);
    });
    for (const collection of [state.selected, state.completed]) {
      for (const [name, x] of collection) {
        try {
          const data = await api.character(name);
          const weaponData = x.weapon?.name ? await api.weapon(x.weapon.name) : null;
          const weapon = x.weapon?.name
            ? {
                ...(x.weapon || {}),
                data: weaponData,
                error: !weaponData,
                loading: false,
              }
            : x.weapon;
          collection.set(name, {
            ...x,
            data,
            weapon,
            elem: data.elementText || x.elem || "Anemo",
          });
        } catch {
          collection.set(name, { ...x, error: true });
        }
      }
    }
    render();
  } catch (e) {
    el.grid.innerHTML = '<p class="note">' + t("apiError") + '</p>';
    console.error(e);
  }
}
init();
