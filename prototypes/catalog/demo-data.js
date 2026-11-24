function archivedMaterial(id, type, title, format, sizeBytes) {
  return {
    id,
    type,
    title,
    description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.",
    format,
    sizeBytes,
    academicYear: "2024-2026",
    addedDate: "Не указана",
    source: "Архив",
  };
}

const catalog = {
  universities: [
    {
      id: "sfedu",
      name: "Южный федеральный университет",
      shortName: "ЮФУ",
      logo: "../../static/img/logo/sfedu-mark.webp",
    },
  ],
  institutes: [
    { id: "math", university: "sfedu", name: "Институт математики и компьютерных наук" },
  ],
  programs: [
    { id: "fiit", institute: "math", name: "Фундаментальная информатика и информационные технологии (ФИИТ)", shortName: "ФИИТ" },
    { id: "pmi", institute: "math", name: "Прикладная математика и информатика", shortName: "ПМИ" },
    { id: "test_real_data", institute: "math", name: "демо_реальные_данные", shortName: "ФИИТ · архив" },
  ],
  disciplines: {
    discrete: "Дискретная математика",
    basics: "Основы программирования",
    languages: "Языки программирования",
    algebra: "Линейная алгебра",
    realContinuousMath: "Непрерывная математика",
    realAlgebraGeometry: "Алгебра и Геометрия",
    realDiscreteMath: "Дискретная математика",
    realProgrammingLanguages: "Языки программирования",
    realProbabilityTheory: "Теория вероятностей",
    realSemesterFiles: "Файлы семестра",
    realMathematicalLogic: "Математическая логика",
    realSoftwareEngineering: "Программная инженерия",
    realEconomicsLaw: "Экономика и право",
    realAutomataTheory: "Теория автоматов и формальных языков",
    realOperatingSystems: "Архитектуры операционных систем",
    realMozi: "МОЗИ",
  },
  materialTypes: ["Лекция", "Практикум", "Контрольная", "Экзаменационные материалы", "Презентация", "Файл"],
  semesters: {
    test_real_data: [1, 2, 3, 4, 5, 6, 7],
  },
  curriculum: [
    { program: "fiit", discipline: "discrete", semester: 1, materials: [
      { id: "sets-and-relations", type: "Лекция", title: "Множества и отношения", description: "Демонстрационный конспект по теме множеств и отношений.", format: "PDF", sizeMiB: "1.8", academicYear: "2025/26", addedDate: "14.09.2025" },
      { id: "set-operations", type: "Практикум", title: "Задачи на операции с множествами", description: "Демонстрационный практикум с задачами на операции с множествами.", format: "PDF", sizeMiB: "2.4", academicYear: "2025/26", addedDate: "19.09.2025" },
      { id: "relations-and-mappings", type: "Контрольная", title: "Отношения и отображения", description: "Демонстрационный вариант контрольной по отношениям и отображениям.", format: "DOCX", sizeMiB: "0.6", academicYear: "2024/25", addedDate: "03.10.2024" },
    ] },
    { program: "fiit", discipline: "discrete", semester: 2, materials: [] },
    { program: "fiit", discipline: "basics", semester: 1, materials: [
      { id: "loops-and-conditions", type: "Практикум", title: "Циклы и условия", description: "Демонстрационный практикум по циклам и условным конструкциям.", format: "PDF", sizeMiB: "1.2", academicYear: "2025/26", addedDate: "15.09.2025" },
    ] },
    { program: "fiit", discipline: "languages", semester: 2, materials: [] },
    { program: "fiit", discipline: "languages", semester: 3, materials: [
      { id: "type-systems", type: "Лекция", title: "Системы типов", description: "Демонстрационный конспект по системам типов.", format: "PDF", sizeMiB: "3.1", academicYear: "2024/25", addedDate: "22.09.2024" },
      { id: "type-systems-questions", type: "Экзаменационные материалы", title: "Вопросы по системам типов", description: "Демонстрационный список вопросов для подготовки по системам типов.", format: "DOCX", sizeMiB: "0.8", academicYear: "2024/25", addedDate: "02.10.2024" },
      { id: "programming-languages-presentations", type: "Презентация", title: "Презентации по языкам программирования", description: "Материалы для третьего семестра доступны во внешней папке.", format: "Внешняя ссылка", academicYear: "", addedDate: "", externalUrl: "https://drive.google.com/drive/folders/1Si8473sVl_srEwzDVghMaf1wLnk8Bol0" },
    ] },
    { program: "pmi", discipline: "algebra", semester: 1, materials: [] },
    { program: "pmi", discipline: "languages", semester: 4, materials: [] },
    { program: "test_real_data", discipline: "realAlgebraGeometry", semester: 1, materials: [
      archivedMaterial("real-s1-algebra-exam-program", "Экзаменационные материалы", "Программа экзамена по алгебре и геометрии", "DOCX", 25126),
      archivedMaterial("real-s1-algebra-practice-4", "Практикум", "Практикум 4 по алгебре и геометрии", "PDF", 308732),
    ] },
    { program: "test_real_data", discipline: "realDiscreteMath", semester: 1, materials: [
      archivedMaterial("real-s1-discrete-theory-practice", "Файл", "Теория и практикум по дискретной математике", "PDF", 3407265),
      archivedMaterial("real-s1-discrete-exam", "Экзаменационные материалы", "Контрольная работа 1 по дискретной математике", "PDF", 2544611),
    ] },
    { program: "test_real_data", discipline: "realContinuousMath", semester: 1, materials: [
      { id: "real-s1-continuous-exam-answers", type: "Файл", title: "Ответы к экзамену по непрерывной математике", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "DOCX", sizeBytes: 19715629, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s1-continuous-demidovich", type: "Файл", title: "Сборник задач по непрерывной математике", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 4482570, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      archivedMaterial("real-s1-continuous-abramyan", "Файл", "Учебное пособие по непрерывной математике", "PDF", 2323654),
      archivedMaterial("real-s1-continuous-colloquium", "Экзаменационные материалы", "Коллоквиум 2 по непрерывной математике", "DOCX", 21835843),
    ] },
    { program: "test_real_data", discipline: "realSemesterFiles", semester: 1, materials: [
      { id: "real-s1-english-reviews", type: "Файл", title: "Отзывы по материалам курса", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "XLSX", sizeBytes: 20215, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
    ] },
    { program: "test_real_data", discipline: "realAlgebraGeometry", semester: 2, materials: [
      { id: "real-s2-algebra-notes", type: "Файл", title: "Материалы курса по алгебре и геометрии", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 27463860, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s2-algebra-doc", type: "Файл", title: "Дополнительный материал по алгебре и геометрии", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "DOCX", sizeBytes: 12872, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s2-algebra-textbook", type: "Файл", title: "Учебное пособие по алгебре и геометрии", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 2519485, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      archivedMaterial("real-s2-algebra-course-file", "Файл", "Учебный материал по алгебре и геометрии", "PDF", 1880986),
      archivedMaterial("real-s2-algebra-practice-13", "Практикум", "Практикум 13 по алгебре и геометрии", "DOCX", 46264),
    ] },
    { program: "test_real_data", discipline: "realDiscreteMath", semester: 2, materials: [
      { id: "real-s2-discrete-notes", type: "Файл", title: "Материалы по дискретной математике", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 29975951, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s2-discrete-exam", type: "Файл", title: "Подготовка к экзамену по дискретной математике", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 152126912, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      archivedMaterial("real-s2-discrete-exam-tickets", "Экзаменационные материалы", "Экзаменационные билеты по дискретной математике", "PDF", 3364394),
      archivedMaterial("real-s2-discrete-exam-questions", "Экзаменационные материалы", "Вопросы к экзамену по дискретной математике", "PDF", 23000),
    ] },
    { program: "test_real_data", discipline: "realContinuousMath", semester: 2, materials: [
      archivedMaterial("real-s2-continuous-ode-problems", "Практикум", "Сборник задач по обыкновенным дифференциальным уравнениям", "PDF", 11060271),
      archivedMaterial("real-s2-continuous-exam-program", "Экзаменационные материалы", "Программа экзамена по непрерывной математике", "PDF", 196270),
    ] },
    { program: "test_real_data", discipline: "realProgrammingLanguages", semester: 2, materials: [
      { id: "real-s2-languages-book", type: "Файл", title: "Учебный материал по языкам программирования", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 4154101, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      archivedMaterial("real-s2-languages-stringbuilder", "Файл", "Построение строк: учебный материал", "PDF", 176743),
      archivedMaterial("real-s2-languages-arrays", "Файл", "Массивы: учебный материал", "PDF", 54565),
      archivedMaterial("real-s2-languages-strings", "Файл", "Работа со строками: учебный материал", "PDF", 99225),
    ] },
    { program: "test_real_data", discipline: "realSemesterFiles", semester: 2, materials: [
      { id: "real-s2-schedule", type: "Файл", title: "Расписание семестра", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "XLSX", sizeBytes: 19158, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
    ] },
    { program: "test_real_data", discipline: "realProgrammingLanguages", semester: 3, materials: [
      archivedMaterial("real-s3-languages-algorithms", "Файл", "Алгоритмы: учебный материал", "PDF", 163850),
      archivedMaterial("real-s3-languages-yap-book", "Файл", "Языки программирования: учебный материал", "PDF", 39235776),
    ] },
    { program: "test_real_data", discipline: "realMathematicalLogic", semester: 3, materials: [
      archivedMaterial("real-s3-math-logic-lectures", "Лекция", "Лекции по математической логике", "PDF", 1293816),
      archivedMaterial("real-s3-math-logic-exam-questions", "Экзаменационные материалы", "Вопросы к экзамену по математической логике", "PDF", 89254),
    ] },
    { program: "test_real_data", discipline: "realSoftwareEngineering", semester: 3, materials: [
      archivedMaterial("real-s3-software-engineering-lecture-1", "Лекция", "Программная инженерия: лекция 1", "PDF", 741763),
      archivedMaterial("real-s3-software-engineering-lecture-2", "Лекция", "Программная инженерия: лекция 2", "PDF", 771981),
      archivedMaterial("real-s3-software-engineering-lecture-3", "Лекция", "Программная инженерия: лекция 3", "PDF", 407211),
    ] },
    { program: "test_real_data", discipline: "realEconomicsLaw", semester: 3, materials: [
      archivedMaterial("real-s3-economics-exam", "Экзаменационные материалы", "Контрольная работа по экономике и праву", "PDF", 553178),
      archivedMaterial("real-s3-economics-seminars", "Практикум", "План семинарских занятий по экономике и праву", "DOC", 107008),
    ] },
    { program: "test_real_data", discipline: "realProbabilityTheory", semester: 5, materials: [
      { id: "real-s5-probability-notes", type: "Файл", title: "Конспекты по теории вероятностей и математической статистике", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "PDF", sizeBytes: 862667, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s5-probability-labs", type: "Файл", title: "Ссылки на лабораторные работы", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "TXT", sizeBytes: 36, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      { id: "real-s5-probability-tickets", type: "Файл", title: "Статистика распределения экзаменационных билетов", description: "Файл из архива ФИИТ; содержимое не подключено к прототипу.", format: "DOCX", sizeBytes: 24326, academicYear: "2024-2026", addedDate: "Не указана", source: "Архив" },
      archivedMaterial("real-s5-probability-problem-book", "Файл", "Сборник задач по теории вероятностей и математической статистике", "PDF", 1335014),
      archivedMaterial("real-s5-probability-exam-program", "Экзаменационные материалы", "Программа экзамена по теории вероятностей и математической статистике", "PDF", 143316),
    ] },
    { program: "test_real_data", discipline: "realAutomataTheory", semester: 5, materials: [
      archivedMaterial("real-s5-automata-book", "Файл", "Материалы по теории автоматов", "PDF", 2427222),
      archivedMaterial("real-s5-automata-notes", "Файл", "Подготовка к контрольной 2 по теории автоматов и формальным языкам", "PDF", 1797561),
    ] },
    { program: "test_real_data", discipline: "realOperatingSystems", semester: 5, materials: [
      archivedMaterial("real-s5-os-introduction", "Лекция", "Операционные системы: введение", "PDF", 1050589),
      archivedMaterial("real-s5-os-processes", "Лекция", "Операционные системы: процессы", "PDF", 727754),
    ] },
    { program: "test_real_data", discipline: "realMozi", semester: 6, materials: [
      archivedMaterial("real-s6-mozi-exam-1", "Экзаменационные материалы", "Контрольная работа 1 по МОЗИ", "PDF", 2460993),
      archivedMaterial("real-s6-mozi-exam-2", "Экзаменационные материалы", "Контрольная работа 2 по МОЗИ", "PDF", 2861943),
    ] },
  ],
};

function courseForSemester(semester) {
  return Math.ceil(semester / 2);
}

function semesterOptions(program, course, discipline) {
  const semesters = catalog.curriculum
    .filter(entry => entry.program === program && entry.discipline === discipline
      && courseForSemester(entry.semester) === course)
    .map(entry => entry.semester)
    .sort((a, b) => a - b);
  return { semesters, selected: semesters.length === 1 ? semesters[0] : null };
}
