from django.contrib import admin

from .models import Material, Report


class ReportInline(admin.TabularInline):
    model = Report
    extra = 0
    fields = ("reason", "status", "user", "created_at")
    readonly_fields = ("reason", "status", "user", "created_at")
    can_delete = False
    show_change_link = True


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "material_type",
        "curriculum_entry",
        "status",
        "uploaded_by",
        "created_at",
    )
    list_filter = (
        "status",
        "material_type",
        "curriculum_entry__program",
        "curriculum_entry__semester",
    )
    search_fields = (
        "title",
        "description",
        "original_name",
        "curriculum_entry__discipline__name",
        "curriculum_entry__program__name",
    )
    list_select_related = (
        "material_type",
        "curriculum_entry",
        "uploaded_by",
    )
    autocomplete_fields = ("material_type", "curriculum_entry")
    readonly_fields = (
        "uploaded_by",
        "rights_confirmed",
        "original_name",
        "mime_type",
        "size",
        "sha256",
        "published_at",
        "created_at",
        "updated_at",
    )
    date_hierarchy = "created_at"
    inlines = (ReportInline,)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "description",
                    "material_type",
                    "curriculum_entry",
                )
            },
        ),
        (
            "File",
            {
                "fields": (
                    "file",
                    "original_name",
                    "mime_type",
                    "size",
                    "sha256",
                )
            },
        ),
        (
            "Moderation",
            {"fields": ("status", "rejection_reason", "published_at")},
        ),
        (
            "Meta",
            {
                "fields": (
                    "uploaded_by",
                    "rights_confirmed",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("material", "reason", "status", "user", "created_at")
    list_filter = ("status", "reason")
    search_fields = ("material__title", "comment")
    list_select_related = ("material", "user")
    autocomplete_fields = ("material", "user", "resolved_by")
    readonly_fields = ("created_at", "resolved_at")
    date_hierarchy = "created_at"
