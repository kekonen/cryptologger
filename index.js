const ccxt = require('ccxt')

class TradesContainer{
    constructor(exchange, ticker){
        this.exchange = exchange
        this.ticker = ticker

        this.container = []
    }

    async fetch() {
        const since = this.exchange.milliseconds() - 86400000
        const trades = await exchange.fetchTrades(this.ticker, since, 100)

        trades.forEach(trage => {

        })

    }
}

class TradesStore{
    constructor(exchangeCurrencies){
        this.store = {}
        // exchangeCurrencies = {'poloniex': ['BTC/USDT', 'ETH/USDT'] }

        Object.keys(exchangeCurrencies).forEach(exchange => {
            this.store[exchange] = Object.assign({}, ...exchangeCurrencies[exchange].map(currency => ({[currency]: []})))
        })
    }


}



const main = async () => {
    let kraken    = new ccxt.kraken()
    let bitfinex  = new ccxt.bitfinex() //{ verbose: true }
    let poloniex  = new ccxt.poloniex()
    let binance   = new ccxt.binance()
    let bittrex   = new ccxt.bittrex()

    const exchangeId2exchange = Object.assign({}, ...[kraken, bitfinex, poloniex, binance, bittrex].map(exchange => ({[exchange.id]: exchange})))

    const exchangeCurrencyPairsPairs = {
        'bitfinex': ['BTC/USDT'],
        'kraken':   ['BTC/USD'],
        'poloniex': ['BTC/USDT'],
        'binance':  ['BTC/USDT'],
        'bittrex':  ['BTC/USDT'],
    }

    const container = new TradesStore(exchangeCurrencyPairsPairs)
    // let okcoinusd = new ccxt.okcoinusd ({
    //     apiKey: 'YOUR_PUBLIC_API_KEY',
    //     secret: 'YOUR_SECRET_PRIVATE_KEY',
    // })

    // const exchangeId = 'binance'
    //     , exchangeClass = ccxt[exchangeId]
    //     , exchange = new exchangeClass ({
    //         'apiKey': 'YOUR_API_KEY',
    //         'secret': 'YOUR_SECRET',
    //         'timeout': 30000,
    //         'enableRateLimit': true,
    //     })

    // console.log (kraken.id,    await kraken.loadMarkets())
    // console.log (bitfinex.id,  await bitfinex.loadMarkets ())
    // console.log (poloniex.id,  await poloniex.loadMarkets ())
    // console.log (binance.id,  await binance.loadMarkets ())
    // console.log (bittrex.id,  await bittrex.loadMarkets ())

    console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USDT'))
    console.log (kraken.id,  await kraken.fetchTicker ('BTC/USD'))
    console.log (poloniex.id,  await poloniex.fetchTicker ('BTC/USDT'))
    console.log (binance.id,  await binance.fetchTicker ('BTC/USDT'))
    console.log (bittrex.id,  await bittrex.fetchTicker ('BTC/USDT'))

    // console.log ("ticker",  await binance.fetchTicker ('BTC/USDT'))
    // console.log ('orderBook',  await binance.fetchOrderBook ('BTC/USDT'))
    // console.log (`trades`,  await binance.fetchTrades ('BTC/USDT'))

    // console.log (bitfinex.id,  await bitfinex.fetchOrderBook ('BTC/USDT'))
    // console.log (kraken.id,  await kraken.fetchOrderBook ('BTC/USD'))
    // console.log (poloniex.id,  await poloniex.fetchOrderBook ('BTC/USDT'))
    // console.log (binance.id,  await binance.fetchOrderBook ('BTC/USDT'))
    // console.log (bittrex.id,  await bittrex.fetchOrderBook ('BTC/USDT'))

    const exchTicker = [
        [bitfinex, 'BTC/USDT'],
        [kraken, 'BTC/USD'],
        [poloniex, 'BTC/USDT'],
        [binance, 'BTC/USDT'],
        [bittrex, 'BTC/USDT'],
    ]

    const getTrades = async (exchangeTickerPairs) => {
        const exchangeTickerPairsData = exchangeTickerPairs.map(([exchange, ticker]) => {
            // console.log(exchange.id, ticker)
            const since = exchange.milliseconds() - 86400000
            return exchange.fetchTrades(ticker, since, 100)
        })

        return await Promise.all(exchangeTickerPairsData)
        // .then(data => {
        //     console.log(data)
        //     return data
        // })
    }
    // const trades = await getTrades(exchTicker)
    // console.log(bitfinex.id, trades[0][0])
    // console.log(kraken.id, trades[1][0])
    // console.log(poloniex.id, trades[2][0])
    // console.log(binance.id, trades[3][0])
    // console.log(bittrex.id, trades[4][0])


    

    // const since_bitfinex = bitfinex.milliseconds () - 86400000
    // console.log (bitfinex.id, since_bitfinex,  (await bitfinex.fetchTrades ('BTC/USDT', since_bitfinex, 100))[0])
    // const since_kraken = kraken.milliseconds () - 86400000    
    // console.log (kraken.id, since_kraken,  (await kraken.fetchTrades ('BTC/USD', since_kraken, 100))[0])
    // const since_poloniex = poloniex.milliseconds () - 86400000
    // console.log (poloniex.id, since_poloniex,  (await poloniex.fetchTrades ('BTC/USDT', since_poloniex, 100))[0])
    // const since_binance = binance.milliseconds () - 86400000
    // console.log (binance.id, since_binance,  (await binance.fetchTrades ('BTC/USDT', since_binance, 100))[0])
    // const since_bittrex = bittrex.milliseconds () - 86400000
    // console.log (bittrex.id, since_bittrex,  (await bittrex.fetchTrades ('BTC/USDT', since_bittrex, 100))[0])


    // console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
    // console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
    // console.log (huobi.id,     await huobi.fetchTrades ('ETH/CNY'))

    // console.log (okcoinusd.id, await okcoinusd.fetchBalance ())

    // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
    // console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))

    // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
    // console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

    // pass/redefine custom exchange-specific order params: type, amount, price or whatever
    // use a custom order type
    // bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

}

(async() => await main())()