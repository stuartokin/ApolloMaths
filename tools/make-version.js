// Writes version.json (read by the app to spot new versions) from js/data/help.js.
// Run from the repo folder:  node tools/make-version.js
const fs=require('fs'),vm=require('vm'),ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/../js/data/help.js','utf8')+';globalThis.__v={APP_VERSION,versionHistory}',ctx);
const {APP_VERSION,versionHistory}=ctx.__v;
const out={version:APP_VERSION,date:versionHistory[0].date,releases:versionHistory.slice(0,10).map(r=>({v:r.v,date:r.date,kids:r.kids||[],tags:r.tags||[],items:r.items}))};
fs.writeFileSync(__dirname+'/../version.json',JSON.stringify(out,null,1)+'\n');console.log('version.json ->',APP_VERSION);
