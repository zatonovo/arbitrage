PACKAGE ?= arbitrage
REPOSITORY ?= zatonovo/${PACKAGE}
VERSION ?= 1.0.0
IMAGE ?= $(REPOSITORY):$(VERSION)

.PHONY: all run test clean
all:
	$(shell echo '{\n  "name": "${PACKAGE}",\n  "version": "${VERSION}"\n}' > package.json)
	docker build -t ${IMAGE} .
	docker tag ${IMAGE} ${REPOSITORY}:latest

HOST_DIR = $(shell pwd)
MOUNT_HOSTDIR = -v ${HOST_DIR}:/app/${PACKAGE}

test:
	docker run --rm ${MOUNT_HOSTDIR} ${IMAGE} ava test/

bash:
	docker run -it --rm ${IMAGE} bash

remove:
	docker rmi ${REPOSITORY}
	docker rmi ${IMAGE}
