const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx')) results.push(file);
  });
  return results;
}

const files = walk('src/app');

function cap(str) {
  return str + " ? String(" + str + ").charAt(0).toUpperCase() + String(" + str + ").slice(1) : ''";
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/(?<!=\s*|\w)\{([a-zA-Z0-9_\.]*subject)\}/g, (match, p1) => {
    return "{" + cap(p1) + "}";
  });

  content = content.replace(/\$\{classMeta\.subject\}/g, "${" + cap('classMeta.subject') + "}");
  content = content.replace(/\$\{c\.subject\} — Grade/g, "${" + cap('c.subject') + "} — Grade");
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Capitalized subjects in: ' + file);
  }
});
