from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models import ProtectedError
from django.test import TestCase, override_settings
from django.urls import reverse

from catalog.models import (
    CurriculumEntry,
    Discipline,
    EducationalProgram,
    Institute,
    MaterialType,
    University,
)

from .models import Material, Report

TEST_STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.InMemoryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}


class CatalogFixtureMixin:
    @classmethod
    def create_catalog(cls):
        cls.university = University.objects.create(
            name="SFEDU",
            slug="sfedu",
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
            name="Databases",
            slug="databases",
        )
        cls.entry = CurriculumEntry.objects.create(
            program=cls.program,
            discipline=cls.discipline,
            semester=3,
        )
        cls.material_type = MaterialType.objects.create(
            name="Lecture",
            slug="lecture",
        )


@override_settings(STORAGES=TEST_STORAGES)
class MaterialModelTests(CatalogFixtureMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.create_catalog()
        cls.user = get_user_model().objects.create_user(
            username="student",
            password="student-password",
        )
        cls.material = Material.objects.create(
            title="Databases lecture",
            description="Normalization",
            material_type=cls.material_type,
            curriculum_entry=cls.entry,
            file=SimpleUploadedFile(
                "lecture.pdf",
                b"%PDF-1.4 test",
                content_type="application/pdf",
            ),
            uploaded_by=cls.user,
            rights_confirmed=True,
        )

    def test_default_status_is_pending(self):
        self.assertEqual(self.material.status, Material.Status.PENDING)

    def test_material_is_linked_to_curriculum_entry(self):
        self.assertEqual(
            self.material.curriculum_entry.discipline,
            self.discipline,
        )

    def test_material_type_is_protected(self):
        with self.assertRaises(ProtectedError):
            self.material_type.delete()

    def test_curriculum_entry_is_protected(self):
        with self.assertRaises(ProtectedError):
            self.entry.delete()

    def test_deleting_user_keeps_material(self):
        self.user.delete()
        self.material.refresh_from_db()

        self.assertIsNone(self.material.uploaded_by)

    def test_deleting_material_cascades_reports(self):
        report = Report.objects.create(
            material=self.material,
            user=self.user,
            reason=Report.Reason.OTHER,
            comment="Test report",
        )

        self.material.delete()

        self.assertFalse(Report.objects.filter(pk=report.pk).exists())

    def test_str_methods(self):
        report = Report.objects.create(
            material=self.material,
            user=self.user,
            reason=Report.Reason.OTHER,
        )

        self.assertIn("Databases lecture", str(self.material))
        self.assertIn("Pending", str(self.material))
        self.assertIn("Databases lecture", str(report))
        self.assertIn("Open", str(report))


@override_settings(STORAGES=TEST_STORAGES)
class MaterialAdminTests(CatalogFixtureMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.create_catalog()
        cls.admin_user = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin-password",
        )
        Material.objects.create(
            title="Databases lecture",
            material_type=cls.material_type,
            curriculum_entry=cls.entry,
            file=SimpleUploadedFile(
                "lecture.pdf",
                b"%PDF-1.4 test",
                content_type="application/pdf",
            ),
            uploaded_by=cls.admin_user,
            rights_confirmed=True,
        )

    def setUp(self):
        self.client.force_login(self.admin_user)

    def test_changelists_are_available(self):
        url_names = (
            "admin:materials_material_changelist",
            "admin:materials_report_changelist",
        )

        for url_name in url_names:
            with self.subTest(url_name=url_name):
                response = self.client.get(reverse(url_name))
                self.assertEqual(response.status_code, 200)

    def test_add_pages_are_available(self):
        url_names = (
            "admin:materials_material_add",
            "admin:materials_report_add",
        )

        for url_name in url_names:
            with self.subTest(url_name=url_name):
                response = self.client.get(reverse(url_name))
                self.assertEqual(response.status_code, 200)
