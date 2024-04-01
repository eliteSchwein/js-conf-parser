"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
/**
 * This module implements a conf file parser.
 * @packageDocumentation
 * @module ja-conf-parser
 */
/**
 * @public
 * @param path Path to the config file
 * @param filename Name of the config file
 */
function parseConfig(path, filename) {
    if (!(0, fs_1.existsSync)(`${path}/${filename}`)) {
        throw new Error(`File ${path}/${filename} doesnt exist`);
    }
    let file = (0, fs_1.readFileSync)(`${path}/${filename}`, { encoding: "utf-8" });
    file = file.replace(/#.*/g, '');
    const lines = file.replace(/\r/g, '').split('\n');
    let result = {};
    let objects = {};
    let tempKey = undefined;
    for (const line of lines) {
        if (/^\[include\s(.*\.cfg)\]$/g.test(line)) {
            const subFile = line.split(' ')[1].replace(']', '');
            const subData = this.parseConfig(path, subFile);
            mergeDeep(result, subData);
            continue;
        }
        const webcamHeader = line.match(/^\[webcam.*\]$/g);
        if (webcamHeader) {
            const name = webcamHeader[0].replace(/\[|\]/g, '').split(' ');
            if (name.length < 2) {
                name[1] = 'default';
            }
            if (result[name[0]] === undefined) {
                result[name[0]] = {};
            }
            objects = {};
            result[name[0]][name[1]] = objects;
            continue;
        }
        const header = line.match(/^\[([^\]]+)\]$/);
        if (header) {
            if (objects[tempKey] !== undefined && objects[tempKey].length === 0) {
                objects[tempKey] = undefined;
            }
            tempKey = undefined;
            const name = header[1];
            objects = {};
            result[name] = objects;
            continue;
        }
        const value = line.match(/^([^;][^:]*):(.*)$/);
        if (value) {
            const key = value[1].trim();
            if (value[2].trim() === '') {
                tempKey = value[1];
                objects[value[1]] = [];
                continue;
            }
            let realValue = parseValue(value[2].trim());
            if (key.match(/[0-9]+_/g)) {
                const index = Number(key.match(/[0-9]+/g)) - 1;
                const objectRawKey = key.replace(/[0-9]+/g, '');
                const objectKeys = objectRawKey.split('_');
                const objectKey = objectKeys[0];
                const objectKeyValue = objectKeys[1];
                if (objects[objectKey] === undefined) {
                    objects[objectKey] = [];
                }
                if (objects[objectKeys[0]][index] === undefined) {
                    objects[objectKeys[0]].push({ [objectKeyValue]: realValue });
                }
                else {
                    objects[objectKeys[0]][index][objectKeyValue] = realValue;
                }
                continue;
            }
            if (key.startsWith('- {') && objects[tempKey] !== undefined) {
                realValue = parseValue(`${key}:${value[2].trim()}`);
                objects[tempKey].push(realValue);
                continue;
            }
            if (key.startsWith('- ') && objects[tempKey] !== undefined) {
                objects[tempKey].push({ key: key.substring(2), value: realValue });
                continue;
            }
            if (objects[tempKey] !== undefined && objects[tempKey].length === 0) {
                objects[tempKey] = undefined;
            }
            tempKey = undefined;
            objects[value[1]] = realValue;
            continue;
        }
        if (tempKey !== undefined && objects[tempKey] !== undefined) {
            const currentLine = parseValue(line.trim());
            if (currentLine === undefined || currentLine.length === 0) {
                continue;
            }
            objects[tempKey].push(currentLine);
        }
        if (objects[tempKey] !== undefined && objects[tempKey].length === 0) {
            objects[tempKey] = undefined;
        }
    }
    return result;
}
exports.default = parseConfig;
function mergeDeep(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
function parseValue(value) {
    let realValue = value;
    if (realValue === '') {
        return undefined;
    }
    if (realValue.startsWith('- ')) {
        realValue = realValue.substring(2);
    }
    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
        realValue = numberValue;
    }
    if (realValue === 'true') {
        realValue = true;
    }
    if (realValue === 'false') {
        realValue = false;
    }
    if (typeof realValue === 'string' && realValue.match(/^\{.*\}/g)) {
        realValue = JSON.parse(realValue);
    }
    if (typeof realValue === 'string') {
        realValue = realValue.replace(/\'/g, '');
    }
    return realValue;
}
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
