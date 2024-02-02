import { promises as fsPromises } from 'fs';

import { logger } from './logger';

export interface ChangeLogEntry {
    date: string;
    add: string[];
    delete: string[];
    update: string[];
    count: number;
    raw: string;
    //LATER: url: string;
}

/**
 * loads a list of files (yyyy-mm-dd.ext) from a directory and provides methods to access them
 */
export class ChangeLog {
    cache: { [key: string]: ChangeLogEntry };
    firstKey: string;
    lastKey: string;

    constructor(dir: string) {
        this.init(dir);
    }

    async init(dir: string) {
        this.cache = {};

        try {
            const files = await fsPromises.readdir(dir);

            files.sort().reverse();


            for (const filename of files) {
                const filePath = `${dir}/${filename}`;
                const fileContent = await fsPromises.readFile(filePath, 'utf-8');
                const key = filename.replace(/\.[a-z]*/, '');
                this.cache[key] = this.parse(key, fileContent);
                if (this.firstKey === undefined) {
                    this.firstKey = key;
                }
                this.lastKey = key;
            };
        } catch (err) {
            logger.error({ err, dir }, 'Error reading ChangeLog directory');
        }
        logger.info({ count: this.cache.size, dir }, 'Files loaded into ChangeLog');
    }

    getAll() {
        return this.cache; 
    }

    get(key: string) {
        return this.cache[key];
    }

    getFirst() {
        return this.cache[this.firstKey];
    }

    getLast() {
        return this.cache[this.lastKey];
    }   

    getKeys() {
        return Object.keys(this.cache);
    }

    getNext(key:string) {
        const keys = this.getKeys();
        const index = keys.indexOf(key);
        if (index === -1) {
            return null;
        }
        return this.cache[keys[index + 1]];
    }

    getPrevious(key:string) {
        const keys = this.getKeys();
        const index = keys.indexOf(key);
        if (index === -1) {
            return null;
        }
        return this.cache[keys[index - 1]];
    }

    parse(key: string, data: string): ChangeLogEntry {
        const lines = data.split('\n');
        const date = key;

        const retVal:ChangeLogEntry = {
            date,
            add: [],
            delete: [],
            update: [],
            count: 0,
            raw: data,
        };

        for (const line of lines) {
            if (line.startsWith('+')) {
                retVal.add.push(line.slice(1));
            } else if (line.startsWith('-')) {
                retVal.delete.push(line.slice(1));
            } else if (line.startsWith('*')) {
                retVal.update.push(line.slice(1));
            }
        }
        retVal.count = retVal.add.length + retVal.delete.length + retVal.update.length;
        return retVal;
    }

}