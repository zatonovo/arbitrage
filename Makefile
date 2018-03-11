REPOSITORY ?= zatonovo/arbitrage
VERSION ?= 1.0.0
IMAGE ?= $(REPOSITORY):$(VERSION)

.PHONY: all run test clean
all:
	docker build -t ${IMAGE} .
	docker tag ${IMAGE} ${REPOSITORY}:latest


test:
	docker run ${REPOSITORY}
