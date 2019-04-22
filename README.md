# TypeScript Conversion Progress

![Image of CLI output of ts-conversion-progress library](https://i.imgur.com/1CGZETx.jpg)

`yarn add -D ts-conversion-progress`

Add a script to your package.json
```
"scripts": {
  "ts-conversion-progress": "node node_modules/ts-conversion-progress src/"
}
```

The only required argument, `src/` in the example, is the directory where your code is. It will recursively search that directory for js, jsx, ts, and tsx files and do the math...

Optionally you can add a second argument which can be a regex pattern to ignore files. For example
```
"scripts": {
  "ts-conversion-progress": "node node_modules/ts-conversion-progress src/ .+\.test.js$"
}
```

This will ignore all files that end with `.test.js`
