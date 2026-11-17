<div align="center">
  
<br>
  
<img src="static/img/logo/logo-dark.svg" alt="Senio logo" width="260">

# SENIO
Веб-библиотека учебных материалов,
организованных по образовательным программам и
дисциплинам.

<br>

<!-- Информационные ячейки(если будут нужны)
<img src="" height="" />
<img src="" height="" />
<img src="" height="" />
-->

</div>
<div>
<!-- Бейджи -->


<img src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/Django-092E20?logo=django&logoColor=white" alt="Django">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/HTMX-3366CC?logo=htmx&logoColor=white" alt="HTMX">
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
<img src="https://img.shields.io/badge/Django_Templates-092E20?logo=django&logoColor=white" alt="Django Templates">
<img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">

</div>

<br>

> [!TIP]
> [link to english version](./docs/README.en.md)

<br>

## Быстрые ссылки

| Документ | О чём |
|---|---|
| [Аннотация проекта](docs/annotation.md) | снимок для жюри; может расходиться с текущим планом |
| [План и статус](docs/ROADMAP.md) | MVP, порядок работ и открытые вопросы |
| [User Stories](dev-docs/user-stories/US-MOC.md) | карта пользовательских историй |
| [Git Workflow](dev-docs/git-workflow.md) | правила веток, коммитов, Pull Request и ревью |

<br>

## О проекте
**Senio** — студенческий проект для организации, поиска и обмена учебными материалами.
Студенты смогут быстро искать, просматривать и
скачивать материалы, а также предлагать
собственные для публикации после модерации.

### Ключевые возможности
* **Поиск и фильтры**: быстрый переход по названию, дисциплине и типу.
* **Добавление учебного материала**: страница отправки файла на предварительную модерацию без лишнего трения.
* **Страница материала**: описание, просмотр и скачивание файла.
* **Администрирование**: настройка каталога, проверка публикаций и обработка жалоб.

## Стек технологий
* **Backend**: Python, Django.
* **Frontend**: Vanilla JS, Tailwind CSS, HTMX.
* **Развертывание**: Docker.
* **Данные**: PostgreSQL.

## Архитектура

WIP

## Статус проекта
Проект на ранней стадии: готов Django-скелет и Docker-окружение,
прикладной функциональности пока нет. Актуальный статус и план — в
[ROADMAP](docs/ROADMAP.md).

## Инструкция по настройке для разработчиков

### Требования

- Git
- Docker
- Docker Compose

### Установка

1. Клонируйте репозиторий и перейдите в его директорию.
2. Создайте `.env` из шаблона:

    ```bash
    cp .env.example .env
    ```

3. Сгенерируйте секретный ключ и положите значение в `.env`:

    ```bash
    python3 -c 'import secrets; print(secrets.token_urlsafe(50))'
    ```

> [!IMPORTANT]
> Важно: каждый разработчик создаёт свой .env; ключи нельзя раскрывать в git.

> [!NOTE]
> Переменные `DB_NAME`, `DB_USER`, `DB_PASSWORD` из `.env` используются сервисом `db` в `compose.yaml` для создания базы данных PostgreSQL и Django для подключения к ней. Хост (`db`) и порт (`5432`) заданы в `config/settings.py`.

4. Соберите образ и запустите приложение:

    ```bash
    docker compose up --build
    ```

5. Примените миграции к базе данных:

    ```bash
    docker compose run --rm web python manage.py migrate
    ```

6. Откройте в браузере [http://localhost:8000](http://localhost:8000).

При успешном запуске отобразится страница Senio.

### Остановка

Нажмите `Ctrl+C` в терминале, где запущено приложение.

### Миграции

Применить миграции к базе данных PostgreSQL:

```bash
docker compose run --rm web python manage.py migrate
```

### Проверка конфигурации Django

```bash
docker compose run --rm web python manage.py check
```

### Линтинг кода

```bash
docker compose run --rm web ruff check .
```

## Лицензия
[**MIT**](LICENSE)
