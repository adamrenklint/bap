MOCHA = ./node_modules/mocha/bin/mocha
_MOCHA = ./node_modules/mocha/bin/_mocha
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
COVERAGE_LIMIT = 75

setup:
	@npm install

start-example:
	@make serve-example & make watch-example

serve-example:
	@node node_modules/3w/3w.js examples --3000

watch-example:
	@node_modules/watchify/bin/cmd.js examples/metronome/main.js -o examples/metronome/bundle.js -v

build-example:
	@node_modules/browserify/bin/cmd.js examples/metronome/main.js -o example/bundle.js

test:
	@$(MOCHA) -s 10

watch:
	@$(MOCHA) -w -s 10

coverage:
	@$(ISTANBUL) cover $(_MOCHA) -- test/*.test.js -R dot

check-coverage: coverage
	@$(ISTANBUL) check-coverage --statement $(COVERAGE_LIMIT) --branch $(COVERAGE_LIMIT) --function $(COVERAGE_LIMIT)

report-coverage:
	@CODECLIMATE_REPO_TOKEN=$(CC_REPO_TOKEN) $(CC_REPORTER) < coverage/lcov.info

lint:
	@$(JSHINT) lib/*.js

.PHONY: test coverage
