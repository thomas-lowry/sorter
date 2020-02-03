'use strict';
import fs from 'fs';
import path from 'path';

/**
 * Generates a html file from a template that either has the bundle included using a script-tag with src or inlined in a script-tag.
 * Will by default use a script-tag with src and place a query string with v = Date.now() at the end of the path, to avoid using a cached bundle.js in dev.
 * @param {Object} userOptions The options object.
 * @return {Object} The rollup code object.
 */
export default function bundle(userOptions = {}) {
    const options = {
        template: 'src/template.html',
        target: 'dist/index.html',
        targetElement: 'body',
        timestamp: true,
        inline: false,
        async: false,
        defer: false
    };
    Object.assign(options, userOptions);
    return {
        name: 'html-bundle',
        generateBundle: (outputOptions, bundle, isWrite) => {
            return new Promise((accept, reject) => {
                if (!isWrite) return accept();
                let attr = '', inject = '';
                if (options.async) attr += ' async';
                if (options.defer) attr += ' defer';

                fs.readFile(path.resolve(options.template), 'utf8', (err, templateContent) => {
                    if (err) return reject(err);

                    const targetIndex = templateContent.lastIndexOf(`</${options.targetElement}>`);
                    if (targetIndex === -1)
                        return reject("invalid targetElement");

                    Object.values(bundle).forEach(module => {
                        if (err) {
                            reject(err);
                            throw err;
                        }

                        if (options.inline) {
                            inject += `<script${attr}>\n${module.code}</script>\n`;
                        }

                        else {
                            const src = path.basename(module.fileName) + (options.timestamp ? ("?v=" + (Date.now())) : '');
                            inject += `<script${attr} src="${src}"></script>\n`;
                        }
                    });

                    const bundledContent = templateContent.substr(0, targetIndex) + inject + templateContent.substr(targetIndex);
                    fs.writeFile(path.resolve(options.target), bundledContent, err => err ? reject(err) : accept());
                });
            })
        },
    };
}