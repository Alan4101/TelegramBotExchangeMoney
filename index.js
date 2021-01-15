const { Telegraf } = require('telegraf')

const {getBaseVal, getMainMenu, getCurrentRate ,exchange, callbackQueryAction, getExchangeCurrency} = require('./helpers')

const {config} = require('./config')


if (config.TELEGRAM_TOKEN === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(config.TELEGRAM_TOKEN)

bot.start( ctx => {
    ctx.reply(`Привіт, ${ctx.chat.first_name}! Для того щоб розпочати виберіть команду /nav`)
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

    ctx.answerCbQuery(action)
})

bot.hears('Виберіть основну валюту', ctx =>{
    ctx.replyWithHTML("<i>Перелік</i>", getBaseVal())
})
function logger(msg, val){
    console.log(`${msg}`,val)
}
bot.on('text', ctx =>{
    let reg = /^\d+$/

    if(reg.test(ctx.message.text)){
        // console.log("67->text:", +ctx.message.text)
        getCurrentRate(base, convert)
            .then( rate => {
                const res = exchange(+ctx.message.text, rate, base, convert)
                logger('index onText, res:', res)

                // ctx.reply(`Результат: ${res}`)
                ctx.replyWithHTML(`
                        <b>${base} --> ${convert.slice(2)}</b> \n<i>Результат:</i> <b>${parseFloat(res.toFixed(2))} ${convert.slice(2)} </b> 
                    `)

            }).catch( err => {
                console.log(err)
            ctx.replyWithHTML(`<b><i>Упсс.. щось не так, спробуйте знову.</i></b>`, getBaseVal())
        })
        // console.log('yes')
    }else {
        // console.log('no')
        ctx.reply('Введіть правильну суму')
    }
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))