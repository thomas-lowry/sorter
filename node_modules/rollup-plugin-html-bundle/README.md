### rollup-plugin-html-bundle
##### Plugin for rollup that generates a html file from a template that either has the bundle included using a script-tag with src or inlined in a script-tag.

Will by default place a query string with v = Date.now() at the end of the path

Example use in `rollup.config.js`:
```
import htmlBundle from 'rollup-plugin-html-bundle';

export default {
    input: entry,
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        htmlBundle({
            template: 'src/template.html',
            target: 'dist/index.html'
        })
        // or just
        htmlBundle()
    ]
}
```

The default options are: 

```
template: 'src/template.html',
target: 'dist/index.html',
targetElement: 'body',
timestamp: true,
inline: false,
async: false,
defer: false
```

Example input template: 
```
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
</head>
<body>
</body>
</html>
```

Output for example input with default options:
```
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
</head>
<body>
<script  src="bundle.js?v=1534636516765"></script>
</body>
</html>
```

Tested on Node.js v. 10.8.0 and Rollup v. 0.62.0
