# StackOverflow Clone
**Live Demo:** [nurmek.site](https://devoverflow.nurmek.site)

A Django-based clone of StackOverflow that provides a community-driven Q&A platform for developers. This project includes features such as posting questions and answers, voting, commenting, user profiles, badges, and bookmarking.

## Features

- **Questions & Answers**: Users can post, update, and delete questions and answers.
- **Voting System**: Upvote and downvote questions and answers.
- **Comments**: Add comments to questions and answers.
- **User Profiles**: Each user has a profile with reputation, activity stats, and more.
- **Badges**: Award badges to posts and display awarded badges on user profiles.
- **Bookmarks**: Users can bookmark interesting questions.
- **Search**: Search functionality for questions, answers, users, and tags.
- **Authentication**: Registration, login, and logout (including JWT support).
- **Password Reset**: Built-in password reset via email.

## Installation

### Prerequisites

- Python 3.11+
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone https://github.com/nurmek51/stackoverflow-clone.git
cd stackoverflow-clone
```

### Create and Activate a Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the root directory with your local configuration. For example:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database settings
DB_NAME=db
DB_USER=postgres
DB_PASSWORD=pword
DB_HOST=localhost
DB_PORT=5432
```

The settings file uses `dj-database-url` to build the database connection string. In `settings.py`, the database is configured as:

```python
import dj_database_url

default_db_url = os.getenv('DATABASE_URL')
if not default_db_url:
    default_db_url = "postgresql://{user}:{password}@{host}:{port}/{name}".format(
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'pword'),
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        name=os.getenv('DB_NAME', 'db')
    )

DATABASES = {
    'default': dj_database_url.config(default=default_db_url)
}
```

### Migrate and Collect Static Files

Run the following commands to apply migrations and collect static files:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### Run the Development Server

```bash
python manage.py runserver
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser to see the application.
