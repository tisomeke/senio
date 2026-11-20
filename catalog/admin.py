from django.contrib import admin

from .models import (
    CurriculumEntry,
    Discipline,
    EducationalProgram,
    Institute,
    MaterialType,
    University,
)


class InstituteInline(admin.TabularInline):
    model = Institute
    extra = 0
    fields = ("name", "slug")
    show_change_link = True


class EducationalProgramInline(admin.TabularInline):
    model = EducationalProgram
    extra = 0
    fields = ("name", "code", "slug")
    show_change_link = True


class ProgramCurriculumEntryInline(admin.TabularInline):
    model = CurriculumEntry
    extra = 0
    fields = ("discipline", "semester")
    autocomplete_fields = ("discipline",)


class DisciplineCurriculumEntryInline(admin.TabularInline):
    model = CurriculumEntry
    extra = 0
    fields = ("program", "semester")
    autocomplete_fields = ("program",)
    verbose_name = "curriculum entry"
    verbose_name_plural = "curriculum entries"


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    inlines = (InstituteInline,)


@admin.register(Institute)
class InstituteAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "university")
    list_filter = ("university",)
    search_fields = ("name", "slug", "university__name")
    list_select_related = ("university",)
    inlines = (EducationalProgramInline,)


@admin.register(EducationalProgram)
class EducationalProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "slug", "institute")
    list_filter = ("institute__university", "institute")
    search_fields = ("name", "code", "slug")
    list_select_related = ("institute",)
    inlines = (ProgramCurriculumEntryInline,)


@admin.register(Discipline)
class DisciplineAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    inlines = (DisciplineCurriculumEntryInline,)


@admin.register(CurriculumEntry)
class CurriculumEntryAdmin(admin.ModelAdmin):
    list_display = ("program", "discipline", "semester")
    list_filter = (
        "semester",
        "program__institute__university",
        "program__institute",
    )
    search_fields = ("program__name", "program__code", "discipline__name")
    list_select_related = ("program", "discipline")
    autocomplete_fields = ("program", "discipline")


@admin.register(MaterialType)
class MaterialTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
