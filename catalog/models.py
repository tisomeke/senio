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
