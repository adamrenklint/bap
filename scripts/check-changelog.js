var fs = require('fs');
var path = require('path');
var pkg = require(path.join(process.cwd(), '/package.json'));
var changelog = fs.readFileSync(path.join(process.cwd(), '/changelog.md')).toString();
var signature = pkg.version + ' "' + pkg.versionName + '"';
changelog.match(pkg.version);

var header = null;

function matchVersionLine (version, name) {
  var re = new RegExp('\\s' + version + '\\s"' + name + '"\\s(\.)+\n');
  var match = changelog.match(re);
  return match && match[0] || '';
}

function findVersionLine () {
  var versionParts = pkg.version.split('.');
  var versionLine = null;
  while (versionParts.length) {
    versionLine = matchVersionLine(versionParts.join('.'), pkg.versionName);
    if (!versionLine && versionParts[versionParts.length - 1] === '0') {
      versionParts.pop()
    }
    else {
      versionParts = [];
    }
  }
  return versionLine;
}

function containsTodaysDate (versionLine) {
  var now = new Date();
  var month = now.getMonth();
  var date = now.getDate();
  month = month < 10 ? '0' + month : month;
  date = date < 10 ? '0' + date : date;
  var date = [now.getFullYear(), month, date].join('-');
  console.log(versionLine.indexOf(date));
  // return !!~versionLine.indexOf()
}

var versionLine = findVersionLine();

if (!versionLine) {
  console.error('Could not find header for version: ' + signature);
  process.exit(1);
}

if (!containsTodaysDate(versionLine)) {
  console.error('Could not find release date (today) in version header: ' + versionLine);
  process.exit(1);
}

console.log(versionLine)
