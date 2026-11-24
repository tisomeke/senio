const app = document.querySelector("#app");
const universitySelect = document.querySelector("#university");
const universityLogo = document.querySelector(".university-mark");
const instituteSelect = document.querySelector("#institute");
const programSelect = document.querySelector("#program");
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector("#theme-toggle");
const brandLogo = document.querySelector(".brand img");
const demoNote = document.querySelector(".demo-note");
const mascot = "../../static/img/mascot/";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILE_FORMATS = ["DOC", "DOCX", "PDF", "TXT", "PPT", "PPTX", "JPG"];
const iconPaths = {
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-up": '<path d="m18 15-6-6-6 6"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.463.402.807a6.5 6.5 0 0 0 8.268 8.268c.344-.215.829-.003.803.397z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.42 1.42"/><path d="m17.65 17.65 1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.35 17.65-1.42 1.42"/><path d="m19.07 4.93-1.42 1.42"/>',
  x: '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
};
const demoState = {
  user: null,
  returnTo: "#/profile",
  submissions: [],
  reports: [],
  sequence: 0,
};
const state = {
  program: catalog.programs[0]?.id ?? "",
  course: "",
  discipline: "",
  semester: "",
  type: "",
  academicYear: "",
  format: "",
  search: "",
  availableOnly: false,
};

function iconMarkup(name) {
  const paths = iconPaths[name];
  if (!paths) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">${paths}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function nextDemoId(prefix) {
  demoState.sequence += 1;
  return `${prefix}-${Date.now()}-${demoState.sequence}`;
}

function bindTagFilters() {
  document.querySelectorAll("[data-filter]").forEach(tag => {
    tag.addEventListener("click", () => {
      const { filter, value, course, program } = tag.dataset;
      if (state.program !== program) {
        state.program = program;
        Object.assign(state, {
          course: "",
          discipline: "",
          semester: "",
          type: "",
          academicYear: "",
          format: "",
          search: "",
        });
      }
      state.search = "";
      if (filter === "course") {
        state.course = Number(value);
        state.discipline = "";
        state.semester = "";
      } else if (filter === "discipline") {
        state.course = Number(course);
        state.discipline = value;
        state.semester = "";
      } else if (filter === "semester") {
        state.course = courseForSemester(Number(value));
        state.discipline = "";
        state.semester = Number(value);
      } else if (filter === "type") {
        state.type = value;
      } else if (filter === "academic-year") {
        state.academicYear = value;
      } else if (filter === "format") {
        state.format = value;
      }

      if (location.hash === "#/catalog") {
        renderHeader();
        renderCatalog();
      } else {
        location.hash = "#/catalog";
      }
    });
  });
}

function currentProgram() {
  return catalog.programs.find(program => program.id === state.program);
}

function universityForProgram(program) {
  const institute = catalog.institutes.find(item => item.id === program?.institute);
  return catalog.universities.find(item => item.id === institute?.university);
}

function entriesForProgram() {
  return catalog.curriculum.filter(entry => entry.program === state.program);
}

function programCourses() {
  const semesters = catalog.semesters[state.program]
    ?? entriesForProgram().map(entry => entry.semester);
  return [...new Set(semesters.map(courseForSemester))]
    .sort((a, b) => a - b);
}

function materialsForEntry(entry) {
  return entry.materials.map(material => ({
    ...material,
    program: entry.program,
    discipline: entry.discipline,
    semester: entry.semester,
    course: courseForSemester(entry.semester),
  }));
}

function materialsForProgram() {
  return entriesForProgram().flatMap(materialsForEntry);
}

function allMaterials() {
  return catalog.curriculum.flatMap(materialsForEntry);
}

function findMaterial(id) {
  return allMaterials().find(material => material.id === id);
}

function countMaterials(discipline, course) {
  return entriesForProgram()
    .filter(entry => entry.discipline === discipline
      && courseForSemester(entry.semester) === course)
    .reduce((count, entry) => count + entry.materials.length, 0);
}

function universitiesWithPrograms() {
  const universityIds = new Set(catalog.institutes
    .filter(institute => catalog.programs.some(program => program.institute === institute.id))
    .map(institute => institute.university));
  return catalog.universities.filter(university => universityIds.has(university.id));
}

function institutesForUniversity(universityId) {
  const instituteIds = new Set(catalog.programs.map(program => program.institute));
  return catalog.institutes.filter(institute =>
    institute.university === universityId && instituteIds.has(institute.id)
  );
}

function resetProgramFilters() {
  Object.assign(state, {
    course: "",
    discipline: "",
    semester: "",
    type: "",
    academicYear: "",
    format: "",
    search: "",
    availableOnly: false,
  });
}

function renderAfterProgramChange() {
  if (location.hash.startsWith("#/material/")) {
    location.hash = "#/catalog";
    return;
  }
  render();
}

function renderHeader() {
  const universities = universitiesWithPrograms();
  const selectedProgram = currentProgram();
  const selectedInstitute = catalog.institutes.find(institute =>
    institute.id === selectedProgram?.institute
  );
  universitySelect.innerHTML = universities.map(university =>
    `<option value="${escapeHtml(university.id)}">${escapeHtml(university.shortName ?? university.name)}</option>`
  ).join("");
  universitySelect.value = universities.some(university => university.id === selectedInstitute?.university)
    ? selectedInstitute.university
    : universities[0]?.id ?? "";
  const selectedUniversity = universities.find(university => university.id === universitySelect.value);
  if (selectedUniversity?.logo) {
    universityLogo.src = selectedUniversity.logo;
    universityLogo.hidden = false;
  } else {
    universityLogo.removeAttribute("src");
    universityLogo.hidden = true;
  }

  const institutes = institutesForUniversity(universitySelect.value);
  instituteSelect.innerHTML = institutes.map(institute =>
    `<option value="${escapeHtml(institute.id)}">${escapeHtml(institute.name)}</option>`
  ).join("");
  instituteSelect.value = institutes.some(institute => institute.id === selectedProgram?.institute)
    ? selectedProgram.institute
    : institutes[0]?.id ?? "";
  document.querySelector(".profile-label").textContent = demoState.user?.name ?? "Профиль";
  document.querySelector(".avatar").textContent = demoState.user?.name?.[0] ?? "С";
  const programs = catalog.programs.filter(program => program.institute === instituteSelect.value);
  programSelect.innerHTML = programs.map(program =>
    `<option value="${escapeHtml(program.id)}">${escapeHtml(program.name)}</option>`
  ).join("");
  const activeProgram = programs.find(program => program.id === state.program) ?? programs[0];
  if (activeProgram) state.program = activeProgram.id;
  programSelect.value = activeProgram?.id ?? "";
  demoNote.textContent = activeProgram?.id === "test_real_data"
    ? "Структура и список из JSON сверены с архивами ФИИТ; файлы не подключены."
    : "Демо-данные: вымышленные материалы и метаданные; файлов нет";
}

function renderLanding() {
  app.innerHTML = `
    <section class="landing">
      <div class="hero">
        <div class="hero-copy">
          <p class="eyebrow">По курсам и дисциплинам</p>
          <h1>Материалы для твоих курсов</h1>
          <p class="hero-description">Находи конспекты и практикумы, фильтруй по курсам и дисциплинам и делись полезным со студентами.</p>
          <div class="hero-actions">
            <a class="button-primary" href="#/profile">Создать профиль ${iconMarkup("arrow-right")}</a>
            <a class="button-secondary" href="#/catalog">Перейти в каталог</a>
          </div>
        </div>
        <div class="hero-illustration">
          <img src="${mascot}senka-at-laptop-cup.svg" alt="Сенька учится за ноутбуком">
        </div>
      </div>
      <p class="landing-note">Каталог открыт для просмотра без регистрации</p>
    </section>
  `;
}

function treeMarkup() {
  const programEntries = entriesForProgram();
  const courses = programCourses();
  const program = currentProgram();
  const programName = program?.shortName ?? program?.name ?? "Направление";
  return `
    <aside class="tree-panel" id="tree-panel">
      <div class="tree-title" id="tree-toggle" tabindex="0" role="button" aria-expanded="true">
        <h2>Структура каталога</h2>
        ${iconMarkup("chevron-up")}
      </div>
      <div class="tree-scroll">
        <button class="tree-root" type="button" data-action="all">${escapeHtml(programName)}</button>
        ${courses.map(course => {
          const courseEntries = programEntries.filter(entry => courseForSemester(entry.semester) === course);
          const courseMaterialCount = courseEntries.reduce((sum, entry) => sum + entry.materials.length, 0);
          const disciplines = [...new Set(courseEntries.map(entry => entry.discipline))]
            .filter(discipline => !state.availableOnly || countMaterials(discipline, course) > 0);
          const expanded = !state.course || state.course === course;
          return `
            <div class="course-group">
              <button class="course-button${state.course === course ? " active" : ""}" type="button" data-course="${course}" aria-pressed="${state.course === course}">
                <span>${course} курс</span>
                <small>${courseMaterialCount ? `${courseMaterialCount} материала` : "пока пусто"}</small>
              </button>
              ${expanded && disciplines.length ? `<div class="discipline-list">${disciplines.map(discipline => {
                const materialCount = countMaterials(discipline, course);
                return `
                  <button class="discipline-button${state.discipline === discipline ? " active" : ""}" type="button" data-discipline="${escapeHtml(discipline)}" data-course="${course}" aria-pressed="${state.discipline === discipline}">
                    <span class="discipline-name">${escapeHtml(catalog.disciplines[discipline])}</span>
                    <span class="availability${materialCount ? " has-materials" : ""}" aria-label="${materialCount ? `${materialCount} материалов` : "Материалов пока нет"}">
                      <span class="availability-dot" aria-hidden="true"></span>${materialCount || ""}
                    </span>
                  </button>
                `;
              }).join("")}</div>` : expanded && catalog.semesters[state.program]
                ? `<p class="tree-hint">${courseEntries.length
                  ? "В этой выборке JSON нет файловых записей."
                  : "В JSON нет записей для этих семестров."}</p>`
                : ""}
            </div>
          `;
        }).join("")}
        <p class="tree-hint">${catalog.semesters[state.program]
          ? "Показаны записи из JSON; архивные файлы в прототип не включены."
          : "Точки показывают наличие материалов в демо-данных."}</p>
      </div>
    </aside>
  `;
}

function filterMarkup() {
  const materials = materialsForProgram();
  const courses = programCourses();
  const disciplines = [...new Set(entriesForProgram()
    .filter(entry => !state.course || courseForSemester(entry.semester) === Number(state.course))
    .map(entry => entry.discipline))];
  const semesters = (catalog.semesters[state.program]
    ?? [...new Set(entriesForProgram().map(entry => entry.semester))].sort((a, b) => a - b))
    .filter(semester => !state.course || courseForSemester(semester) === Number(state.course));
  const academicYears = [...new Set(materials
    .filter(material => !material.externalUrl)
    .map(material => material.academicYear))]
    .sort((a, b) => b.localeCompare(a));
  const formats = [...new Set(materials.map(material => material.format))]
    .sort((a, b) => a.localeCompare(b));
  return `
    <div class="search-wrap">
      <span class="search-icon">${iconMarkup("search")}</span>
      <label class="sr-only" for="catalog-search">Поиск материалов и дисциплин</label>
      <input id="catalog-search" class="search-input" type="search" value="${escapeHtml(state.search)}" placeholder="Поиск по материалам и дисциплинам">
    </div>
    <div class="filters" aria-label="Фильтры каталога">
      <div class="filter-fields">
      <div class="filter-field">
        <label for="course-filter">Курс</label>
        <select id="course-filter" class="filter-select">
          <option value="">Все курсы</option>
          ${courses.map(course => `<option value="${course}"${state.course === course ? " selected" : ""}>${course} курс</option>`).join("")}
        </select>
      </div>
      <div class="filter-field">
        <label for="discipline-filter">Дисциплина</label>
        <select id="discipline-filter" class="filter-select">
          <option value="">Все дисциплины</option>
          ${disciplines.map(discipline => `<option value="${escapeHtml(discipline)}"${state.discipline === discipline ? " selected" : ""}>${escapeHtml(catalog.disciplines[discipline])}</option>`).join("")}
        </select>
      </div>
      <div class="filter-field">
        <label for="semester-filter">Семестр</label>
        <select id="semester-filter" class="filter-select">
          <option value="">Все семестры</option>
          ${semesters.map(semester => `<option value="${semester}"${state.semester === semester ? " selected" : ""}>${semester} семестр</option>`).join("")}
        </select>
      </div>
      <div class="filter-field">
        <label for="type-filter">Тип материала</label>
        <select id="type-filter" class="filter-select">
          <option value="">Все типы</option>
          ${catalog.materialTypes.map(type => `<option value="${escapeHtml(type)}"${state.type === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
        </select>
      </div>
      <div class="filter-field">
        <label for="academic-year-filter">Учебный год</label>
        <select id="academic-year-filter" class="filter-select">
          <option value="">Все годы</option>
          ${academicYears.map(year => `<option value="${escapeHtml(year)}"${state.academicYear === year ? " selected" : ""}>${escapeHtml(year)}</option>`).join("")}
        </select>
      </div>
      <div class="filter-field">
        <label for="format-filter">Формат</label>
        <select id="format-filter" class="filter-select">
          <option value="">Все форматы</option>
          ${formats.map(format => `<option value="${escapeHtml(format)}"${state.format === format ? " selected" : ""}>${escapeHtml(format)}</option>`).join("")}
        </select>
      </div>
      </div>
      <div class="filter-options">
      <label class="filter-check" for="available-filter">
        <input id="available-filter" type="checkbox"${state.availableOnly ? " checked" : ""}>
        Только с материалами
      </label>
      <button class="filter-clear" type="button" id="clear-filters">Сбросить</button>
      </div>
    </div>
  `;
}

function matchingMaterials() {
  const query = state.search.trim().toLocaleLowerCase("ru");
  return materialsForProgram().filter(material => {
    const discipline = catalog.disciplines[material.discipline];
    const text = `${material.title} ${material.description} ${material.type} ${discipline} ${material.academicYear} ${material.format}`.toLocaleLowerCase("ru");
    return (!query || text.includes(query))
      && (query || !state.course || material.course === Number(state.course))
      && (!state.discipline || material.discipline === state.discipline)
      && (!state.semester || material.semester === Number(state.semester))
      && (!state.type || material.type === state.type)
      && (!state.academicYear || material.academicYear === state.academicYear)
      && (!state.format || material.format === state.format);
  });
}

function matchingEmptyDisciplines() {
  const query = state.search.trim().toLocaleLowerCase("ru");
  if (!query || state.availableOnly) return [];
  return entriesForProgram().filter(entry => entry.materials.length === 0
    && (!state.course || courseForSemester(entry.semester) === Number(state.course))
    && (!state.discipline || entry.discipline === state.discipline)
    && (!state.semester || entry.semester === Number(state.semester))
    && !state.type
    && !state.academicYear
    && !state.format
    && catalog.disciplines[entry.discipline].toLocaleLowerCase("ru").includes(query));
}

function materialMarkup(material) {
  const title = escapeHtml(material.title);
  const destination = `#/material/${encodeURIComponent(material.id)}`;
  return `
    <article class="material-card">
      <div class="material-card-heading">
        <div class="material-tags" aria-label="Тип и дисциплина">
          ${filterTagMarkup("type", material.type, material.type, material)}
          ${filterTagMarkup("discipline", material.discipline, catalog.disciplines[material.discipline], material)}
          ${material.externalUrl ? '<span class="tag tag-external">Ссылка на внешний материал</span>' : ""}
        </div>
        <span class="material-source">${escapeHtml(material.externalUrl ? "Внешний источник" : material.source ?? "Демо")}</span>
      </div>
      <div class="material-card-body">
        <h3 class="material-title"><a class="material-link" href="${destination}">${title}</a></h3>
        <p class="material-subtitle">${escapeHtml(material.description)}</p>
      </div>
      <div class="material-card-bottom">
        <div class="material-card-meta" aria-label="Параметры материала">
        ${filterTagMarkup("course", material.course, `${material.course} курс`, material)}
        ${filterTagMarkup("semester", material.semester, `${material.semester} семестр`, material)}
        ${material.externalUrl ? "" : filterTagMarkup("academic-year", material.academicYear, material.academicYear, material)}
        ${filterTagMarkup("format", material.format, material.format, material)}
        ${material.externalUrl ? "" : `<span class="material-file-meta">${escapeHtml(materialSize(material))} · ${escapeHtml(material.addedDate)}</span>`}
        </div>
        <a class="material-open" href="${destination}">Открыть материал ${iconMarkup("arrow-right")}</a>
      </div>
    </article>
  `;
}

function filterTagMarkup(filter, value, label, material) {
  return `<button class="tag tag-${filter}" type="button" data-filter="${filter}" data-value="${escapeHtml(value)}" data-course="${material.course}" data-program="${escapeHtml(material.program)}" aria-label="Фильтр: ${escapeHtml(label)}">${escapeHtml(label)}</button>`;
}

function materialSize(material) {
  if (!Number.isFinite(material.sizeBytes)) return `${material.sizeMiB} МиБ`;
  if (material.sizeBytes < 1024) return `${material.sizeBytes} байт`;
  if (material.sizeBytes < 1024 * 1024) {
    return `${(material.sizeBytes / 1024).toFixed(1)} КиБ`;
  }
  return `${(material.sizeBytes / (1024 * 1024)).toFixed(2)} МиБ`;
}

function renderMaterial(id) {
  const material = findMaterial(id);
  if (!material) {
    app.innerHTML = `
      <section class="placeholder-page">
        <p class="eyebrow">Материал</p>
        <h1>Материал не найден</h1>
        <p>В демонстрационном каталоге нет материала с таким адресом.</p>
        <a class="button-primary" href="#/catalog">Вернуться в каталог</a>
      </section>
    `;
    document.title = "Материал не найден · Senio";
    return;
  }

  const discipline = catalog.disciplines[material.discipline];
  const program = catalog.programs.find(item => item.id === material.program);
  const university = universityForProgram(program);
  const previewSupported = ALLOWED_FILE_FORMATS.includes(material.format);
  const externalMaterial = Boolean(material.externalUrl);
  app.innerHTML = `
    <section class="material-detail-page">
      <nav class="breadcrumbs" aria-label="Навигационная цепочка">
        <a href="#/">Главная</a>
        <span aria-hidden="true">/</span>
        <a href="#/catalog">Каталог</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHtml(material.title)}</span>
      </nav>
      <a class="back-link" href="#/catalog">${iconMarkup("arrow-left")} К каталогу</a>
      <div class="material-detail-layout">
        <article class="detail-main">
          <p class="eyebrow">${escapeHtml(university?.shortName ?? university?.name ?? "")} · ${escapeHtml(program?.shortName ?? "")} · ${material.course} курс · ${material.semester} семестр</p>
          <h1>${escapeHtml(material.title)}</h1>
          <p class="detail-description">${escapeHtml(material.description)}</p>
          <div class="detail-tags" aria-label="Параметры материала">
            ${filterTagMarkup("course", material.course, `${material.course} курс`, material)}
            ${filterTagMarkup("discipline", material.discipline, discipline, material)}
            ${filterTagMarkup("semester", material.semester, `${material.semester} семестр`, material)}
            ${filterTagMarkup("type", material.type, material.type, material)}
            ${externalMaterial ? "" : filterTagMarkup("academic-year", material.academicYear, material.academicYear, material)}
            ${filterTagMarkup("format", material.format, material.format, material)}
            ${externalMaterial ? '<span class="tag tag-external">Ссылка на внешний материал</span>' : ""}
          </div>
          <section class="file-preview" aria-labelledby="preview-title">
            ${externalMaterial ? `
              <div class="preview-icon">${iconMarkup("file")}</div>
              <div>
                <p class="eyebrow">Внешний источник</p>
                <h2 id="preview-title">Ссылка на внешний материал</h2>
                <p>Открой папку с презентациями по языкам программирования.</p>
                <div class="preview-actions">
                  <a class="button-primary" href="${escapeHtml(material.externalUrl)}" target="_blank" rel="noopener noreferrer">Открыть папку ${iconMarkup("arrow-right")}</a>
                </div>
              </div>
            ` : `
              <div class="preview-icon">${iconMarkup("file")}</div>
              <div>
                <p class="eyebrow">${material.source ? "Файл из архива" : "Демонстрационный просмотр"}</p>
                <h2 id="preview-title">${previewSupported ? "Предпросмотр не подключён" : "Предпросмотр недоступен"}</h2>
                <p>${!previewSupported
                  ? `Формат ${escapeHtml(material.format)} не поддерживает встроенный предпросмотр.`
                  : material.source
                    ? "Метаданные доступны, но исходный файл не подключён к прототипу."
                    : "В демо-каталоге нет содержимого файла для предпросмотра."}</p>
                <div class="preview-actions">
                  <button class="button-primary" type="button" id="download-button">Скачать</button>
                  ${previewSupported ? '<button class="button-secondary" type="button" id="preview-retry">Повторить предпросмотр</button>' : ""}
                  <a class="button-secondary" href="#/report/${encodeURIComponent(material.id)}">Пожаловаться</a>
                </div>
                <p id="material-action-feedback" class="form-feedback" aria-live="polite"></p>
              </div>
            `}
          </section>
        </article>
        <aside class="detail-sidebar">
          <p class="eyebrow">О материале</p>
          <h2>${escapeHtml(discipline)}</h2>
          <dl class="detail-facts">
            <div><dt>Направление</dt><dd>${escapeHtml(program?.shortName ?? "—")}</dd></div>
            <div><dt>Курс</dt><dd>${material.course}</dd></div>
            <div><dt>Семестр</dt><dd>${material.semester}</dd></div>
            <div><dt>Тип</dt><dd>${escapeHtml(material.type)}</dd></div>
            ${externalMaterial ? "" : `<div><dt>Учебный год</dt><dd>${escapeHtml(material.academicYear)}</dd></div>`}
            <div><dt>Формат</dt><dd>${escapeHtml(material.format)}</dd></div>
            ${externalMaterial ? "" : `<div><dt>Размер</dt><dd>${escapeHtml(materialSize(material))}</dd></div>`}
            ${externalMaterial ? "" : `<div><dt>Добавлено</dt><dd>${escapeHtml(material.addedDate)}</dd></div>`}
          </dl>
          <a class="sidebar-link" href="#/catalog">Найти другие материалы ${iconMarkup("arrow-right")}</a>
        </aside>
      </div>
    </section>
  `;
  bindTagFilters();
  if (!externalMaterial) {
    document.querySelector("#download-button").addEventListener("click", () => {
      document.querySelector("#material-action-feedback").textContent =
        "Демо: исходный файл недоступен, скачивание не выполнено.";
    });
    if (previewSupported) {
      document.querySelector("#preview-retry").addEventListener("click", () => {
        document.querySelector("#material-action-feedback").textContent =
          "Предпросмотр не удалось загрузить: файл не подключён к прототипу.";
      });
    }
  }
  document.title = `${material.title} · Senio`;
}

function emptyDisciplineMarkup(entry) {
  const discipline = escapeHtml(catalog.disciplines[entry.discipline]);
  const course = courseForSemester(entry.semester);
  const material = { program: entry.program, course };
  return `
    <article class="material-card discipline-result">
      <button class="discipline-result-link" type="button" data-course="${course}" data-discipline="${escapeHtml(entry.discipline)}">
        <span class="material-title">${discipline}</span>
        <span class="material-subtitle">Материалов пока нет · открыть дисциплину</span>
      </button>
      <span class="tag-list" aria-label="Параметры дисциплины">
        ${filterTagMarkup("course", course, `${course} курс`, material)}
        ${filterTagMarkup("semester", entry.semester, `${entry.semester} семестр`, material)}
      </span>
    </article>
  `;
}

function emptyMarkup() {
  const noMaterials = state.discipline && !state.search && !state.type && !state.semester
    && !state.academicYear && !state.format;
  return `
    <div class="empty-state">
      <img src="${mascot}senka-peeks.svg" alt="" aria-hidden="true">
      <h3>${noMaterials ? "Материалов пока нет" : "Ничего не нашлось"}</h3>
      <p>${noMaterials
        ? "Добавь первый материал по этой дисциплине — он поможет другим студентам."
        : "Не нашлось подходящего материала? Добавь свой — он может пригодиться другим студентам."}</p>
      <a href="#/add-material">Добавить свой материал ${iconMarkup("arrow-right")}</a>
    </div>
  `;
}

function renderResults() {
  const materials = matchingMaterials();
  const emptyDisciplines = matchingEmptyDisciplines();
  const resultsCount = materials.length + emptyDisciplines.length;
  const heading = state.discipline
    ? catalog.disciplines[state.discipline]
    : state.search.trim() ? "Результаты поиска" : "Все материалы";
  const list = document.querySelector("#material-list");
  const resultTitle = document.querySelector("#results-title");
  const resultCount = document.querySelector("#results-count");
  resultTitle.textContent = heading;
  resultCount.textContent = state.search.trim()
    ? `${resultsCount} результатов · поиск по всей программе`
    : `${materials.length} ${materials.length === 1 ? "материал" : "материалов"}`;
  list.innerHTML = resultsCount
    ? materials.map(materialMarkup).join("") + emptyDisciplines.map(emptyDisciplineMarkup).join("")
    : emptyMarkup();
  bindTagFilters();
  list.querySelectorAll(".discipline-result-link").forEach(button => {
    button.addEventListener("click", () => {
      state.course = Number(button.dataset.course);
      state.discipline = button.dataset.discipline;
      state.semester = "";
      state.search = "";
      renderCatalog();
    });
  });
}

function renderCatalog() {
  const program = currentProgram();
  const university = universityForProgram(program);
  app.innerHTML = `
    <section class="catalog-page">
      <div class="catalog-heading">
        <div>
          <p class="eyebrow">${escapeHtml(university?.shortName ?? university?.name ?? "")} · ${escapeHtml(program?.name ?? "")}</p>
          <h1>Каталог материалов</h1>
          <p>Выбери курс или найди знакомую дисциплину — материалы собраны в одном месте.</p>
        </div>
      </div>
      <div class="catalog-layout">
        ${treeMarkup()}
        <section class="catalog-content" aria-label="Материалы каталога">
          ${filterMarkup()}
          <div class="results-heading">
            <h2 id="results-title">Все материалы</h2>
            <span id="results-count"></span>
          </div>
          <div class="material-list" id="material-list" aria-live="polite"></div>
        </section>
      </div>
    </section>
  `;
  renderResults();
  bindCatalogEvents();
}

function renderDemoPage(eyebrow, title, description, content) {
  app.innerHTML = `
    <section class="demo-page">
      <header class="demo-page-heading">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${description}</p>
      </header>
      <p class="demo-disclaimer">Демонстрационный режим: данные хранятся только в памяти этой страницы и исчезнут после перезагрузки. Файлы никуда не отправляются.</p>
      ${content}
    </section>
  `;
}

function renderAuthentication(mode) {
  const isRegistration = mode === "register";
  renderDemoPage(
    isRegistration ? "Регистрация" : "Вход",
    isRegistration ? "Создать демо-профиль" : "Войти в демо-профиль",
    "Для демонстрации подойдут любые имя, почта и пароль. Учётная запись не создаётся.",
    `
      <form class="demo-panel demo-form" id="auth-form">
        ${isRegistration ? `
          <label>Имя
            <input name="name" autocomplete="name" required>
          </label>
        ` : ""}
        <label>Электронная почта
          <input name="email" type="email" autocomplete="email" required>
        </label>
        <label>Пароль
          <input name="password" type="password" autocomplete="${isRegistration ? "new-password" : "current-password"}" required>
        </label>
        <div class="demo-form-actions">
          <button class="button-primary" type="submit">${isRegistration ? "Создать демо-профиль" : "Войти"}</button>
          <a class="button-secondary" href="${isRegistration ? "#/login" : "#/register"}">${isRegistration ? "Уже есть аккаунт? Войти" : "Зарегистрироваться"}</a>
        </div>
        <p class="form-feedback" id="auth-feedback" aria-live="polite"></p>
      </form>
    `,
  );
  document.querySelector("#auth-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const enteredName = String(values.get("name") ?? "").trim();
    demoState.user = {
      email,
      name: enteredName || email.split("@")[0],
    };
    const destination = demoState.returnTo;
    demoState.returnTo = "#/profile";
    navigate(destination);
  });
}

function renderProfile() {
  if (!demoState.user) {
    renderDemoPage(
      "Профиль",
      "Войди или зарегистрируйся",
      "В прототипе профиль создаётся только для демонстрации сценариев.",
      '<div class="demo-form-actions"><a class="button-primary" href="#/login">Войти</a><a class="button-secondary" href="#/register">Зарегистрироваться</a></div>',
    );
    return;
  }
  const submissions = demoState.submissions.length
    ? demoState.submissions.map(item => `
      <article class="demo-list-item">
        <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.disciplineName)} · ${item.semester} семестр · ${escapeHtml(item.format)}</p></div>
        <span class="demo-status">${escapeHtml(item.status)}</span>
        ${item.rejectionReason ? `<p class="form-error">${escapeHtml(item.rejectionReason)}</p>` : ""}
      </article>
    `).join("")
    : '<p class="form-hint">У тебя пока нет отправленных материалов.</p>';
  renderDemoPage(
    "Профиль",
    "Профиль студента",
    escapeHtml(demoState.user.email),
    `
      <section class="demo-panel">
        <div class="demo-section-heading"><h2>Мои материалы</h2><a class="button-primary" href="#/add-material">Добавить материал</a></div>
        <div class="demo-list">${submissions}</div>
      </section>
      <section class="demo-panel demo-tools">
        <h2>Демо-инструменты</h2>
        <p>Панели ниже открыты без реальной проверки роли.</p>
        <div class="demo-form-actions">
          <a class="button-secondary" href="#/admin/moderation">Модерация материалов</a>
          <a class="button-secondary" href="#/admin/catalog">Структура каталога</a>
          <button class="button-secondary" type="button" id="logout-button">Выйти</button>
        </div>
      </section>
    `,
  );
  document.querySelector("#logout-button").addEventListener("click", () => {
    demoState.user = null;
    navigate("#/profile");
  });
}

function renderAddMaterial() {
  if (!demoState.user) {
    demoState.returnTo = "#/add-material";
    renderDemoPage(
      "Добавление материала",
      "Сначала войди в демо-профиль",
      "После входа откроется форма отправки материала на демонстрационную модерацию.",
      '<div class="demo-form-actions"><a class="button-primary" href="#/login">Войти</a><a class="button-secondary" href="#/register">Зарегистрироваться</a></div>',
    );
    return;
  }
  const uploadPrograms = catalog.programs.filter(program => program.id !== "test_real_data");
  const uploadProgram = uploadPrograms.find(program => program.id === state.program) ?? uploadPrograms[0];
  const programOptions = uploadPrograms.map(program =>
    `<option value="${escapeHtml(program.id)}"${program.id === uploadProgram?.id ? " selected" : ""}>${escapeHtml(program.name)}</option>`
  ).join("");
  renderDemoPage(
    "Пополнение каталога",
    "Отправить материал",
    "Заполни данные файла. В этой демоверсии на модерацию отправляются только метаданные, сам файл не загружается.",
    `
      <form class="demo-panel demo-form" id="upload-form">
        <label>Направление
          <select name="program" id="upload-program" required>${programOptions}</select>
        </label>
        <label>Дисциплина
          <select name="discipline" id="upload-discipline" required></select>
        </label>
        <div class="demo-form-grid">
          <label>Семестр
            <select name="semester" required>${Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}</select>
          </label>
          <label>Тип материала
            <select name="type" required>${catalog.materialTypes.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}</select>
          </label>
        </div>
        <label>Название
          <input name="title" maxlength="255" required>
        </label>
        <label>Описание <span class="form-hint">необязательно</span>
          <textarea name="description" rows="3"></textarea>
        </label>
        <label>Файл
          <input name="file" type="file" accept=".doc,.docx,.pdf,.txt,.ppt,.pptx,.jpg" required>
        </label>
        <p class="form-hint">DOC, DOCX, PDF, TXT, PPT, PPTX, JPG; максимум 20 МиБ. Проверка в браузере предварительная и не заменяет проверку содержимого на сервере.</p>
        <label class="form-check">
          <input name="rights" type="checkbox" required>
          Я являюсь автором материала и/или имею право его распространять
        </label>
        <div class="form-feedback" id="upload-feedback" aria-live="polite"></div>
        <button class="button-primary" type="submit">Отправить на модерацию</button>
      </form>
    `,
  );
  const form = document.querySelector("#upload-form");
  const programSelect = document.querySelector("#upload-program");
  const disciplineSelect = document.querySelector("#upload-discipline");
  const updateDisciplines = () => {
    const disciplines = [...new Set(catalog.curriculum
      .filter(entry => entry.program === programSelect.value)
      .map(entry => entry.discipline))];
    disciplineSelect.innerHTML = disciplines.map(id =>
      `<option value="${escapeHtml(id)}">${escapeHtml(catalog.disciplines[id])}</option>`
    ).join("");
  };
  updateDisciplines();
  programSelect.addEventListener("change", updateDisciplines);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(form);
    const file = form.elements.file.files[0];
    const format = file?.name.split(".").pop().toUpperCase() ?? "";
    const errors = [];
    if (!file) errors.push("Выбери файл.");
    if (file && file.size > MAX_FILE_SIZE) errors.push("Файл превышает лимит 20 МиБ.");
    if (file && !ALLOWED_FILE_FORMATS.includes(format)) errors.push("Формат файла не поддерживается.");
    if (!String(values.get("title") ?? "").trim()) errors.push("Укажи название материала.");
    if (!String(values.get("discipline") ?? "")) errors.push("Выбери дисциплину.");
    if (!values.get("rights")) errors.push("Подтверди право на распространение.");
    const feedback = document.querySelector("#upload-feedback");
    if (errors.length) {
      feedback.className = "form-feedback form-error";
      feedback.textContent = errors.join(" ");
      return;
    }
    const programId = String(values.get("program"));
    const discipline = String(values.get("discipline"));
    demoState.submissions.push({
      id: nextDemoId("demo-upload"),
      title: String(values.get("title")).trim(),
      description: String(values.get("description") ?? "").trim() || "Описание не добавлено.",
      type: String(values.get("type")),
      program: programId,
      discipline,
      disciplineName: catalog.disciplines[discipline],
      semester: Number(values.get("semester")),
      course: courseForSemester(Number(values.get("semester"))),
      format,
      sizeBytes: file.size,
      academicYear: "2025/26",
      addedDate: "Сегодня · демо",
      source: "Демо-загрузка",
      status: "На модерации",
      author: demoState.user.email,
    });
    navigate("#/profile");
  });
}

function renderReport(id) {
  const material = findMaterial(id);
  if (!material) {
    renderDemoPage("Жалоба", "Материал не найден", "Нельзя отправить жалобу на отсутствующий материал.", '<a class="button-secondary" href="#/catalog">Вернуться в каталог</a>');
    return;
  }
  renderDemoPage(
    "Обратная связь",
    "Пожаловаться на материал",
    `Сообщи, что не так с материалом «${escapeHtml(material.title)}».`,
    `
      <form class="demo-panel demo-form" id="report-form">
        <label>Причина
          <select name="reason" required>
            <option value="">Выбери причину</option>
            <option>Ошибка или повреждение файла</option>
            <option>Материал не относится к дисциплине</option>
            <option>Нарушение авторских прав</option>
            <option>Другое</option>
          </select>
        </label>
        <label>Пояснение <span class="form-hint">необязательно</span>
          <textarea name="details" rows="4" maxlength="1000"></textarea>
        </label>
        <div class="form-feedback" id="report-feedback" aria-live="polite"></div>
        <div class="demo-form-actions">
          <button class="button-primary" type="submit">Отправить жалобу</button>
          <a class="button-secondary" href="#/material/${encodeURIComponent(material.id)}">Отмена</a>
        </div>
      </form>
    `,
  );
  document.querySelector("#report-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const reason = String(values.get("reason") ?? "").trim();
    if (!reason) {
      document.querySelector("#report-feedback").textContent = "Выбери причину жалобы.";
      return;
    }
    demoState.reports.push({
      id: nextDemoId("demo-report"),
      materialId: material.id,
      materialTitle: material.title,
      reason,
      details: String(values.get("details") ?? "").trim(),
      status: "Новая",
    });
    renderDemoPage(
      "Жалоба отправлена",
      "Спасибо за сообщение",
      "Жалоба сохранена только в памяти демо-прототипа и доступна в демо-панели модерации.",
      '<div class="demo-form-actions"><a class="button-primary" href="#/catalog">Вернуться в каталог</a><a class="button-secondary" href="#/admin/moderation">Открыть демо-модерацию</a></div>',
    );
  });
}

function publishDemoMaterial(item) {
  const material = { ...item };
  delete material.disciplineName;
  delete material.status;
  delete material.rejectionReason;
  delete material.author;
  const entry = catalog.curriculum.find(candidate =>
    candidate.program === material.program
      && candidate.discipline === material.discipline
      && candidate.semester === material.semester
  );
  if (entry) {
    entry.materials.push(material);
  } else {
    catalog.curriculum.push({
      program: material.program,
      discipline: material.discipline,
      semester: material.semester,
      materials: [material],
    });
  }
  const semesters = catalog.semesters[material.program];
  if (semesters && !semesters.includes(material.semester)) {
    semesters.push(material.semester);
    semesters.sort((left, right) => left - right);
  }
}

function renderModeration() {
  const pending = demoState.submissions.filter(item => item.status === "На модерации");
  const openReports = demoState.reports.filter(report => report.status === "Новая");
  const materialList = pending.length
    ? pending.map(item => `
      <article class="demo-list-item">
        <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.disciplineName)} · ${item.semester} семестр · ${escapeHtml(item.format)} · ${escapeHtml(materialSize(item))}</p><p>${escapeHtml(item.description)}</p><p>Автор: ${escapeHtml(item.author)}</p></div>
        <div class="demo-form-actions">
          <button class="button-primary" type="button" data-approve-material="${escapeHtml(item.id)}">Одобрить</button>
        </div>
        <form class="demo-form moderation-reject-form" data-reject-form="${escapeHtml(item.id)}">
          <label>Причина отклонения
            <textarea name="reason" rows="2" required></textarea>
          </label>
          <p class="form-feedback" data-reject-feedback aria-live="polite"></p>
          <button class="button-secondary" type="submit">Отклонить</button>
        </form>
      </article>
    `).join("")
    : '<p class="form-hint">Нет материалов, ожидающих проверки.</p>';
  const reportList = openReports.length
    ? openReports.map(report => `
      <article class="demo-list-item">
        <div><h3>${escapeHtml(report.materialTitle)}</h3><p>${escapeHtml(report.reason)}</p>${report.details ? `<p>${escapeHtml(report.details)}</p>` : ""}</div>
        <div class="demo-form-actions">
          <a class="button-secondary" href="#/material/${encodeURIComponent(report.materialId)}">Открыть материал</a>
          <button class="button-primary" type="button" data-review-report="${escapeHtml(report.id)}">Отметить рассмотренной</button>
        </div>
      </article>
    `).join("")
    : '<p class="form-hint">Новых жалоб нет.</p>';
  renderDemoPage(
    "Демо-панель",
    "Модерация материалов",
    "Панель доступна без реальной проверки роли. Одобрение меняет только данные в памяти страницы.",
    `
      <section class="demo-panel">
        <h2>Материалы на модерации</h2>
        <div class="demo-list">${materialList}</div>
      </section>
      <section class="demo-panel">
        <h2>Жалобы</h2>
        <div class="demo-list">${reportList}</div>
      </section>
      <a class="back-link" href="#/profile">${iconMarkup("arrow-left")} В профиль</a>
    `,
  );
  document.querySelectorAll("[data-approve-material]").forEach(button => {
    button.addEventListener("click", () => {
      const item = pending.find(candidate => candidate.id === button.dataset.approveMaterial);
      if (item) {
        item.status = "Опубликован";
        publishDemoMaterial(item);
        renderModeration();
      }
    });
  });
  document.querySelectorAll("[data-reject-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const reason = String(new FormData(form).get("reason") ?? "").trim();
      if (!reason) {
        form.querySelector("[data-reject-feedback]").textContent = "Укажи причину отклонения.";
        return;
      }
      const item = pending.find(candidate => candidate.id === form.dataset.rejectForm);
      if (item) {
        item.status = "Отклонён";
        item.rejectionReason = reason;
        renderModeration();
      }
    });
  });
  document.querySelectorAll("[data-review-report]").forEach(button => {
    button.addEventListener("click", () => {
      const report = openReports.find(candidate => candidate.id === button.dataset.reviewReport);
      if (report) {
        report.status = "Рассмотрена";
        renderModeration();
      }
    });
  });
}

function renderManageCatalog() {
  const programs = catalog.programs.map(program => `
    <div class="demo-form-grid">
      <label>Направление
        <input name="program:${escapeHtml(program.id)}" value="${escapeHtml(program.name)}" required>
      </label>
      <label>Краткое название
        <input name="short:${escapeHtml(program.id)}" value="${escapeHtml(program.shortName ?? program.name)}" required>
      </label>
    </div>
  `).join("");
  const disciplines = Object.entries(catalog.disciplines).map(([id, name]) => `
    <label>${escapeHtml(id)}
      <input name="discipline:${escapeHtml(id)}" value="${escapeHtml(name)}" required>
    </label>
  `).join("");
  const programOptions = catalog.programs.map(program =>
    `<option value="${escapeHtml(program.id)}">${escapeHtml(program.name)}</option>`
  ).join("");
  renderDemoPage(
    "Демо-панель",
    "Структура каталога",
    "Изменения структуры действуют только до перезагрузки. Панель не проверяет права доступа.",
    `
      <form class="demo-panel demo-form" id="edit-structure-form">
        <h2>Изменить названия</h2>
        ${programs}
        ${disciplines}
        <p class="form-feedback form-error" id="edit-structure-feedback" aria-live="polite"></p>
        <button class="button-primary" type="submit">Сохранить названия</button>
      </form>
      <form class="demo-panel demo-form" id="new-program-form">
        <h2>Добавить направление</h2>
        <label>Название направления<input name="name" maxlength="255" required></label>
        <label>Краткое название<input name="shortName" maxlength="32" required></label>
        <p class="form-feedback form-error" id="new-program-feedback" aria-live="polite"></p>
        <button class="button-secondary" type="submit">Добавить направление</button>
      </form>
      <form class="demo-panel demo-form" id="new-discipline-form">
        <h2>Добавить дисциплину в семестр</h2>
        <label>Направление<select name="program" required>${programOptions}</select></label>
        <label>Название дисциплины<input name="name" maxlength="255" required></label>
        <label>Семестр<select name="semester" required>${Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}</select></label>
        <p class="form-feedback form-error" id="new-discipline-feedback" aria-live="polite"></p>
        <button class="button-secondary" type="submit">Добавить дисциплину</button>
      </form>
      <a class="back-link" href="#/profile">${iconMarkup("arrow-left")} В профиль</a>
    `,
  );
  document.querySelector("#edit-structure-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const invalidProgram = catalog.programs.some(program =>
      !String(values.get(`program:${program.id}`) ?? "").trim()
        || !String(values.get(`short:${program.id}`) ?? "").trim()
    );
    const invalidDiscipline = Object.keys(catalog.disciplines).some(id =>
      !String(values.get(`discipline:${id}`) ?? "").trim()
    );
    if (invalidProgram || invalidDiscipline) {
      document.querySelector("#edit-structure-feedback").textContent =
        "Заполни названия всех направлений и дисциплин.";
      return;
    }
    for (const program of catalog.programs) {
      program.name = String(values.get(`program:${program.id}`) ?? program.name).trim();
      program.shortName = String(values.get(`short:${program.id}`) ?? program.shortName).trim();
    }
    for (const [id, name] of Object.entries(catalog.disciplines)) {
      catalog.disciplines[id] = String(values.get(`discipline:${id}`) ?? name).trim();
    }
    renderManageCatalog();
    renderHeader();
  });
  document.querySelector("#new-program-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const shortName = String(values.get("shortName") ?? "").trim();
    if (!name || !shortName) {
      document.querySelector("#new-program-feedback").textContent =
        "Укажи название и краткое название направления.";
      return;
    }
    if (catalog.programs.some(program => program.name.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"))) {
      document.querySelector("#new-program-feedback").textContent =
        "Направление с таким названием уже есть.";
      return;
    }
    const id = nextDemoId("demo-program");
    catalog.programs.push({ id, institute: instituteSelect.value, name, shortName });
    renderManageCatalog();
    renderHeader();
  });
  document.querySelector("#new-discipline-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const program = String(values.get("program") ?? "");
    const semester = Number(values.get("semester"));
    const feedback = document.querySelector("#new-discipline-feedback");
    if (!name || !program || !Number.isInteger(semester) || semester < 1 || semester > 12) {
      feedback.textContent = "Укажи дисциплину, направление и семестр от 1 до 12.";
      return;
    }
    const duplicate = catalog.curriculum.some(entry =>
      entry.program === program
        && catalog.disciplines[entry.discipline].toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru")
    );
    if (duplicate) {
      feedback.textContent = "Такая дисциплина уже добавлена в это направление.";
      return;
    }
    const id = nextDemoId("demo-discipline");
    catalog.disciplines[id] = name;
    catalog.curriculum.push({ program, discipline: id, semester, materials: [] });
    const semesters = catalog.semesters[program];
    if (semesters && !semesters.includes(semester)) {
      semesters.push(semester);
      semesters.sort((left, right) => left - right);
    }
    renderManageCatalog();
    renderHeader();
  });
}

function navigate(route) {
  if (location.hash === route) {
    render();
  } else {
    location.hash = route;
  }
}

function render() {
  const route = location.hash.slice(1) || "/";
  renderHeader();
  if (route === "/" || route === "") {
    renderLanding();
  } else if (route === "/catalog") {
    renderCatalog();
  } else if (route === "/profile") {
    renderProfile();
  } else if (route === "/add-material") {
    renderAddMaterial();
  } else if (route === "/login" || route === "/register") {
    renderAuthentication(route.slice(1));
  } else if (route.startsWith("/report/")) {
    renderReport(decodeURIComponent(route.slice("/report/".length)));
  } else if (route === "/admin/moderation") {
    renderModeration();
  } else if (route === "/admin/catalog") {
    renderManageCatalog();
  } else if (route.startsWith("/material/")) {
    renderMaterial(route.slice("/material/".length));
  } else {
    location.replace("#/");
  }
  if (route === "/catalog") document.title = "Каталог материалов · Senio";
  else if (route !== "/" && !route.startsWith("/material/")) {
    document.title = route === "/profile" ? "Профиль · Senio" : "Senio";
  }
  window.scrollTo(0, 0);
}

function bindCatalogEvents() {
  document.querySelector("#catalog-search").addEventListener("input", event => {
    state.search = event.target.value;
    renderResults();
  });
  document.querySelector("#course-filter").addEventListener("change", event => {
    state.course = event.target.value ? Number(event.target.value) : "";
    state.discipline = "";
    state.semester = "";
    renderCatalog();
  });
  document.querySelector("#discipline-filter").addEventListener("change", event => {
    state.discipline = event.target.value;
    renderCatalog();
  });
  document.querySelector("#semester-filter").addEventListener("change", event => {
    state.semester = event.target.value ? Number(event.target.value) : "";
    renderResults();
  });
  document.querySelector("#type-filter").addEventListener("change", event => {
    state.type = event.target.value;
    renderResults();
  });
  document.querySelector("#academic-year-filter").addEventListener("change", event => {
    state.academicYear = event.target.value;
    renderResults();
  });
  document.querySelector("#format-filter").addEventListener("change", event => {
    state.format = event.target.value;
    renderResults();
  });
  document.querySelector("#available-filter").addEventListener("change", event => {
    state.availableOnly = event.target.checked;
    if (state.availableOnly && state.discipline && !countMaterials(state.discipline, Number(state.course))) {
      state.discipline = "";
    }
    renderCatalog();
  });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    Object.assign(state, {
      course: "",
      discipline: "",
      semester: "",
      type: "",
      academicYear: "",
      format: "",
      search: "",
      availableOnly: false,
    });
    renderCatalog();
  });
  document.querySelector(".tree-root").addEventListener("click", () => {
    state.course = "";
    state.discipline = "";
    state.semester = "";
    renderCatalog();
  });
  document.querySelectorAll(".course-button").forEach(button => {
    button.addEventListener("click", () => {
      state.course = Number(button.dataset.course);
      state.discipline = "";
      state.semester = "";
      renderCatalog();
    });
  });
  document.querySelectorAll(".discipline-button").forEach(button => {
    button.addEventListener("click", () => {
      state.course = Number(button.dataset.course);
      state.discipline = button.dataset.discipline;
      state.semester = "";
      renderCatalog();
    });
  });
  const treePanel = document.querySelector("#tree-panel");
  const treeToggle = document.querySelector("#tree-toggle");
  const toggleTree = () => {
    const collapsed = treePanel.classList.toggle("catalog-tree-collapsed");
    treeToggle.setAttribute("aria-expanded", String(!collapsed));
    treeToggle.querySelector(".icon").outerHTML = iconMarkup(collapsed ? "chevron-down" : "chevron-up");
  };
  treeToggle.addEventListener("click", toggleTree);
  treeToggle.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTree();
    }
  });
}

universitySelect.addEventListener("change", () => {
  const institute = institutesForUniversity(universitySelect.value)[0];
  const program = catalog.programs.find(item => item.institute === institute?.id);
  if (!program) throw new Error(`No study program for university: ${universitySelect.value}`);
  state.program = program.id;
  resetProgramFilters();
  renderAfterProgramChange();
});

instituteSelect.addEventListener("change", () => {
  const program = catalog.programs.find(item => item.institute === instituteSelect.value);
  if (program) {
    state.program = program.id;
    resetProgramFilters();
    renderAfterProgramChange();
  }
});

programSelect.addEventListener("change", () => {
  state.program = programSelect.value;
  resetProgramFilters();
  renderAfterProgramChange();
});

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  menuToggle.innerHTML = iconMarkup(isOpen ? "x" : "menu");
});

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  brandLogo.setAttribute("src", isDark
    ? "../../static/img/logo/logo-dark-mode.svg"
    : "../../static/img/logo/logo.svg");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeToggle.title = isDark ? "Светлая тема" : "Тёмная тема";
  themeToggle.innerHTML = iconMarkup(isDark ? "sun" : "moon");
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#18191b" : "#f6f4ee";
}

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

window.addEventListener("hashchange", () => {
  header.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  render();
});

render();
