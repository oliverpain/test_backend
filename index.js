'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const yaml = require('js-yaml');
const util = require('util');
const { exec } = require('child_process');
const  mongo = require('mongodb');
const url = "mongodb://127.0.0.1:27017/";
var cors = require('cors');

const loadConfiguration = function(){
    const doc = yaml.load(fs.readFileSync('c:/temp/config.yaml', 'utf8'));
    return doc;
}

const init = async () => {

    var serverconfig = loadConfiguration();

    console.log(serverconfig);
    const server = Hapi.server({
        port: 3000,
        host: '127.0.0.1',
        routes: {
            cors: {
                "origin": ["*"],
            },
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            let result = exec('dir', (error, stdout, stderr) => {
                if (error) {
                  console.error(`error: ${error.message}`);
                  return;
                }
              
                if (stderr) {
                  console.error(`stderr: ${stderr}`);
                  return;
                }
              
                console.log(`stdout:\n${stdout}`);
              });        
              return result;
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
        method: 'GET',
        path: '/configuration/dbSave',
        handler: (request, h) => {
                try {
                    const monClient = new mongo.MongoClient(url);
                    var dbo = monClient.db("cacheServer");
                        dbo.collection("configs").findOneAndUpdate(
                            {"name": "config"},
                            {$set:{"config":serverconfig.config}},
                            {upsert: true}
                           ).then(function(err, value) {

                                    if (err) throw err;
                                    console.log("1 document inserted", value);
                                    //monClient.close();
                               });
                        // dbo.collection("configs").insertOne(config, (err, monClient) => {
                        //     if (err) throw err;
                        //     console.log("1 document inserted");
                        //     //monClient.close();
                        // });
                
              } catch (e) {
                console.log(e);
              }
              return 'File saved';
            }
    }),
    server.route({
        method: 'GET',
        path: '/volumes/get',
        handler: (request, h) => {
            try {
                return(JSON.stringify(serverconfig.config.volumes));
              } catch (e) {
                console.log(e);
              }
              return 'path added';
        }
    })
    server.route({
        method: 'GET',
        path: '/exports/get',
        handler: (request, h) => {
            try {
                return(JSON.stringify(serverconfig.config.exports));
              } catch (e) {
                console.log(e);
              }
              return 'get exports';
        }
    })
    server.route({
        method: 'POST',
        path: '/export',
        handler: (request, h) => {
            try {
                console.log(request.payload);
                console.log(typeof serverconfig.config.volumes);
                Object.entries(request.payload).forEach(entry => {
                    const [key, value] = entry;
                    serverconfig.config.exports[key] = value;
                    console.log(key, value);
                  });
                // Object.forEach(request.payload){

                // }
                // serverconfig.config.volumes.push(request.payload);
              } catch (e) {
                console.log(e);
              }
              return 'path added';
        }
    })
    server.route({
        method: 'POST',
        path: '/volume',
        handler: (request, h) => {
            try {
                console.log(request.payload);
                console.log("data^^")
                Object.entries(request.payload).forEach(entry => {
                    const [key, value] = entry;
                    serverconfig.config.volumes[key] = value;
                    console.log(key, value);
                  });
                // Object.forEach(request.payload){

                // }
                // serverconfig.config.volumes.push(request.payload);
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