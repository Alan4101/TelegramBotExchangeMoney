const{ Markup } = require('telegraf')
const axios = require('axios')

let dataCurrency = null

exports.getMainMenu = () => {
    return Markup.keyboard([
        [{ text: 'Виберіть основну валюту', callback_data: 'base_m' }],
        [{ text: 'Clear', callback_data: 'clear_all' }]
    ]).resize(true)
}
exports.getBaseVal = () =>{
    return Markup.inlineKeyboard([
        [{ text: '🇺🇦 UAH', callback_data: 'UAH' }],
        [{ text: '🇺🇸 USD', callback_data: 'USD'}],
        [{ text: '🇪🇺 EUR', callback_data: 'EUR'}],
    ]).resize()
}
// exports.getExchangeCurrency = val => {
const getExchangeCurrency = val => {
    const arr = [
        [{ text: '🇺🇦 UAH', callback_data: 'toUAH' }],
        [{ text: '🇺🇸 USD', callback_data: 'toUSD'}],
        [{ text: '🇪🇺 EUR', callback_data: 'toEUR'}],
    ]
    let s = arr.filter( i => i[0].text.slice(5) !== val)

    return Markup.inlineKeyboard(s)
}

exports.callbackQueryAction = (action, context) => {
    const baseArrCurrency = ['UAH', 'USD', 'EUR']
    const convertArrCurrency = ['toUAH', 'toUSD', 'toEUR']

    for(let i = 0; i<baseArrCurrency.length; i++){
        if(baseArrCurrency[i] === action){
            context.replyWithHTML(`<i>Базова валюта: </i><b>${action}</b> ,\n<i>Оберіть валюту для конвертації</i>`, getExchangeCurrency(action))
            return true
        }else if(convertArrCurrency[i] === action){
            context.replyWithHTML(`<i>Конвертація в</i> <b>${action.slice(2)}</b> \n<i>Введіть суму:</i>`)
            // context.reply()
            return false
        }
    }
}

function logger(msg, val){
    console.log(`${msg}`,val)
}
(function (){
    axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5').then( s =>{
        dataCurrency = [...s.data]
    })
})()
 exports.getCurrentRate =  async (base, convertC) => {
    let resultRate = 0
    try{
        const dataCurrencies = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
        // dataCurrency = [ ...dataCurrencies]
        // console.log(dataCurrency)
        if(convertC.slice(2) === 'UAH'){
             dataCurrencies.data.map( i => {
                 if(i.ccy === base) resultRate = +i.buy
             })
         }else if(base === 'UAH') {
             dataCurrencies.data.map( i => {
                 if(i.ccy === convertC.slice(2)) resultRate = +i.sale
             })
         }else {
            dataCurrencies.data.map( i => {
                if(i.ccy === convertC.slice(2)) resultRate = +i.buy
            })
        }
         return resultRate
    }catch (error){
        throw new Error(error)
    }
}

// rate -> USD.sale , EUR.sale
// rate -> usd.buy, eur.buy
function USDorEURtoUAH(x, rate){
    return x*rate
}
// rate buy
function USDtoEURorEURtoUSD(x,from, to ){
    let f_rate = 0
    let t_rate = 0
    dataCurrency.map( i => {
        if(i.ccy === to) t_rate = +i.buy
        if(i.ccy === from) f_rate = +i.buy
    })

    return ((f_rate/t_rate)*x)-0.0500
}

exports.exchange = (input, rate, baseCurrency, c) =>{
    let con = c.slice(2)
    // console.log(baseCurrency, con )

    if(baseCurrency === 'UAH'){
        // console.log('u->d')
        //
        return input/rate
    }else if((baseCurrency === 'USD' || baseCurrency === 'EUR') && con === 'UAH'){
        console.log('e->u')

        return USDorEURtoUAH(input,rate)

    }else if((baseCurrency === 'EUR' || baseCurrency === 'USD') && (con === 'USD' || con === 'EUR')){
        console.log('e->d')
        return USDtoEURorEURtoUSD(input, baseCurrency, con)

    }
}