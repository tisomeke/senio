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
  curriculum: [
    { program: "fiit", discipline: "discrete", semester: 1, materials: [
      { type: "Лекция", title: "Множества и отношения" },
      { type: "Практикум", title: "Задачи на операции с множествами" },
    ] },
    { program: "fiit", discipline: "discrete", semester: 2, materials: [] },
    { program: "fiit", discipline: "basics", semester: 1, materials: [
      { type: "Практикум", title: "Циклы и условия" },
    ] },
    { program: "fiit", discipline: "languages", semester: 2, materials: [] },
    { program: "fiit", discipline: "languages", semester: 3, materials: [
      { type: "Лекция", title: "Системы типов" },
    ] },
    { program: "pmi", discipline: "algebra", semester: 1, materials: [] },
    { program: "pmi", discipline: "languages", semester: 4, materials: [] },
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
