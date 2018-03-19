install:
	npm install

start:
	npm run babel-node -- 'src/bin/page-loader.js'

start-help:
	npm run babel-node -- src/bin/page-loader.js -h

start-version:
	npm run babel-node -- src/bin/page-loader.js -V

build:
	rm -rf dist
	npm run build

publish:
	npm publish

test:
	npm test

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint src/

list:
	npm list -g --depth=0

link:
	npm run build
	npm link
	npm list -g --depth=0

unlink:
	npm unlink
	npm list -g --depth=0
	sudo rm -rf dist

relink:
	npm unlink
	sudo rm -rf dist
	npm run build
	npm link

# install-global:
# 	npm list -g --depth=0
# 	npm install -g strelkov-pageloader
# 	npm list -g --depth=0

# uninstall-global:
# 	npm list -g --depth=0
# 	npm uninstall -g strelkov-pageloader
# 	npm list -g --depth=0

