import parseConfig from "../dist/index";

logTest('basic example', 'basic_example.cfg', 'testing')
logTest('types example', 'types_example.cfg', 'testing')
logTest('mooncord example', 'mooncord_example.cfg', 'testing')
logTest('include example', 'include_example.cfg', 'testing')

function logTest(name, filename, filepath) {
    console.log('=================================')
    console.log(`test: ${name}`)
    console.log(`filename: ${filename}`)
    console.log(`filepath: ${filepath}`)
    console.log(`fullpath: ${filepath}/${filename}`)
    console.log('')
    console.log('result:')
    console.log(JSON.stringify(parseConfig(filepath, filename), null, 2))
    console.log('')
}