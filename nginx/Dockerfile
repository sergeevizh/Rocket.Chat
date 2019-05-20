FROM rocketchat/base:8

ENV RC_VERSION 0.64.0-develop

RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list
RUN apt-get update && apt-get install nginx -y && apt-get install -y bsdtar && ln -sf $(which bsdtar) $(which tar)


RUN mkdir -p /app
ADD build.tar.gz /app
RUN cd /app/bundle/programs/server \
  && npm install \
  && npm cache clear --force \
  && chown -R rocketchat:rocketchat /app

COPY nginx/nginx.conf /nginx/nginx.conf
COPY nginx/passu /etc/nginx/passu

RUN mkdir -p /nginx/tmp && \
  chown  -R rocketchat /nginx && \
  touch /var/log/nginx/error.log && \
  chown rocketchat /etc/nginx/passu && \
  chown rocketchat /var/log/nginx/error.log


USER rocketchat

VOLUME /app/uploads
WORKDIR /app/bundle

COPY start.sh .


# needs a mongoinstance - defaults to container linking with alias 'mongo'
ENV DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    HOME=/tmp \
    PORT=3001 \
    ROOT_URL=http://localhost:3001 \
    Accounts_AvatarStorePath=/app/uploads

EXPOSE 3000

CMD ["./start.sh"]
