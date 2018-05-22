FROM rocketchat/base:8

ENV RC_VERSION 0.64.0-develop

RUN apt-get update && apt-get install -y bsdtar && ln -sf $(which bsdtar) $(which tar)

RUN mkdir -p /app
ADD build.tar.gz /app
RUN cd /app/bundle/programs/server \
  && npm install \
  && npm cache clear --force \
  && chown -R rocketchat:rocketchat /app

USER rocketchat

VOLUME /app/uploads

WORKDIR /app/bundle

# needs a mongoinstance - defaults to container linking with alias 'mongo'
ENV DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    Accounts_AvatarStorePath=/app/uploads

EXPOSE 3000

CMD ["node", "main.js"]
