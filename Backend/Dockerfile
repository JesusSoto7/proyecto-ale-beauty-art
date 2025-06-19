# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.2.3
FROM ruby:$RUBY_VERSION-slim AS base

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    git \
    pkg-config \
    libgmp-dev \
    curl \
    libjemalloc2 \
    libvips \
    default-libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

ENV RAILS_ENV="development" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_BIN="/usr/local/bundle/bin" \
    PATH="/usr/local/bundle/bin:$PATH"

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 4000

ENTRYPOINT ["bash", "-c", "rm -f tmp/pids/server.pid && bundle exec rails server -b 'ssl://0.0.0.0:4000?key=config/ssl/server.key&cert=config/ssl/server.crt'"]
