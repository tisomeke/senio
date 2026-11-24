const screenRoot = document.querySelector("#screen");
const crumbs = document.querySelector("#crumbs");
const asset = "../../static/img/mascot/";
const unique = values => [...new Set(values)];

function row(url, title, detail = "") {
  return `<a class="row" href="${url}"><span><strong>${title}</strong><small>${detail}</small></span><span class="arrow" aria-hidden="true">↗</span></a>`;
}

function disciplineUrl(program, course, discipline) {
  const { selected } = semesterOptions(program.id, course, discipline);
  const url = `#/institutes/${program.institute}/${program.id}/${course}/${discipline}`;
  return selected ? url + "/" + selected : url;
}

function searchDisciplines(entries, globalSearch) {
  const results = document.querySelector("#items");
  const input = document.querySelector("#search");
  function update() {
    const query = input.value.trim().toLocaleLowerCase("ru");
    if (globalSearch && !query) {
      results.replaceChildren();
      return;
    }
    const matches = new Map();
    for (const entry of entries) {
      const title = catalog.disciplines[entry.discipline];
      if (!title.toLocaleLowerCase("ru").includes(query)) continue;
      const program = catalog.programs.find(item => item.id === entry.program);
      const course = courseForSemester(entry.semester);
      const url = disciplineUrl(program, course, entry.discipline);
      matches.set(url, row(url, title, globalSearch ? `${program.name} · ${course} курс` : ""));
    }
    results.innerHTML = [...matches.values()].join("") || "<p>Дисциплины не найдены. Попробуйте другое название.</p>";
  }
  input.oninput = update;
  update();
}

const searchBox = '<div class="controls"><input type="search" id="search" aria-label="Поиск дисциплины" placeholder="Название дисциплины"></div><div id="items" class="items" aria-live="polite"></div>';

function render() {
  const parts = location.hash.slice(1).split("/").filter(Boolean);
  const trail = [{ name: "ЮФУ", url: "#" }];
  function step(name, depth) {
    trail.push({ name, url: "#/" + parts.slice(0, depth).join("/") });
  }
  function page(title, content, context = "") {
    crumbs.innerHTML = trail.map((item, i) => i === trail.length - 1
      ? `<span aria-current="page">${item.name}</span>`
      : `<a href="${item.url}">${item.name}</a><span aria-hidden="true">/</span>`).join("");
    const parent = trail.at(-2);
    screenRoot.innerHTML = (parent ? `<a class="back" href="${parent.url}">← Назад</a>` : "")
      + (context ? `<p class="context">${context}</p>` : "")
      + (title ? `<h1>${title}</h1>` : "") + content;
    document.title = title ? title + " · Senio" : "Senio";
    window.scrollTo(0, 0);
  }
  function listing(title, rows) {
    page(title, '<div class="items">' + rows.join("") + "</div>");
  }
  function invalid() {
    location.replace("#");
  }
  if (!parts.length) {
    page("", `<div class="hero"><div><p>${catalog.university.name}</p><h1>Учебные материалы</h1>
      <a class="button" href="#/institutes">Выбрать институт →</a></div>
      <img src="${asset}senka-at-laptop-book.svg" alt="Сенька за ноутбуком"></div>
      <h2>Найти дисциплину</h2>${searchBox}`);
    searchDisciplines(catalog.curriculum, true);
    return;
  }
  const [root, instituteId, programId, courseId, discipline, semesterId] = parts;
  if (root !== "institutes" || parts.length > 6) return invalid();
  step("Институты", 1);
  if (!instituteId) {
    listing("Институты и факультеты", catalog.institutes.map(i => row("#/institutes/" + i.id, i.name)));
    return;
  }
  const institute = catalog.institutes.find(i => i.id === instituteId);
  if (!institute) return invalid();
  step(institute.name, 2);
  const programs = catalog.programs.filter(p => p.institute === instituteId);
  if (!programId) {
    listing("Направления подготовки", programs.map(p => row(trail.at(-1).url + "/" + p.id, p.name)));
    return;
  }
  const program = programs.find(p => p.id === programId);
  if (!program) return invalid();
  step(program.name, 3);
  const entries = catalog.curriculum.filter(e => e.program === programId);
  const courses = unique(entries.map(e => courseForSemester(e.semester))).sort((a,b) => a-b);
  if (!courseId) {
    listing("Курс обучения", courses.map(c => row(trail.at(-1).url + "/" + c, c + " курс")));
    return;
  }
  const course = Number(courseId);
  if (!courses.includes(course)) return invalid();
  step(course + " курс", 4);
  if (!discipline) {
    page("Дисциплины", searchBox);
    searchDisciplines(entries.filter(e => courseForSemester(e.semester) === course), false);
    return;
  }
  const { semesters, selected } = semesterOptions(programId, course, discipline);
  if (!semesters.length) return invalid();
  const name = catalog.disciplines[discipline];
  if (!selected) step(name, 5);
  if (!semesterId) {
    if (selected) return location.replace(disciplineUrl(program, course, discipline));
    listing("Выберите семестр", semesters.map(s => row(trail.at(-1).url + "/" + s, s + " семестр")));
    return;
  }
  const semester = Number(semesterId);
  if (!semesters.includes(semester)) return invalid();
  step(selected ? name : semester + " семестр", 6);
  const { materials } = entries.find(e => e.discipline === discipline && e.semester === semester);
  const context = `Учебные материалы · ${course} курс · ${semester} семестр`;
  if (!materials.length) {
    page(name, `<div class="empty mt-6"><img src="${asset}senka-peeks.svg" alt="Серый Сенька"><p>Материалов пока нет</p></div>`, context);
    return;
  }
  page(name, `<div class="controls"><label for="type">Тип материала</label><select id="type"><option value="">Все типы</option>
    ${catalog.materialTypes.map(t => `<option>${t}</option>`).join("")}</select></div><div class="items" id="items" aria-live="polite"></div>`, context);
  const type = document.querySelector("#type");
  function filterMaterials() {
    document.querySelector("#items").innerHTML = materials.filter(m => !type.value || m.type === type.value)
      .map(m => `<div class="row material"><strong>${m.title}</strong><span class="tag">${m.type}</span></div>`).join("")
      || "<p>Материалов этого типа пока нет.</p>";
  }
  type.onchange = filterMaterials;
  filterMaterials();
}

window.addEventListener("hashchange", render);
render();
