#!/bin/bash

# Var list is comma separated, ie VARS='${VAR_1},${VAR_2},${VAR_N},...'
export VARS='${NGINX_CONTEXT_ROOT},${LATIS_BASE},'

# Set the default context root if not defined.
if [ -z "${NGINX_CONTEXT_ROOT:-}" ] ; then
  export NGINX_CONTEXT_ROOT='/'
fi
# NGINX_CONTEXT_ROOT / angular base-href must end with a /
if [[ ! "${NGINX_CONTEXT_ROOT}" =~ /$ ]] ; then
  export NGINX_CONTEXT_ROOT="${NGINX_CONTEXT_ROOT}/"
fi
# Render nginx configuration before angular stuff to avoid base-href conflicts
envsubst "$VARS" < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/lasp.conf
for f in $(find /usr/share/nginx/html -type f -exec grep -Iq . {} \; -and -print) ; do
  envsubst "$VARS" < $f > $f.tmp && mv $f.tmp $f
done
