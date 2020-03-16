FROM node:13
RUN apt-get update && \
  apt-get install -yq \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget
COPY package.json .
COPY package-lock.json .
RUN npm install
ADD . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /dist /usr/share/nginx/html
RUN echo "\
server {\n\
    listen       80;\n\
    server_name  localhost;\n\
    gzip on;\n\
    gzip_types      text/plain text/css application/xml application/javascript;\n\
    gzip_proxied    no-cache no-store private expired auth;\n\
    gzip_min_length 1000;\n\
    location / {\n\
        root   /usr/share/nginx/html;\n\
        index  index.html index.htm;\n\
    }\n\
}\n\
" > /etc/nginx/conf.d/default.conf
