'use strict';

let fs = require('fs');
let path = require('path');

let config = null;

class HashBrown {
    /**
     * Inits the driver
     *
     * @param {Object} app Express.js app object
     */
    static init(app) {
        Controller.init(app);

        // Store app reference
        this.app = app;

	    // Helpers
    	this.content = ContentHelper;
    	this.media = MediaHelper;
        this.forms = FormsHelper;
        this.templates = TemplateHelper;

        console.log('[HashBrown] Driver initialised');
    }

    /**
     * Gets a dir path
     *
     * @param {String} folder
     *
     * @return {String} path
     */
    static getPath(folder = '') {
        return path.dirname(require.main.filename) + path.sep +'hashbrown'+ path.sep + folder;
    }
    
    /**
     * Gets a dir path from the project root
     *
     * @param {String} folder
     *
     * @return {String} path
     */
    static getRootPath(folder = '') {
        return path.dirname(require.main.filename) + path.sep + folder;
    }

    /**
     * Gets the config
     *
     * @returns {Object} Config
     */
    static getConfig() {
        if(!config) {
            let configPath = this.getPath('config.json'); 

            // Check for old config file
            let oldConfigPath = path.resolve(__dirname, 'config.json');

            // Old config file found. Adopt it and remove it.
            if(fs.existsSync(oldConfigPath)) {
                console.log('[HashBrown] Legacy config file found, replacing it.');

                var oldConfig = fs.readFileSync(oldConfigPath, 'UTF-8');

                fs.writeFileSync(configPath, oldConfig, 'UTF-8');
                fs.unlinkSync(oldConfigPath);
            }

            if(!fs.existsSync(configPath)) {
                fs.writeFileSync(configPath, '{}', 'UTF-8');
            }

            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
        }

        // Sanity check
        if(!config.paths) {
            config.paths = {
                pageTemplates: '',
                partialTemplates: ''
            };
        }

        return config;
    }

    /**
     * Ensures the required files and folders
     */
    static ensureLocations() {
        // JSON
        let jsonPath = this.getPath('storage' + path.sep + 'json');
        
        if(!fs.existsSync(jsonPath + path.sep + 'tree.json')) {
            if(!fs.existsSync(jsonPath)) {
                this.mkdirRecursively(jsonPath);
            }
            
            fs.writeFileSync(jsonPath + path.sep + 'tree.json', '{}');
        }
        
        // Media
        let mediaPath = this.getPath('storage' + path.sep + 'media');

        if(!fs.existsSync(mediaPath)) {
            this.mkdirRecursively(mediaPath);
        }
        
        // Config
        let configPath = this.getPath('config.json');
        
        if(!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '{ "token": "", "remote": "" }');
        }
    }
   
    /**
     * Removes directory recursively
     */
    static rmdirRecursively(dirPath) {
        if(!fs.existsSync(dirPath)) { return; }

        fs.readdirSync(dirPath).forEach((file,index) => {
            var filePath = dirPath + path.sep + file;
            
            // Recurse if file is directory
            if(fs.lstatSync(filePath).isDirectory()) {
                deleteFolderRecursive(filePath);

            // Delete file
            } else {
                fs.unlinkSync(filePath);
            
            }
        });
    
        fs.rmdirSync(dirPath);
    }

    /**
     * Makes a directory recursively
     *
     * @param {String} dirPath
     */
    static mkdirRecursively(dirPath) {
        let parents = dirPath.split(path.sep);
        let finalPath = path.sep;

        for(let i in parents) {

            if(parents[i].indexOf(':')>=0)
                continue;

            finalPath += parents[i];

            if(!fs.existsSync(finalPath)) {
                fs.mkdirSync(finalPath);
            }

            if(i < parents.length - 1) {
                finalPath += path.sep;
            }
        }
    }
}

HashBrown.ensureLocations();

module.exports = HashBrown;

let Controller = require('./Controller');
let ContentHelper = require('./ContentHelper');
let MediaHelper = require('./MediaHelper');
let FormsHelper = require('./FormsHelper');
let TemplateHelper = require('./TemplateHelper');
