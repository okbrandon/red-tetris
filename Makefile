SHELL := /bin/bash

PROJECT_NAME := $(notdir $(CURDIR))
HOST_NAME := $(shell hostname -s)
DC := docker compose
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

.PHONY: help env docker-up docker-down docker-restart docker-logs \
	docker-reset docker-clean-volumes deps deps-frontend deps-backend \
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
	@printf "  $(FG_MAGENTA)Docker lifecycle$(RESET)\n"
	@printf "    $(FG_CYAN)docker-build$(RESET)     Build Docker images via docker compose\n"
	@printf "    $(FG_CYAN)docker-up$(RESET)        Start the stack in the background\n"
	@printf "    $(FG_CYAN)docker-down$(RESET)      Stop containers but keep volumes\n"
	@printf "    $(FG_CYAN)docker-restart$(RESET)   Restart the stack cleanly\n"
	@printf "    $(FG_CYAN)docker-logs$(RESET)      Tail Docker logs from all services\n"
	@printf "    $(FG_CYAN)docker-reset$(RESET)     Stop containers and remove volumes\n"
	@printf "    $(FG_CYAN)docker-clean-volumes$(RESET) Remove the MongoDB Docker volume\n"

env:
	@if [ ! -f "$(ENV_FILE)" ] && [ -f "$(ENV_TEMPLATE)" ]; then \
		cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; \
		printf "Created %s from %s\n" "$(ENV_FILE)" "$(ENV_TEMPLATE)"; \
	elif [ ! -f "$(ENV_FILE)" ]; then \
		printf "Missing %s; supply one manually.\n" "$(ENV_FILE)"; \
	fi

	@if grep -q "HOST_NAME" "$(ENV_FILE)"; then \
		sed -i "s/HOST_NAME/$(HOST_NAME)/g" "$(ENV_FILE)"; \
		printf "Replaced HOST_NAME placeholder in %s with %s\n" "$(ENV_FILE)" "$(HOST_NAME)"; \
	fi

docker-build: env
	$(DC) build

docker-up: env
	$(DC) up -d --remove-orphans

docker-down:
	$(DC) down

docker-restart:
	$(MAKE) docker-down
	$(MAKE) docker-up

docker-logs:
	$(DC) logs -f

docker-reset:
	$(DC) down -v --remove-orphans

docker-clean-volumes:
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
