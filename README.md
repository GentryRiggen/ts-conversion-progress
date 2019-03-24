# TypeScript Conversion Progress

![Image of CLI output of ts-conversion-progress library](https://i.imgur.com/1CGZETx.jpg)

`yarn add -D ts-conversion-progress`

Add a script to your package.json
```
"scripts": {
  "ts-conversion-progress": "node node_modules/ts-conversion-progress src/"
}
```

The only argument, `src/` in the example, is the directory where your code is. It will recursively search that directory for js, jsx, ts, and tsx files and do the math...
