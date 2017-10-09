
db:
	@dropdb --if-exists nifty
	@createdb nifty

build-example:
	@tsc examples/main.ts --lib ES2015

run-example:
	@PGDATABASE=nifty node examples/main.js