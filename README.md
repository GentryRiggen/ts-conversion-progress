# TypeScript Conversion Progress

`yarn add -D ts-conversion-progress`

*Because no one uses npm still, right?*

Add a script to your package.json
```
"scripts": {
  "ts-conversion-progress": "node ts-conversion-progress src/"
}
```

The only argument, `src/` in the example, is the directory where your code is. It will recursively search that directory for js, jsx, ts, and tsx files and do the math...
