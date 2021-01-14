const { Telegraf , Markup} = require('telegraf')

const {getBaseVal, getMainMenu, getCurrentRate ,exchange, callbackQueryAction, getExchangeCurrency} = require('./helpers')

const {config} = require('./config')


if (config.TELEGRAM_TOKEN === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(config.TELEGRAM_TOKEN)

bot.start( ctx => {
    ctx.reply(`Welcome, ${ctx.chat.first_name}!`)
})

bot.command('nav', ctx => {
    ctx.reply('Navigation', getMainMenu())
})


let base = ''
let convert = ''
let input = 0

bot.on('callback_query', ctx =>{
    const action = ctx.update.callback_query.data

    callbackQueryAction(action, ctx) ?  base = action : convert = action
    // if( callbackQueryAction(action, ctx)){
    //     base = action
    //
    // }else {
    //     convert = action
    // }

    // if (action === "UAH") {
    //     base = action
    //     ctx.reply(`Базова валюта: ${t},\n оберіть валюту для конвертації`, getExchangeCurrency(action))
    // } else if (action === "USD") {
    //     base = action
    //
    //     ctx.reply(`Базова валюта: ${t},\n оберіть валюту для конвертації` , getExchangeCurrency(action))
    // } else if (action === "EUR") {
    //     base = action
    //
    //     ctx.reply(`Базова валюта: ${t},\n оберіть валюту для конвертації`, getExchangeCurrency(action))
    // }else if(action === 'toUAH'){
    //     convert = action
    //     ctx.reply('Введіть суму')
    //
    // }else if(action === 'toUSD'){
    //     convert = action
    //     ctx.reply('Введіть суму')
    //
    // }else if(action === 'toEUR'){
    //     convert = action
    //     ctx.reply('Введіть суму')
    //
    //
    // }
    ctx.answerCbQuery(action)
})

bot.hears('Виберіть основну валюту', ctx =>{
    ctx.reply("Перелік", getBaseVal())
})

bot.on('text', ctx =>{
    let reg = /^\d+$/

    if(reg.test(ctx.message.text)){
        // console.log("67->text:", +ctx.message.text)
        getCurrentRate(base, convert)
            .then(rate => {
                console.log('rate:', rate)

                const res = exchange(+ctx.message.text, +rate, base)

                ctx.reply(`Результат: ${parseFloat(res.toFixed(2))}`)

            })
        // console.log('yes')
    }else {
        console.log('no')
        ctx.reply('Введіть правильну суму')
    }
    // console.log(ctx.message.text)
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))