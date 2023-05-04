develop:
	npx webpack serve

install:
	npm install

lint:
	npx eslint .

build:
	NODE_ENV=production npx webpack
