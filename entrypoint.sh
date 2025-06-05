#!/bin/bash

# Var list is comma separated, ie VARS='${VAR_1},${VAR_2},${VAR_N},...'
export VARS='${NGINX_CONTEXT_ROOT},${LATIS_BASE},'

# Set the default context root to "/" if unset or empty
if [ -z "${NGINX_CONTEXT_ROOT:-}" ] ; then
  export NGINX_CONTEXT_ROOT='/'
fi

# Substitute env vars in the nginx template to generate the nginx config file.
# For this substitution, NGINX_CONTEXT_ROOT should be "/" or a path without a
# trailing slash to ensure the location block matches requests with or without
# a trailing slash.
envsubst "$VARS" < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/lasp.conf

# Add trailing slash to NGINX_CONTEXT_ROOT if not already present, for Angular
# base href
if [[ ! "${NGINX_CONTEXT_ROOT}" =~ /$ ]] ; then
  export NGINX_CONTEXT_ROOT="${NGINX_CONTEXT_ROOT}/"
fi

# Substitute env vars inside all non-binary files in /usr/share/nginx/html
for f in $(find /usr/share/nginx/html -type f -exec grep -Iq . {} \; -and -print) ; do
  envsubst "$VARS" < $f > $f.tmp && mv $f.tmp $f
done
