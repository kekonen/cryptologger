const ccxt = require('ccxt')
const sa = require('superagent')
const storeurl = 'http://localhost:8000'

var wait = async (seconds, silent = true) => {
    var i = 0;
    var timerId = setInterval(() => {
        i += 1;
    }, 1000)

    var prom = new Promise((resolve, reject) => {
        setTimeout(() => {
            clearInterval(timerId);
            resolve('done')
        }, seconds * 1000);
    })

    return prom
}

const kraken    = new ccxt.kraken()
const bitfinex  = new ccxt.bitfinex() //{ verbose: true }
const poloniex  = new ccxt.poloniex()
const binance   = new ccxt.binance()
const bittrex   = new ccxt.bittrex()


const exchangeId2exchange = Object.assign({}, ...[kraken, bitfinex, poloniex, binance, bittrex].map(exchange => ({[exchange.id]: exchange})))

const dictionary = {
    'BTCUSD': 'BTCUSDT'
}
const t = (st) => {
    if (st in dictionary) return dictionary[st]
    else return st
}

class TradesContainer{
    constructor(exchange, ticker){
        this.exchange = exchange
        this.ticker = ticker

        this.container = []
    }

    async fetch() {
        const since = this.exchange.milliseconds() - 86400000
        var trades = await this.exchange.fetchTrades(this.ticker, since, 100)

        // trades = trades.map(trade => ({
        //     side: trade.side == 'sell'?true:false,
        //     price: trade.price,
        //     amount: trade.amount,
        //     ts: trade.timestamp,
        //     id: trade.id?parseInt(trade.id):0
        // }))

        // trades.forEach(trade => {
        //     console.log('trade', trade)
        // })

        // console.log(this.exchange.id, this.ticker.replace(/\//, ''), trades)
        await sa.post(`${storeurl}/trades/${this.exchange.id}/${t(this.ticker.replace(/\//, ''))}`).send({trades: trades.map(trade => ({
            side: trade.side == 'sell'?true:false,
            price: trade.price,
            amount: trade.amount,
            ts: trade.timestamp,
            id: trade.id?parseInt(trade.id):0
        }))})

    }
}

class TradesStore{
    constructor(exchangeCurrencies){
        this.store = {}
        this.exchangeCurrencies = exchangeCurrencies
        // exchangeCurrencies = {'poloniex': ['BTC/USDT', 'ETH/USDT'] }

        Object.keys(exchangeCurrencies).forEach(exchange => {
            this.store[exchange] = Object.assign({}, ...exchangeCurrencies[exchange].map(currency => ({[currency]: new TradesContainer(exchangeId2exchange[exchange], currency)})))
        })
    }

    async fetch() {
        Object.keys(this.store).forEach( async (exchange) => {
            // console.log('exchange:', this.store[exchange])
            Object.keys(this.store[exchange]).forEach(async (ticker) => {
                await this.store[exchange][ticker].fetch()
            })
        })
    }
}


class OrdersContainer{
    constructor(exchange, ticker){
        this.exchange = exchange
        this.ticker = ticker

        this.container = []
    }

    async fetch() {
        // const since = this.exchange.milliseconds() - 86400000
        var orders = await this.exchange.fetchOrderBook(this.ticker, 100)

        console.log(this.exchange.id, this.ticker.replace(/\//, ''), orders)
        await sa.post(`${storeurl}/orders/${this.exchange.id}/${t(this.ticker.replace(/\//, ''))}`).send({
            ts: orders.timestamp? orders.timestamp: (new Date()).getTime(),
            bids: orders.bids,
            asks: orders.asks
        })

    }
}

class OrdersStore{
    constructor(exchangeCurrencies){
        this.store = {}
        this.exchangeCurrencies = exchangeCurrencies
        // exchangeCurrencies = {'poloniex': ['BTC/USDT', 'ETH/USDT'] }

        Object.keys(exchangeCurrencies).forEach(exchange => {
            this.store[exchange] = Object.assign({}, ...exchangeCurrencies[exchange].map(currency => ({[currency]: new OrdersContainer(exchangeId2exchange[exchange], currency)})))
        })
    }

    async fetch() {
        Object.keys(this.store).forEach( async (exchange) => {
            // console.log('exchange:', this.store[exchange])
            Object.keys(this.store[exchange]).forEach(async (ticker) => {
                await this.store[exchange][ticker].fetch()
            })
        })
    }
}




class TickerContainer{
    constructor(exchange, ticker){
        this.exchange = exchange
        this.ticker = ticker

        this.container = []
    }

    async fetch() {
        // const since = this.exchange.milliseconds() - 86400000
        var ticker = await this.exchange.fetchTicker(this.ticker)

        console.log(this.exchange.id, this.ticker.replace(/\//, ''), ticker)
        await sa.post(`${storeurl}/ticker/${this.exchange.id}`).send({
            ts: Math.ceil(ticker.timestamp),
            symbol: t(ticker.symbol.replace(/\//, '')),
            high: ticker.high,
            low: ticker.low,
            bid: ticker.bid,
            ask: ticker.ask,
            open: ticker.open?ticker.open:ticker.close,
            close: ticker.close,
            last: ticker.last,
        })

    }
}

class TickerStore{
    constructor(exchangeCurrencies){
        this.store = {}
        this.exchangeCurrencies = exchangeCurrencies
        // exchangeCurrencies = {'poloniex': ['BTC/USDT', 'ETH/USDT'] }

        Object.keys(exchangeCurrencies).forEach(exchange => {
            this.store[exchange] = Object.assign({}, ...exchangeCurrencies[exchange].map(currency => ({[currency]: new TickerContainer(exchangeId2exchange[exchange], currency)})))
        })
    }

    async fetch() {
        Object.keys(this.store).forEach( async (exchange) => {
            // console.log('exchange:', this.store[exchange])
            Object.keys(this.store[exchange]).forEach(async (ticker) => {
                await this.store[exchange][ticker].fetch()
            })
        })
    }
}

const main = async () => {


    const exchangeCurrencyPairsPairs = {
        'bitfinex': ['BTC/USDT'],
        'kraken':   ['BTC/USD'],
        'poloniex': ['BTC/USDT'],
        'binance':  ['BTC/USDT'],
        'bittrex':  ['BTC/USDT'],
    }

    const tradesContainer = new TradesStore(exchangeCurrencyPairsPairs)
    await tradesContainer.fetch()


    // const tradesContainer = new TradesStore(exchangeCurrencyPairsPairs)
    await wait(5)
    await tradesContainer.fetch()

    await wait(5)
    await tradesContainer.fetch()

    await wait(5)
    await tradesContainer.fetch()

    // const ordersContainer = new OrdersStore(exchangeCurrencyPairsPairs)
    // await ordersContainer.fetch()

    // const tickerContainer = new TickerStore(exchangeCurrencyPairsPairs)
    // await tickerContainer.fetch()

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

    // console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USDT'))
    // console.log (kraken.id,  await kraken.fetchTicker ('BTC/USD'))
    // console.log (poloniex.id,  await poloniex.fetchTicker ('BTC/USDT'))
    // console.log (binance.id,  await binance.fetchTicker ('BTC/USDT'))
    // console.log (bittrex.id,  await bittrex.fetchTicker ('BTC/USDT'))

    // console.log ("ticker",  await binance.fetchTicker ('BTC/USDT'))
    // console.log ('orderBook',  await binance.fetchOrderBook ('BTC/USDT'))
    // console.log (`trades`,  await binance.fetchTrades ('BTC/USDT'))

    console.log (bitfinex.id,  (await bitfinex.fetchOrderBook ('BTC/USDT', 100)).asks.length)
    console.log (kraken.id,  (await kraken.fetchOrderBook ('BTC/USD', 100)).asks.length)
    console.log (poloniex.id,  (await poloniex.fetchOrderBook ('BTC/USDT', 100)).asks.length)
    console.log (binance.id,  (await binance.fetchOrderBook ('BTC/USDT', 100)).asks.length)
    console.log (bittrex.id,  (await bittrex.fetchOrderBook ('BTC/USDT', 100)).asks.length)

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