const byId = id => document.getElementById(id);
const fields = ["institute", "program", "course", "semester", "discipline"];
const allLabels = ["Все институты", "Все направления", "Все курсы", "Все семестры", "Все дисциплины"];
const entries = catalog.curriculum.map(entry => {
  const program = catalog.programs.find(p => p.id === entry.program);
  const institute = catalog.institutes.find(i => i.id === program.institute);
  return { ...entry, institute: institute.id, course: String(courseForSemester(entry.semester)),
    semester: String(entry.semester), name: catalog.disciplines[entry.discipline],
    programName: program.name, instituteName: institute.name };
});
function state() {
  const params = new URLSearchParams(location.hash.slice(1));
  for (const [oldKey, key] of Object.entries({subject:"discipline", track:"program", year:"course", term:"semester"})) {
    if (params.has(oldKey) && !params.has(key)) params.set(key, params.get(oldKey));
    params.delete(oldKey);
  }
  params.delete("view");
  return params;
}
function matches(entry, params, keys = fields) {
  return keys.every(k => !params.get(k) || entry[k] === params.get(k));
}
function findEntries(params) {
  const query = (params.get("q") || "").trim().toLowerCase();
  return entries.filter(e => matches(e, params) && e.name.toLowerCase().includes(query));
}
function emptyState(message) {
  return `<div class="empty"><img src="../../static/img/mascot/senka-peeks.svg" alt="Серый Сенька"><p>${message}</p></div>`;
}
function materialCards(materials) {
  if (!materials.length) return emptyState("Материалов пока нет");
  return '<label class="controls">Тип материала <select id="type"><option value="">Все типы</option>'
    + catalog.materialTypes.map(t => `<option>${t}</option>`).join("") + '</select></label><div class="cards">'
    + materials.map(({title,type,entry:e}) => `<article class="card" data-type="${type}"><span class="tag">${type}</span>
      <h3>${title}</h3><p>${e.name}</p><small>${e.course} курс · ${e.semester} семестр<br>${e.programName}<br>${e.instituteName}</small></article>`).join("")
    + '</div><div id="no-type" hidden>' + emptyState("Материалы не найдены. Попробуйте другой тип материала.") + '</div>';
}
function render() {
  const params = state();
  const list = findEntries(params);
  const query = params.get("q") || "";
  byId("search").value = query;
  const applied = fields.filter(k => params.get(k));
  byId("filter-count").textContent = applied.length || "";
  const latest = !query.trim() && !applied.length;
  const materials = list.flatMap(entry => entry.materials.map(m => ({ ...m, entry })))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  const title = latest ? "Последние материалы" : "Материалы";
  byId("crumbs").innerHTML = '<a href="#">ЮФУ</a> / ' + title;
  byId("screen").innerHTML = `<h1>${title}</h1>` + (list.length || latest
    ? materialCards(latest ? materials.slice(0, 10) : materials)
    : emptyState("Материалы не найдены. Попробуйте другое название или измените фильтры."));
  const type = byId("type");
  if (type) type.onchange = () => {
    const cards = [...document.querySelectorAll(".card")];
    for (const card of cards) card.hidden = !!type.value && card.dataset.type !== type.value;
    byId("no-type").hidden = cards.some(card => !card.hidden);
  };
}

function fillFilters(draft) {
  fields.forEach((key,index) => {
    const available = entries.filter(e => matches(e,draft,fields.slice(0,index)));
    const options = new Map(available.map(e => [e[key], {
      institute:e.instituteName, program:e.programName, course:e.course + " курс", semester:e.semester + " семестр", discipline:e.name
    }[key]]));
    const select = byId(key);
    select.replaceChildren(new Option(allLabels[index], ""), ...[...options].map(([id,name]) => new Option(name,id)));
    select.value = draft.get(key) || "";
    select.onchange = () => {
      for (const child of fields.slice(index)) draft.delete(child);
      if (select.value) draft.set(key,select.value);
      fillFilters(draft);
    };
  });
  byId("apply").onclick = () => {
    location.hash = draft.toString();
    byId("filters").close();
  };
}
byId("open-filters").onclick = () => {
  fillFilters(state());
  byId("filters").showModal();
};
byId("reset").onclick = () => {
  const draft = state();
  fields.forEach(key => draft.delete(key));
  location.hash = draft.toString();
  fillFilters(draft);
};
byId("close").onclick = () => byId("filters").close();
byId("search").oninput = event => {
  const params = state();
  if (event.target.value) params.set("q",event.target.value);
  else params.delete("q");
  location.replace("#" + params);
};
window.addEventListener("hashchange",render);
render();
