import { readJSON, readdirSync, pathExists } from 'fs-extra';

import { INPMPackageDotJson } from './npm.type';
import { SHEETBASE_MODULE_FILE_NAME } from './npm.config';

export async function packageJson(): Promise<INPMPackageDotJson> {
    return await readJSON('package.json');
}

export async function getSheetbaseDependencies(): Promise<string[]> {
    let paths: string[] = [];
    // load peer and dev dependencies
    const { devDependencies, peerDependencies } = await packageJson();
    const ignoreDependencies: string[] = [... Object.keys(devDependencies || {}), ... Object.keys(peerDependencies || {})];
    const ignore = new RegExp('/' + ignoreDependencies.join('/|/') + '/', 'g');    
    // loop through all packages and test for sheetbase.module.ts
    const packages: string[] = readdirSync('node_modules', { encoding: 'utf8' });
    for (let i = 0; i < packages.length; i++) {
        const packageName = packages[i];
        const packagePath = 'node_modules/' + packageName;
        // org scope
        if (packageName.substr(0, 1) === '@') {
            const packages: string[] = readdirSync(packagePath, { encoding: 'utf8' });
            for (let j = 0; j < packages.length; j++) {
                const packageName = packages[j];
                const pathToFile = `${packagePath}/${packageName}/${SHEETBASE_MODULE_FILE_NAME}`;
                if (await pathExists(pathToFile) && !ignore.test(pathToFile)) {
                    paths.push(pathToFile);
                }
            }
        } else {
            const pathToFile = `${packagePath}/${SHEETBASE_MODULE_FILE_NAME}`;
            if (await pathExists(pathToFile) && !ignore.test(pathToFile)) {
                paths.push(pathToFile);
            }
        }
    }
    return paths;
}