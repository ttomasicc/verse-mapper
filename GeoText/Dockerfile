FROM python:3.10.13-slim

WORKDIR /app

COPY ./requirements.txt /app
RUN pip install -r requirements.txt
# RUN python -m spacy download en_core_web_sm
RUN python -m spacy download en_core_web_trf

COPY . .

EXPOSE 5000
ENV FLASK_APP=app.py

CMD ["flask", "run", "--host", "0.0.0.0"]
