import program from 'commander';
import { version } from '../package.json';
import loadPage from './';
import buildErrorMsg from './errorBulder';


program
  .version(version)
  .description('This program takes URL to download web-page for local use')
  .option('-o, --output <dir>', 'Specify output directory')
  .arguments('<url>')
  .action((url) => {
    loadPage(url, program.output)
      .catch((err) => {
        console.error(buildErrorMsg(err));
        process.exit(1);
      });
  });


const launch = () => program.parse(process.argv);

export default launch;
