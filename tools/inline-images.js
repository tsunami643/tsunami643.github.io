var fs = require('fs');
var path = require('path');
var Datauri = require('datauri');

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
                var imagePath = path.join('../', matches[1]);

                var datauri = new Datauri(imagePath).content;

                var result = data.replace(
                    /<img class="portrait-img" width="256" height="144" src="(.*?)" (.*?)>/g,
                        '<img class="portrait-img" width="256" height="144" src="'+datauri+'" $2>'
                );

                if (!datauri) {
                    console.log(file  + ' - no data uri');
                } else {
                    console.log(file  + ' - ok');
                }

                fs.writeFile(path.join(tipsFolder, file), result, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }


                    console.log(file  + ' - written');
                });
            });
        }(file));
    }
});