const{ Markup } = require('telegraf')
const axios = require('axios')

let dataCurrency = []

exports.getMainMenu = () => {
    return Markup.keyboard([
        [{ text: 'Виберіть основну валюту', callback_data: 'base_m' }],
        [{ text: 'Clear', callback_data: 'clear_all' }]
    ]).resize()
}
exports.getBaseVal = () =>{
    return Markup.inlineKeyboard([
        [{ text: 'UAH', callback_data: 'UAH' }],
        [{ text: 'USD', callback_data: 'USD'}],
        [{ text: 'EUR', callback_data: 'EUR'}],
    ])
}
// exports.getExchangeCurrency = val => {
const getExchangeCurrency = val => {
    const arr = [
        [{ text: 'UAH', callback_data: 'toUAH' }],
        [{ text: 'USD', callback_data: 'toUSD'}],
        [{ text: 'EUR', callback_data: 'toEUR'}],
    ]
    let s = arr.filter( i => i[0].text !== val)

    return Markup.inlineKeyboard(s)
}
exports.callbackQueryAction = (action, context) => {
    const baseArrCurrency = ['UAH', 'USD', 'EUR']
    const convertArrCurrency = ['toUAH', 'toUSD', 'toEUR']

    for(let i = 0; i<baseArrCurrency.length; i++){
        if(baseArrCurrency[i] === action){
            context.reply(`Базова валюта: ${action},\nОберіть валюту для конвертації`, getExchangeCurrency(action))
            return true
        }else if(convertArrCurrency[i] === action){
            context.reply('Введіть суму:')
            return false
        }
    }
}
 exports.getCurrentRate =  async (base, convertC) => {
     let convert = convertC.slice(2) === 'UAH' ? base : convertC.slice(2)
    // let convert = ''
    // console.log(base, convertC)
    //  if(convertC.slice(2) === "UAH"){
    //      convert = base
    //  }else {
    //      convert = convertC.slice(2)
    //  }
     console.log("convert", convert)

     try{
        const dataCurrencies = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')

        let currentRate = null
        dataCurrencies.data.map( i => i.ccy === convert ? currentRate = i.buy: null )

         return +currentRate

    }catch (error){
        throw new Error(error)
    }
}
function EURtoUSD(rate){
    const eur = 1/rate
}
function USDtoEUR(){

}

exports.exchange = (input, rate, baseCurrency) =>{
    // const curr = baseCurrency.slice(2)
    const curr = baseCurrency
    if(curr === 'UAH'){
        return input/rate
    }else if(curr === 'USD'){
        return input*rate
    }else if(curr === 'EUR'){
        return input*rate

    }
}