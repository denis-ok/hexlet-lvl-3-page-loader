import program from 'commander';
import loadPage from './';


program
  .version('0.0.1')
  .description('This program takes URL to download web-page for local use')
  .option('-o, --output <dir>', 'Specify output directory')
  .arguments('<url>')
  .action(url => loadPage(url, program.output));


const launch = () => program.parse(process.argv);

export default launch;
