FROM python:latest
ADD . .
RUN pip install -r requirements.txt
CMD ["sh", "-c", "gunicorn --worker-tmp-dir=/dev/shm --workers=2 --threads=4 --worker-class=gthread --log-file=- --bind=0.0.0.0:$SERVER_PORT server:app"]