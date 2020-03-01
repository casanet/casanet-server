const fse = require('fs-extra');
const path = require('path');

const fixModulesLicenceSection = async modulesPath => {
  try {
    const nodeModulesDirs = await fse.promises.readdir(modulesPath);

    const dirs = [...nodeModulesDirs];
    for (const dir of dirs) {
      try {
        const packagePath = path.join(modulesPath, dir, 'package.json');
        const package = await fse.readJSON(packagePath);
        if (package.license) {
          continue;
        }
        package.license = 'ISC';
        fse.writeJSON(packagePath, package);
        console.log(`package '${packagePath}' fixed`);
      } catch (error) {}
    }
  } catch (error) {}
};

const fixProjectModules = async () => {
  await fixModulesLicenceSection('node_modules');
  await fixModulesLicenceSection(path.join('node_modules', 'npm', 'node_modules'));
};

fixProjectModules();
