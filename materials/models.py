from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import models

from catalog.models import CurriculumEntry, MaterialType


def material_upload_to(instance, filename):
    """Build a safe storage key: materials/<uuid>.<extension>."""
    extension = Path(filename).suffix.lower()
    return f"materials/{uuid4().hex}{extension}"


class Material(models.Model):
    """Study material attached to a curriculum entry."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PUBLISHED = "published", "Published"
        REJECTED = "rejected", "Rejected"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    material_type = models.ForeignKey(
        MaterialType,
        on_delete=models.PROTECT,
        related_name="materials",
    )
    curriculum_entry = models.ForeignKey(
        CurriculumEntry,
        on_delete=models.PROTECT,
        related_name="materials",
    )
    file = models.FileField(
        upload_to=material_upload_to,
        max_length=255,
    )
    original_name = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    size = models.PositiveBigIntegerField(default=0)
    sha256 = models.CharField(max_length=64, blank=True, db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rejection_reason = models.TextField(blank=True)
    rights_confirmed = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_materials",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "material"
        verbose_name_plural = "materials"
        indexes = (
            models.Index(fields=("status", "created_at")),
            models.Index(fields=("curriculum_entry", "status")),
            models.Index(fields=("material_type", "status")),
        )

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class Report(models.Model):
    """User complaint about a published material."""

    class Reason(models.TextChoices):
        WRONG_DISCIPLINE = "wrong_discipline", "Wrong discipline"
        INCORRECT_CONTENT = "incorrect_content", "Incorrect content"
        RIGHTS_VIOLATION = "rights_violation", "Rights violation"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved"
        REJECTED = "rejected", "Rejected"

    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="material_reports",
    )
    reason = models.CharField(max_length=32, choices=Reason.choices)
    comment = models.TextField(blank=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.OPEN,
    )
    resolution_note = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_material_reports",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "report"
        verbose_name_plural = "reports"
        indexes = (
            models.Index(fields=("status", "created_at")),
            models.Index(fields=("material", "status")),
        )

    def __str__(self):
        return f"Report for {self.material} ({self.get_status_display()})"
