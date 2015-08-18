/*
    This file was used to split tips.html into separate hero files. It's a one-use
    thing so it's quite agricultural. I imported it into vcs so people could see how
    it was done.
 */

var fs = require('fs');
var path = require('path');
var linereader = require('line-reader');

var exp = {
    start: /<div id="\d+">/i,
    regexpHero: /<span id=name>(.*?)<\/span>/i,
    nbsp: /&nbsp;/ig,
    space: /\s/ig,
    lipli: /<\/li><\/p><li>/ig,
    lipul: /<\/li><\/p><\/ul>/ig,
    herotitle: /id=herotitle/ig,
    portrait: /id=portrait/ig,
    regexpName: /id=name/ig,
    tips: /id="tips"/ig,
    portraitimg: /id=portrait><img /ig,
    divhero: /<div id="\d+">/ig,
    lip: /<li><p>/ig,
    pli: /<\/p><\/li>/ig
};

function cleanup(text, hero) {
    return text
        .replace(exp.lipli, '</p></li><li>')
        .replace(exp.lipul, '</p></li></ul>')
        .replace(exp.lip, '<li>')
        .replace(exp.pli, '</li>')
        .replace(exp.divhero, '<div class="hero hero-' + hero.toLowerCase().replace(exp.space, '-') + '">')
        .replace(exp.portraitimg, 'id=portrait><img class="portrait-img" ')
        .replace(exp.herotitle, 'class="herotitle"')
        .replace(exp.portrait, 'class="portrait"')
        .replace(exp.name, 'class="name"')
        .replace(exp.tips, 'class="tips"')
}

var originalTipsFile = path.join(__dirname, '../herotips_files/tips.html');

var heroes = {};
var hero;

console.log(originalTipsFile);

linereader.eachLine(originalTipsFile, function (line, last) {
    if (exp.start.test(line)) {
        hero = exp.regexpHero.exec(line)[1].replace(exp.nbsp, ' ');
        heroes[hero] = [];
    }

    if (hero) {
        heroes[hero].push(cleanup(line, hero));
    }

    return !last;
}).then(function () {
    var write;

    for (var h in heroes) {
        if (heroes.hasOwnProperty(h)) {
            var filename = h.toLowerCase().replace(exp.space, '_') + '.html';
            write = fs.createWriteStream(path.join(__dirname, '../tips/', filename), { encoding: 'utf8' });
            write.write(heroes[h].join(''));
            write.end((function (filename) {
                console.log(path.join(__dirname, '../tips/', filename));
            }(filename)));
        }
    }
});

