# Build a JavaScript-Dependency Stucture Matrix

Run `gulp` with env `TARGET` pointing to the directory containing your src files.

What it does
 
* convert all `*.js` (with babel), `*.coffee`, `*.pug` `*.styl` files to plain javascript
* parse them with `esprima`
* takes all relative (and static) `require` calls
* records a dependency graph of all the files (`build/dependencies.json`)
* detects and prints out all cyclic dependencies
* Generates `build/index.html` with a (topologically sorted) DSM of the top 2 directory levels

You can customize the search pattern for the files via env variables named after default suffixes, i.e.
set `js=lib/**/*.js:lib/**/*.jsx` or `pug=**/*.jade` 
