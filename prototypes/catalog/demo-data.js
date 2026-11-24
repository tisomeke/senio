const catalog = {
  university: { id: "sfedu", name: "Южный федеральный университет (ЮФУ)" },
  institutes: [
    { id: "math", university: "sfedu", name: "Институт математики и компьютерных наук" },
  ],
  programs: [
    { id: "fiit", institute: "math", name: "Фундаментальная информатика и информационные технологии (ФИИТ)" },
    { id: "pmi", institute: "math", name: "Прикладная математика и информатика" },
  ],
  disciplines: {
    discrete: "Дискретная математика",
    basics: "Основы программирования",
    languages: "Языки программирования",
    algebra: "Линейная алгебра",
  },
  materialTypes: ["Лекция", "Практикум", "Контрольная", "Экзаменационные материалы"],
  curriculum: [
    { program: "fiit", discipline: "discrete", semester: 1, materials: [
      { addedAt: "2026-11-14", type: "Лекция", title: "Множества и отношения" },
      { addedAt: "2026-11-08", type: "Практикум", title: "Задачи на операции с множествами" },
      { addedAt: "2026-11-19", type: "Контрольная", title: "Отношения и отображения" },
    ] },
    { program: "fiit", discipline: "discrete", semester: 2, materials: [] },
    { program: "fiit", discipline: "basics", semester: 1, materials: [
      { addedAt: "2026-11-12", type: "Практикум", title: "Циклы и условия" },
    ] },
    { program: "fiit", discipline: "languages", semester: 2, materials: [] },
    { program: "fiit", discipline: "languages", semester: 3, materials: [
      { addedAt: "2026-11-22", type: "Лекция", title: "Системы типов" },
      { addedAt: "2026-11-20", type: "Экзаменационные материалы", title: "Вопросы по системам типов" },
    ] },
    { program: "pmi", discipline: "algebra", semester: 1, materials: [
      { addedAt: "2026-11-17", type: "Лекция", title: "Линейные пространства" },
      { addedAt: "2026-11-10", type: "Практикум", title: "Операции с матрицами" },
      { addedAt: "2026-11-23", type: "Контрольная", title: "Системы линейных уравнений" },
      { addedAt: "2026-11-06", type: "Лекция", title: "Базис и размерность" },
    ] },
    { program: "pmi", discipline: "languages", semester: 4, materials: [
      { addedAt: "2026-11-15", type: "Практикум", title: "Сравнение языков на примере численных методов" },
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
