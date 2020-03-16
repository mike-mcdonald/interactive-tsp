FROM nginx:alpine
COPY ./dist/ /usr/share/nginx/html
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