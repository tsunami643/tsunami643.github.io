/*
    This is used to inline the hero profile images. If you'd like to change/update a
    profile image just change the data-uri to the path of the file you'd like to be
    in-lined and boom! It does it!
 */

var fs = require('fs');
var path = require('path');
var Datauri = require('datauri');
var chalk = require('chalk');

var tipsFolder = '../tips';

fs.readdir(path.join(tipsFolder), function (err, files) {
    if (err) {
        return;
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        (function(file) {
            fs.readFile(path.join(tipsFolder, file), 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }

                var regexp = /<img class="portrait-img" width="256" height="144" src="(.*?)"/g
                var matches = regexp.exec(data);

                if (!matches[1] || /data:image\/.*?base64/ig.test(matches[1])) {
                    console.log(chalk.yellow(file  + ' - skipping'));
                    return;
                }

                var imagePath = path.join('../', matches[1]);

                var datauri = new Datauri(imagePath).content;

                var result = data.replace(
                    /<img class="portrait-img" width="256" height="144" src="(.*?)" (.*?)>/g,
                        '<img class="portrait-img" width="256" height="144" src="'+datauri+'" $2>'
                );

                if (!datauri) {
                    console.log(chalk.yellow(file  + ' - no data uri'));
                }

                fs.writeFileSync(path.join(tipsFolder, file), result, 'utf8');

                console.log(chalk.green('✔ ' + file  + ' - inlined'));
            });
        }(file));
    }
});