FROM nginxinc/nginx-unprivileged:mainline-alpine
USER root
COPY entrypoint.sh /
COPY dist/h3lioviz/browser /usr/share/nginx/html/
RUN chown -R nginx:nginx /usr/share/nginx/
COPY nginx.conf.template /etc/nginx/
RUN rm /etc/nginx/conf.d/default.conf && \
    apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache gettext bash
ENV NGINX_CONTEXT_ROOT=/
# 4200 is the port that is whitelisted by the backend, also 8080 is used by the websocket
EXPOSE 4200
USER nginx
CMD /entrypoint.sh && nginx -g 'daemon off;'
