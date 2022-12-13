'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const yaml = require('js-yaml');
const util = require('util');

const loadConfiguration = function(){
    const doc = yaml.load(fs.readFileSync('c:/temp/config.yaml', 'utf8'));
    return doc;
}

const init = async () => {

    let serverconfig = loadConfiguration();
    console.log(serverconfig);
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/configuration/load',
        handler: (request, h) => {
            try {
              const doc = loadConfiguration();
              console.log(doc);
              serverconfig = doc;
              return doc;
            } catch (e) {
              console.log(e);
            }
            return "Nothing loadedsdsadasdlkjadslk";
        }
    })
    server.route({
        method: 'GET',
        path: '/configuration/save',
        handler: (request, h) => {
            try {
                const doc = fs.writeFileSync('c:/temp/config.yaml', yaml.dump(serverconfig), {encoding:'utf8'});
                // console.log(doc);
                return 'saved';
              } catch (e) {
                console.log(e);
              }
              return 'File saved';
        }
    })
    server.route({
        method: 'POST',
        path: '/volume/add/{volume_path}',
        handler: (request, h) => {
            try {
                serverconfig.config.volumes.push(request.params.volume_path);
              } catch (e) {
                console.log(e);
              }
              return 'path added';
        }
    })
    server.route({
        method: 'GET',
        path: '/exports/generate',
        handler: (request, h) => {
            try {
                let servers = Object.keys(serverconfig.config.exports);
                servers.forEach(element => {
                    let export_string = util.format('%s\t%s(%s)', element, serverconfig.config.exports[element].hosts_allowed, serverconfig.config.exports[element].options);
                    console.log(export_string);
                });
              } catch (e) {
                console.log(e);
              }
              return 'path added';
        }
    })
    server.route({
        method: 'GET',
        path: '/mounts/generate',
        handler: (request, h) => {
            try {
                let mounts = Object.keys(serverconfig.config.volumes);
                mounts.forEach(element => {
                    let export_string = util.format('mount -t nfs -o fsc %s:%s %s', serverconfig.config.volumes[element].host,  serverconfig.config.volumes[element].path, element);
                    console.log(export_string);
                });
              } catch (e) {
                console.log(e);
              }
              return 'path added';
        }
    })

    await server.start();
    console.log('Server running on %s', server.info.uri);
};


process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();