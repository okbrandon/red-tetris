SHELL := /bin/bash

PROJECT_NAME := $(notdir $(CURDIR))
HOST_NAME := $(shell hostname -s)
DC := docker compose
DC_APP := $(DC) -p $(PROJECT_NAME)-app -f docker-compose.yml
DC_NPM := $(DC) -p $(PROJECT_NAME)-npm -f docker-compose.npm.yml
NPM := npm
NPX := npx

FRONTEND_DIR := frontend
BACKEND_DIR := backend

ENV_FILE := .env
ENV_TEMPLATE := .env.template

MONGO_VOLUME := $(PROJECT_NAME)_mongo-data

RESET := \033[0m
BOLD := \033[1m
FG_CYAN := \033[36m
FG_MAGENTA := \033[35m
FG_GREEN := \033[32m

.DEFAULT_GOAL := help

.PHONY: help env \
        app-build app-up app-up-and-build app-down app-logs app-reset \
        npm-up npm-down npm-logs \
        up up-and-build down restart logs reset clean-volumes \
        deps deps-frontend deps-backend \
        build build-frontend test test-frontend test-backend lint lint-frontend

help:
	@printf "$(BOLD)Available targets$(RESET)\n"
	@printf "  $(FG_CYAN)help$(RESET)               Show this help text $(FG_GREEN)(default)$(RESET)\n"
	@printf "  $(FG_MAGENTA)Environment$(RESET)\n"
	@printf "    $(FG_CYAN)env$(RESET)              Ensure %s exists (copy from %s when missing)\n" "$(ENV_FILE)" "$(ENV_TEMPLATE)"
	@printf "  $(FG_MAGENTA)Dependencies$(RESET)\n"
	@printf "    $(FG_CYAN)deps$(RESET)             Install frontend and backend dependencies\n"
	@printf "    $(FG_CYAN)deps-frontend$(RESET)    Install frontend dependencies only\n"
	@printf "    $(FG_CYAN)deps-backend$(RESET)     Install backend dependencies only\n"
	@printf "  $(FG_MAGENTA)Build & Quality$(RESET)\n"
	@printf "    $(FG_CYAN)build$(RESET)            Build the frontend bundle (installs deps first)\n"
	@printf "    $(FG_CYAN)build-frontend$(RESET)   Build the frontend bundle only\n"
	@printf "    $(FG_CYAN)lint$(RESET)             Run frontend linting (installs deps first)\n"
	@printf "    $(FG_CYAN)lint-frontend$(RESET)    Run frontend linting only\n"
	@printf "    $(FG_CYAN)test$(RESET)             Run frontend and backend tests once\n"
	@printf "    $(FG_CYAN)test-frontend$(RESET)    Run frontend tests only\n"
	@printf "    $(FG_CYAN)test-backend$(RESET)     Run backend tests only\n"
	@printf "  $(FG_MAGENTA)Docker lifecycle (both stacks)$(RESET)\n"
	@printf "    $(FG_CYAN)up$(RESET)               Start NPM + app in the background\n"
	@printf "    $(FG_CYAN)up-and-build$(RESET)     Start app with rebuilt images + NPM\n"
	@printf "    $(FG_CYAN)down$(RESET)             Stop NPM and app containers\n"
	@printf "    $(FG_CYAN)restart$(RESET)          Restart both stacks cleanly\n"
	@printf "    $(FG_CYAN)logs$(RESET)             Tail Docker logs from app services\n"
	@printf "    $(FG_CYAN)reset$(RESET)            Stop app + NPM and remove app volumes\n"
	@printf "    $(FG_CYAN)clean-volumes$(RESET)    Remove the MongoDB Docker volume\n"
	@printf "  $(FG_MAGENTA)Docker lifecycle (app only)$(RESET)\n"
	@printf "    $(FG_CYAN)app-build$(RESET)        Build app Docker images\n"
	@printf "    $(FG_CYAN)app-up$(RESET)           Start app stack only\n"
	@printf "    $(FG_CYAN)app-up-and-build$(RESET) Start app with rebuilt images only\n"
	@printf "    $(FG_CYAN)app-down$(RESET)         Stop app containers only\n"
	@printf "    $(FG_CYAN)app-logs$(RESET)         Tail app logs only\n"
	@printf "    $(FG_CYAN)app-reset$(RESET)        Stop app and remove app volumes\n"
	@printf "  $(FG_MAGENTA)Docker lifecycle (NPM only)$(RESET)\n"
	@printf "    $(FG_CYAN)npm-up$(RESET)           Start Nginx Proxy Manager only\n"
	@printf "    $(FG_CYAN)npm-down$(RESET)         Stop Nginx Proxy Manager only\n"
	@printf "    $(FG_CYAN)npm-logs$(RESET)         Tail NPM logs only\n"

create-network:
	@if ! docker network ls --format '{{.Name}}' | grep -q "^proxy-net$$"; then \
		docker network create proxy-net; \
		printf "Created docker network proxy-net\n"; \
	else \
		printf "Docker network proxy-net already exists\n"; \
	fi

env: create-network
	@if [ ! -f "$(ENV_FILE)" ] && [ -f "$(ENV_TEMPLATE)" ]; then \
		cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; \
		printf "Created %s from %s\n" "$(ENV_FILE)" "$(ENV_TEMPLATE)"; \
	elif [ ! -f "$(ENV_FILE)" ]; then \
		printf "Missing %s; supply one manually.\n" "$(ENV_FILE)"; \
	fi
	@if grep -q "^VITE_HOST_NAME=" "$(ENV_FILE)"; then \
		sed -i "s/^VITE_HOST_NAME=.*/VITE_HOST_NAME=$(HOST_NAME)/" "$(ENV_FILE)"; \
		printf "Set VITE_HOST_NAME in %s to %s\n" "$(ENV_FILE)" "$(HOST_NAME)"; \
	else \
		echo "VITE_HOST_NAME=$(HOST_NAME)" >> "$(ENV_FILE)"; \
		printf "Appended VITE_HOST_NAME=%s to %s\n" "$(HOST_NAME)" "$(ENV_FILE)"; \
	fi

# ---- Docker: app stack only ----
app-build: env
	$(DC_APP) build

app-up: env
	$(DC_APP) up -d --remove-orphans

app-up-and-build: env
	$(DC_APP) up -d --build --remove-orphans

app-down:
	$(DC_APP) down

app-logs:
	$(DC_APP) logs -f

app-reset:
	$(DC_APP) down -v --remove-orphans

# ---- Docker: NPM stack only ----
npm-up:
	$(DC_NPM) up -d --remove-orphans

npm-down:
	$(DC_NPM) down

npm-logs:
	$(DC_NPM) logs -f

# ---- Docker: both stacks together ----
up: env
	$(DC_NPM) up -d --remove-orphans
	$(DC_APP) up -d --remove-orphans

up-and-build: env
	$(DC_APP) up -d --build --remove-orphans
	$(DC_NPM) up -d --remove-orphans

down:
	$(DC_APP) down
	$(DC_NPM) down

restart:
	$(MAKE) down
	$(MAKE) up

logs:
	$(DC_APP) logs -f

reset:
	$(DC) down -v --remove-orphans

clean-volumes:
	@if docker volume ls -q | grep -q "^$(MONGO_VOLUME)$$"; then \
		docker volume rm -f "$(MONGO_VOLUME)"; \
		printf "Removed volume %s\n" "$(MONGO_VOLUME)"; \
	else \
		printf "Volume %s not present\n" "$(MONGO_VOLUME)"; \
	fi

deps: deps-frontend deps-backend

deps-frontend:
	@cd "$(FRONTEND_DIR)" && $(NPM) install

deps-backend:
	@cd "$(BACKEND_DIR)" && $(NPM) install

build: build-frontend

build-frontend: deps-frontend
	@cd "$(FRONTEND_DIR)" && $(NPM) run build

test: test-frontend test-backend

test-frontend: deps-frontend
	@cd "$(FRONTEND_DIR)" && $(NPX) vitest run

test-backend: deps-backend
	@cd "$(BACKEND_DIR)" && $(NPX) jest --runInBand --watchAll=false

lint: lint-frontend

lint-frontend: deps-frontend
	@cd "$(FRONTEND_DIR)" && $(NPM) run lint
