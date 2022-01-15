const axios = require('axios')
const chalk = require('chalk')
const { Command } = require('commander')

const program = new Command();
program.version('1.0.0');

const main = async () => {
  try {
    let language = 'en'
    const isWordValid = (word) => {
      if(word !== undefined){
        let englishPattern = new RegExp("[A-Za-z]+")
        let chiniesePattern = new RegExp("[\\u4E00-\\u9FFF]+")
        if (englishPattern.test(word)) {
          language = 'en'
          return word
        } 
        if(chiniesePattern.test(word)){
          language = 'cn'
          return word
        }
        throw new Error('Invalid Word')
      }else{
        throw new Error('Invalid Word')
      }
    }
    program.argument('<word>', 'which word do you want to search', isWordValid)
    program.action(async (word) => {
      word = word.trim()

      // Fetch
      let url = '';
      let results = []
      if(language === 'en'){
        url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      }
      if(language === 'cn'){
        let key = ''
        url = `http://api.tianapi.com/xhzd/index?key=${key}&word=${encodeURIComponent(word)}`
      }
      let response = await axios.get(url)
      if (Number(response.status) === 200) {
        results = response.data
      }

      // Display
      if(language === 'en'){
        for (let result of results) {
          // Word Title With Border
          const displayWord = (word, color)=>{
            const starline = (length)=>{
              for(let i = 0; i < length; i++){
                process.stdout.write(color('*'))
              }
              process.stdout.write('\r\n')
            }
            const wordline = (word, length) => {
              process.stdout.write(color('*'))
              let space = ((length - 2 - word.length) / 2) - 1
              for(let i = 0; i <= space; i++){
                process.stdout.write(' ')
              }
              process.stdout.write(color(word))
              for(let i = 0; i <= space; i++){
                process.stdout.write(' ')
              }              
              process.stdout.write(color('*'))
              process.stdout.write('\r\n')
            }
            console.log()
            starline(word.length * 7)
            wordline(word, result.word.length * 7)
            starline(word.length * 7)
          }
          displayWord(result.word, chalk.green.bold)
  
          // Origin
          if (result.origin) {
            let origin = result.origin
            console.log(chalk.green.bold('ORIGIN: ') + chalk.bold(origin))
          }else{
            console.log(chalk.grey.bold('No origin infomation'))
          }
  
          // Meaning
          if (result.meanings.length > 0) {
            let index = 1;
  
            // Meaning Block
            for (let meaning of result.meanings) {
              console.log()
              console.log(chalk.green.bold(`[ ${index} ]`))
              console.log(`${chalk.green.bold('PART OF SPEECH:')} ${chalk.bold(meaning.partOfSpeech)}`)
              for (let definition of meaning.definitions) {
                console.log()
  
                // Definition
                if (definition.definition) {
                  let definitionSentence = definition.definition
                  console.log(`${chalk.green.bold('DEFINITION:')} ${chalk.bold(definitionSentence)}`)
                }
  
                // Example
                if (definition.example) {
                  let example = definition.example
                  console.log(`${chalk.green.bold('EXAMPLE:')} ${chalk.bold(example)}`)
                }
  
                // Synonym
                if (definition.synonyms.length > 0) {
                  let synonyms = []
                  if (definition.synonyms.length > 6) {
                    synonyms = definition.synonyms.slice(0, 5)
                  } else {
                    synonyms = definition.synonyms
                  }
                  process.stdout.write(chalk.green.bold('SYNONYMS: '))
                  for (let synonym of synonyms) {
                    process.stdout.write(chalk.bold(`[${synonym}]  `))
                  }
                  process.stdout.write('\r\n')
                }
  
                // Antonyms
                if (definition.antonyms.length > 0) {
                  let antonyms = []
                  if (definition.antonyms.length > 6) {
                    antonyms = definition.antonyms.slice(0, 5)
                  } else {
                    antonyms = definition.antonyms
                  }
                  process.stdout.write(chalk.green.bold('ANTONYMS: '))
                  for (let antonym of antonyms) {
                    process.stdout.write(chalk.bold(`[${antonym}]  `))
                  }
                  process.stdout.write('\r\n')
                }
              }
              index++
            }
          }
        }
      }
      if(language === 'cn'){
        if(results.newslist.length > 0){
          let newslist = results.newslist
          for(let entry of newslist){
            console.log(`${chalk.green.bold('拼音:')} ${chalk.bold(entry.py)}`)
            console.log(`${chalk.green.bold('笔画:')} ${chalk.bold(entry.bihua)}`)
            let content = entry.content.split('<br>')
            console.log(chalk.green.bold(`解释:`))
            for(let item of content){
              console.log(chalk.bold(item))
            }
          }
        }
      }
      console.log()
    })
    await program.parseAsync(process.argv)
  } catch (error) {
    console.error(chalk.red.bold(error.message))
    //console.dir(error)
  }
}

main()