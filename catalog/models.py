from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

MIN_SEMESTER = 1
MAX_SEMESTER = 12


class University(models.Model):
    """Root of the catalog: a university."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=64, unique=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "university"
        verbose_name_plural = "universities"

    def __str__(self):
        return self.name


class Institute(models.Model):
    """Institute (faculty) that belongs to a university."""

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="institutes",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=64)

    class Meta:
        ordering = ("name",)
        verbose_name = "institute"
        verbose_name_plural = "institutes"
        constraints = (
            models.UniqueConstraint(
                fields=("university", "slug"),
                name="unique_institute_slug_per_university",
            ),
        )

    def __str__(self):
        return self.name


class EducationalProgram(models.Model):
    """Educational program offered by an institute."""

    institute = models.ForeignKey(
        Institute,
        on_delete=models.CASCADE,
        related_name="programs",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=32)
    slug = models.SlugField(max_length=64)

    class Meta:
        ordering = ("name",)
        verbose_name = "educational program"
        verbose_name_plural = "educational programs"
        constraints = (
            models.UniqueConstraint(
                fields=("institute", "slug"),
                name="unique_program_slug_per_institute",
            ),
            models.UniqueConstraint(
                fields=("institute", "code"),
                name="unique_program_code_per_institute",
            ),
        )

    def __str__(self):
        return f"{self.code} {self.name}"


class Discipline(models.Model):
    """Discipline shared by educational programs via the curriculum."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=64, unique=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "discipline"
        verbose_name_plural = "disciplines"

    def __str__(self):
        return self.name


class CurriculumEntry(models.Model):
    """Link between a program and a discipline with a semester number.

    A discipline may appear in several semesters of the same program,
    so the semester is a part of the entry uniqueness.
    """

    program = models.ForeignKey(
        EducationalProgram,
        on_delete=models.CASCADE,
        related_name="curriculum_entries",
    )
    discipline = models.ForeignKey(
        Discipline,
        on_delete=models.PROTECT,
        related_name="curriculum_entries",
    )
    semester = models.PositiveSmallIntegerField(
        validators=(
            MinValueValidator(MIN_SEMESTER),
            MaxValueValidator(MAX_SEMESTER),
        ),
    )

    class Meta:
        ordering = ("program", "semester", "discipline")
        verbose_name = "curriculum entry"
        verbose_name_plural = "curriculum entries"
        constraints = (
            models.UniqueConstraint(
                fields=("program", "discipline", "semester"),
                name="unique_curriculum_entry",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    semester__gte=MIN_SEMESTER,
                    semester__lte=MAX_SEMESTER,
                ),
                name="curriculum_entry_semester_range",
            ),
        )

    def __str__(self):
        return f"{self.program} - {self.discipline} ({self.semester})"


class MaterialType(models.Model):
    """Reference list of material types (lecture, test, exam, ...).

    Types are kept in a dedicated table instead of free-form tags: the
    list is managed in the admin, names stay consistent and variants
    like "test" and "control work" do not multiply. Materials
    are modeled separately in the materials app.
    """

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=64, unique=True)

    class Meta:
        ordering = ("name",)
        verbose_name = "material type"
        verbose_name_plural = "material types"

    def __str__(self):
        return self.name
