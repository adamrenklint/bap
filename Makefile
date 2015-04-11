MOCHA = ./node_modules/mocha/bin/mocha
_MOCHA = ./node_modules/mocha/bin/_mocha
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
COVERAGE_LIMIT = 75

start-example:
	@make serve-example & make watch-example

serve-example:
	@node node_modules/3w/3w.js examples --3000

watch-example:
	@node_modules/watchify/bin/cmd.js examples/metronome/main.js -o examples/metronome/bundle.js -v

build-example:
	@node_modules/browserify/bin/cmd.js examples/metronome/main.js -o example/bundle.js

report-coverage:
	@CODECLIMATE_REPO_TOKEN=$(CC_REPO_TOKEN) $(CC_REPORTER) < coverage/lcov.info
