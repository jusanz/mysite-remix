FROM python:3-slim
EXPOSE 8000
WORKDIR /app
COPY requirements_lock.txt /app
RUN apt-get update \
  && apt-get -y install binutils libproj-dev gdal-bin \
  && pip install --upgrade pip \
  && pip install wheel \
  &&  pip install -r requirements_lock.txt --no-cache-dir
COPY . /app

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "main.asgi:application"]
