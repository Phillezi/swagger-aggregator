FROM --platform=$BUILDPLATFORM python:alpine3.21 AS python-provider
FROM --platform=$BUILDPLATFORM oven/bun:latest AS builder

WORKDIR /app

# For some reason swagger-ui-react requires python when building
COPY --from=python-provider /usr/local/bin/python3 /usr/local/bin/python3
COPY --from=python-provider /usr/local/lib/python* /usr/local/lib/
COPY --from=python-provider /usr/local/bin/idle /usr/local/bin/
COPY --from=python-provider /usr/local/bin/pip /usr/local/bin/
COPY --from=python-provider /usr/local/bin/pydoc /usr/local/bin/
COPY --from=python-provider /usr/local/bin/python /usr/local/bin/
COPY --from=python-provider /usr/local/bin/python-config /usr/local/bin/
COPY --from=python-provider /usr/local/bin/python3.13 /usr/local/bin/python3.13
COPY --from=python-provider /usr/local/lib/libpython3.13.so.1.0 /usr/local/lib/
COPY --from=python-provider /lib/ld-musl-x86_64.so.1 /lib/
COPY --from=python-provider /usr/local/include/python3.13 /usr/local/include/
ENV PYTHON=/usr/local/bin/python3
RUN which python3 && python3 --version

COPY package*.json bunfig.toml bun.lockb ./

RUN export PYTHON=$(which python3) && export PATH=$PATH:/usr/local/bin && export npm_config_python=/usr/local/bin/python3.13 && bun i --ignore-scripts

COPY .env.development scripts/ ./

RUN ./docker-envs.ts .env.production && \
    ./nginx-entrypoint.ts && \
    rm .env.development

COPY eslint.config.js index.html tsconfig*.json vite.config.ts ./
COPY src src
COPY public public

RUN bun run build

FROM nginx:latest

COPY --from=builder --link /app/dist/ /usr/share/nginx/html/
COPY --link docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chmod=777 --link /app/entrypoint.sh .

# default value
ENV OPENAPI_URLS="https://petstore.swagger.io/v2/swagger.json,https://petstore.swagger.io/v2/swagger.json,https://petstore.swagger.io/v2/swagger.json"

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
