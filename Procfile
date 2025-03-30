release: python manage.py makemigrations
release: python manage.py migrate
web: gunicorn stackoverflow.wsgi --log-file -
