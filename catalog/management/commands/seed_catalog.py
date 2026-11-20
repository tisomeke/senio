from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import (
    CurriculumEntry,
    Discipline,
    EducationalProgram,
    Institute,
    MaterialType,
    University,
)

DISCIPLINES = {
    "introduction-to-programming": "Introduction to Programming",
    "discrete-mathematics": "Discrete Mathematics",
    "linear-algebra": "Linear Algebra",
    "databases": "Databases",
    "operating-systems": "Operating Systems",
    "computer-networks": "Computer Networks",
    "probability-theory": "Probability Theory",
    "software-engineering": "Software Engineering",
}

MATERIAL_TYPES = {
    "lecture": "Lecture",
    "practical-class": "Practical class",
    "laboratory-work": "Laboratory work",
    "test": "Test",
    "exam": "Exam",
    "coursework": "Coursework",
}

CATALOG = (
    {
        "name": "Southern Federal University",
        "slug": "sfedu",
        "institutes": (
            {
                "name": "Institute of Computer Technologies and "
                "Information Security",
                "slug": "ictis",
                "programs": (
                    {
                        "name": "Applied Informatics",
                        "code": "09.03.03",
                        "slug": "applied-informatics",
                        "curriculum": (
                            ("introduction-to-programming", 1),
                            ("discrete-mathematics", 1),
                            ("linear-algebra", 2),
                            ("databases", 3),
                            ("operating-systems", 4),
                            ("computer-networks", 4),
                        ),
                    },
                    {
                        "name": "Information Security",
                        "code": "10.03.01",
                        "slug": "information-security",
                        "curriculum": (
                            ("introduction-to-programming", 1),
                            ("discrete-mathematics", 2),
                            ("operating-systems", 3),
                            ("computer-networks", 4),
                        ),
                    },
                ),
            },
            {
                "name": "Institute of Mathematics, Mechanics and "
                "Computer Sciences",
                "slug": "immcs",
                "programs": (
                    {
                        "name": "Applied Mathematics and Informatics",
                        "code": "01.03.02",
                        "slug": "applied-mathematics-and-informatics",
                        "curriculum": (
                            ("linear-algebra", 1),
                            ("discrete-mathematics", 2),
                            ("probability-theory", 3),
                            ("software-engineering", 4),
                        ),
                    },
                ),
            },
        ),
    },
)


class Command(BaseCommand):
    help = "Load idempotent demo data for the catalog app."

    @transaction.atomic
    def handle(self, *args, **options):
        disciplines = {}
        for slug, name in DISCIPLINES.items():
            discipline, _ = Discipline.objects.update_or_create(
                slug=slug, defaults={"name": name}
            )
            disciplines[slug] = discipline

        entries_created = 0
        programs_created = 0
        institutes_created = 0
        universities_created = 0

        for university_data in CATALOG:
            university, created = University.objects.update_or_create(
                slug=university_data["slug"],
                defaults={"name": university_data["name"]},
            )
            universities_created += int(created)

            for institute_data in university_data["institutes"]:
                institute, created = Institute.objects.update_or_create(
                    university=university,
                    slug=institute_data["slug"],
                    defaults={"name": institute_data["name"]},
                )
                institutes_created += int(created)

                for program_data in institute_data["programs"]:
                    program, created = (
                        EducationalProgram.objects.update_or_create(
                            institute=institute,
                            slug=program_data["slug"],
                            defaults={
                                "name": program_data["name"],
                                "code": program_data["code"],
                            },
                        )
                    )
                    programs_created += int(created)

                    for discipline_slug, semester in program_data[
                        "curriculum"
                    ]:
                        _, created = CurriculumEntry.objects.get_or_create(
                            program=program,
                            discipline=disciplines[discipline_slug],
                            semester=semester,
                        )
                        entries_created += int(created)

        material_types_created = 0
        for slug, name in MATERIAL_TYPES.items():
            _, created = MaterialType.objects.update_or_create(
                slug=slug, defaults={"name": name}
            )
            material_types_created += int(created)

        self.stdout.write(
            self.style.SUCCESS(
                "Demo catalog loaded: "
                f"{universities_created} universities, "
                f"{institutes_created} institutes, "
                f"{programs_created} programs, "
                f"{len(DISCIPLINES)} disciplines, "
                f"{entries_created} curriculum entries, "
                f"{material_types_created} material types created."
            )
        )
