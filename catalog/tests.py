from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase
from django.urls import reverse

from .models import (
    CurriculumEntry,
    Discipline,
    EducationalProgram,
    Institute,
    MaterialType,
    University,
)


class CatalogModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.university = University.objects.create(
            name="SFEDU", slug="sfedu"
        )
        cls.institute = Institute.objects.create(
            university=cls.university,
            name="ICTIS",
            slug="ictis",
        )
        cls.program = EducationalProgram.objects.create(
            institute=cls.institute,
            name="Applied Informatics",
            code="09.03.03",
            slug="applied-informatics",
        )
        cls.discipline = Discipline.objects.create(
            name="Databases", slug="databases"
        )
        cls.entry = CurriculumEntry.objects.create(
            program=cls.program,
            discipline=cls.discipline,
            semester=3,
        )

    def test_program_to_semester_to_discipline_path(self):
        entries = self.program.curriculum_entries.filter(semester=3)

        self.assertEqual(
            [entry.discipline for entry in entries],
            [self.discipline],
        )

    def test_discipline_to_program_and_semester_path(self):
        entries = self.discipline.curriculum_entries.all()

        self.assertEqual(
            [(entry.program, entry.semester) for entry in entries],
            [(self.program, 3)],
        )

    def test_university_slug_is_unique(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                University.objects.create(name="Other", slug="sfedu")

    def test_institute_slug_is_unique_within_university(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Institute.objects.create(
                    university=self.university,
                    name="Duplicate",
                    slug="ictis",
                )

    def test_institute_slug_may_repeat_in_another_university(self):
        other_university = University.objects.create(
            name="Other University", slug="other-university"
        )

        institute = Institute.objects.create(
            university=other_university,
            name="ICTIS",
            slug="ictis",
        )

        self.assertEqual(institute.slug, "ictis")

    def test_program_slug_is_unique_within_institute(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                EducationalProgram.objects.create(
                    institute=self.institute,
                    name="Duplicate",
                    code="01.01.01",
                    slug="applied-informatics",
                )

    def test_program_code_is_unique_within_institute(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                EducationalProgram.objects.create(
                    institute=self.institute,
                    name="Duplicate",
                    code="09.03.03",
                    slug="duplicate-program",
                )

    def test_discipline_slug_is_unique(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Discipline.objects.create(name="Duplicate", slug="databases")

    def test_duplicate_curriculum_entry_is_rejected(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                CurriculumEntry.objects.create(
                    program=self.program,
                    discipline=self.discipline,
                    semester=3,
                )

    def test_same_discipline_is_allowed_in_another_semester(self):
        entry = CurriculumEntry.objects.create(
            program=self.program,
            discipline=self.discipline,
            semester=4,
        )

        self.assertEqual(
            self.discipline.curriculum_entries.count(),
            2,
        )
        self.assertEqual(entry.semester, 4)

    def test_semester_validator_rejects_out_of_range_value(self):
        entry = CurriculumEntry(
            program=self.program,
            discipline=self.discipline,
            semester=0,
        )

        with self.assertRaises(ValidationError) as error:
            entry.full_clean()

        self.assertIn("semester", error.exception.message_dict)

    def test_semester_check_constraint_rejects_out_of_range_value(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                CurriculumEntry.objects.create(
                    program=self.program,
                    discipline=self.discipline,
                    semester=0,
                )

    def test_discipline_with_curriculum_entries_is_protected(self):
        with self.assertRaises(ProtectedError):
            with transaction.atomic():
                self.discipline.delete()

    def test_deleting_university_cascades_to_curriculum_entries(self):
        self.university.delete()

        self.assertFalse(Institute.objects.exists())
        self.assertFalse(EducationalProgram.objects.exists())
        self.assertFalse(CurriculumEntry.objects.exists())
        self.assertTrue(Discipline.objects.exists())

    def test_material_type_slug_is_unique(self):
        MaterialType.objects.create(name="Lecture", slug="lecture")

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                MaterialType.objects.create(name="Lecture 2", slug="lecture")

    def test_str_methods(self):
        self.assertEqual(str(self.university), "SFEDU")
        self.assertEqual(str(self.institute), "ICTIS")
        self.assertEqual(
            str(self.program), "09.03.03 Applied Informatics"
        )
        self.assertEqual(str(self.discipline), "Databases")
        self.assertEqual(
            str(self.entry),
            "09.03.03 Applied Informatics - Databases (3)",
        )


class CatalogAdminTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin-password",
        )
        cls.university = University.objects.create(
            name="SFEDU", slug="sfedu"
        )
        cls.institute = Institute.objects.create(
            university=cls.university,
            name="ICTIS",
            slug="ictis",
        )
        cls.program = EducationalProgram.objects.create(
            institute=cls.institute,
            name="Applied Informatics",
            code="09.03.03",
            slug="applied-informatics",
        )
        cls.discipline = Discipline.objects.create(
            name="Databases", slug="databases"
        )
        CurriculumEntry.objects.create(
            program=cls.program,
            discipline=cls.discipline,
            semester=3,
        )
        MaterialType.objects.create(name="Lecture", slug="lecture")

    def setUp(self):
        self.client.force_login(self.admin_user)

    def test_changelists_are_available(self):
        models = (
            University,
            Institute,
            EducationalProgram,
            Discipline,
            CurriculumEntry,
            MaterialType,
        )

        for model in models:
            with self.subTest(model=model.__name__):
                url = reverse(
                    f"admin:catalog_{model._meta.model_name}_changelist"
                )
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)

    def test_add_pages_are_available(self):
        models = (
            University,
            Institute,
            EducationalProgram,
            Discipline,
            CurriculumEntry,
            MaterialType,
        )

        for model in models:
            with self.subTest(model=model.__name__):
                url = reverse(f"admin:catalog_{model._meta.model_name}_add")
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)

    def test_curriculum_entry_can_be_created_in_admin(self):
        other_discipline = Discipline.objects.create(
            name="Operating Systems", slug="operating-systems"
        )

        response = self.client.post(
            reverse("admin:catalog_curriculumentry_add"),
            {
                "program": self.program.pk,
                "discipline": other_discipline.pk,
                "semester": 4,
            },
        )

        self.assertRedirects(
            response,
            reverse("admin:catalog_curriculumentry_changelist"),
        )
        self.assertTrue(
            CurriculumEntry.objects.filter(
                program=self.program,
                discipline=other_discipline,
                semester=4,
            ).exists()
        )

    def test_anonymous_user_is_redirected_to_login(self):
        self.client.logout()

        response = self.client.get(
            reverse("admin:catalog_university_changelist")
        )

        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response["Location"])
