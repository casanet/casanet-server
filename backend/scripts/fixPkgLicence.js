import path from 'path';
import fse from 'fs-extra';

const fixModulesLicenceSection = async modulesPath => {
  try {
    const nodeModulesDirs = await fse.promises.readdir(modulesPath);

    const dirs = [...nodeModulesDirs];
    for (const dir of dirs) {
      try {
        const packagePath = path.join(modulesPath, dir, 'package.json');
        const packageManifest = await fse.readJSON(packagePath);
        if (packageManifest.license) {
          continue;
        }
        packageManifest.license = 'ISC';
        fse.writeJSON(packagePath, packageManifest);
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
