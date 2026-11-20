<div align="center">
  
<br>
  
<img src="../static/img/logo/logo-dark.svg" alt="Senio logo" width="260">

# SENIO
A web library of educational materials,
organized by educational programs and
disciplines.

<br>

<!-- Информационные ячейки(если будут нужны)
<img src="" height="" />
<img src="" height="" />
<img src="" height="" />
-->

</div>
<div>
<!-- Бейджи -->


<img src="https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white" alt="Python">
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
> [ссылка на русскую версию](../README.md)

<br>

## Quick links

| Document | Description |
|---|---|
| [Project overview](docs/annotation.md) | official description of the problem, goal, initial version, and limitations |
| [Open questions and known issues](docs/open-questions.md) | what remains unresolved in the project roadmap |
| [Git Workflow](dev-docs/git-workflow.md) | rules for branches, commits, Pull Requests, and reviews |

<br>

## About the project
**Senio** is a student project for organizing, searching, and sharing educational materials.
Students will be able to quickly search, view, and
download materials, as well as submit
their own materials for publication after moderation.

### Key features
* **Search and filters**: quick navigation by title, discipline, and type.
* **Adding educational materials**: a page for submitting a file for preliminary moderation with minimal friction.
* **Material page**: description, preview, and file download.
* **Administration**: catalog management, publication review, and complaint handling.

## Technology stack
* **Backend**: Python, Django.
* **Frontend**: Vanilla JS, Tailwind CSS, HTMX.
* **Deployment**: Docker.
* **Data**: PostgreSQL.

## Architecture

WIP

## Project status
The project is currently at an early stage of development.

## Developer setup instructions

### Requirements

- Git
- Docker
- Docker Compose

### Installation

1. Clone the repository and navigate to its directory.
2. Create `.env` from the template:

    ```bash
    cp .env.example .env
    ```

3. Generate a secret key and put its value in `.env`:

    ```bash
    python3 -c 'import secrets; print(secrets.token_urlsafe(50))'
    ```

> [!IMPORTANT]
> Important: each developer must create their own `.env`; keys must not be exposed in git.

> [!NOTE]
> The `DB_NAME`, `DB_USER`, and `DB_PASSWORD` variables from `.env` are used by the `db` service in `compose.yaml` to create the PostgreSQL database and by Django to connect to it. The host (`db`) and port (`5432`) are specified in `config/settings.py`.

> [!WARNING]
> If the `postgres_data` volume was created by an older PostgreSQL version, its data is incompatible with PostgreSQL 18. In a local environment without important data, recreate the volume with `docker compose down -v` and then run `docker compose up --build` again. This command deletes the local database data.

4. Build the image and start the application:

    ```bash
    docker compose up --build
    ```

5. Apply database migrations:

    ```bash
    docker compose run --rm web python manage.py migrate
    ```

6. Open [http://localhost:8000](http://localhost:8000) in your browser.

If the application starts successfully, the Senio page will be displayed.

### Stopping

Press `Ctrl+C` in the terminal where the application is running.

### Migrations

Apply migrations to the PostgreSQL database:

```bash
docker compose run --rm web python manage.py migrate
```

### Checking the Django configuration

```bash
docker compose run --rm web python manage.py check
```

### Code linting

```bash
docker compose run --rm web ruff check .
```

## License
[**MIT**](LICENSE)
