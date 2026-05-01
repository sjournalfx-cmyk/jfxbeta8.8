import MetaTrader5 as mt5
import json
import sys

initialized = False

def init_mt5():
    global initialized
    if not initialized:
        if not mt5.initialize():
            print(json.dumps({"error": str(mt5.last_error())}))
            sys.exit()
        initialized = True

if len(sys.argv) <= 1:
    init_mt5()
    account = mt5.account_info()
    if account is None:
        print(json.dumps({"error": "Not connected to MT5"}))
        sys.exit()
    print(json.dumps({
        "login": account.login,
        "server": account.server,
        "balance": account.balance,
        "equity": account.equity,
        "margin": account.margin,
        "free_margin": account.margin_free,
        "profit": account.profit,
        "currency": account.currency
    }))
elif sys.argv[1] == 'status':
    init_mt5()
    account = mt5.account_info()
    if account is None:
        print(json.dumps({"error": "Not connected"}))
        sys.exit()
    print(json.dumps({
        "connected": True,
        "login": account.login,
        "server": account.server,
        "balance": account.balance,
        "equity": account.equity,
        "margin": account.margin,
        "free_margin": account.margin_free,
        "profit": account.profit
    }))
elif sys.argv[1] == 'positions':
    init_mt5()
    positions = mt5.positions_get()
    if positions is None:
        print(json.dumps({"positions": []}))
        sys.exit()
    positions_data = []
    for pos in positions:
        positions_data.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": "SELL" if pos.type == 1 else "BUY",
            "volume": pos.volume,
            "price_open": pos.price_open,
            "price_current": pos.price_current,
            "profit": pos.profit,
            "sl": pos.sl,
            "tp": pos.tp,
            "magic": pos.magic,
            "comment": pos.comment or "",
            "time": pos.time
        })
    print(json.dumps({"positions": positions_data}))
elif sys.argv[1] == 'open':
    init_mt5()
    symbol = sys.argv[2] if len(sys.argv) > 2 else None
    volume = float(sys.argv[3]) if len(sys.argv) > 3 else 0.01
    direction = sys.argv[4].upper() if len(sys.argv) > 4 else "BUY"
    sl = float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] != "0" else 0
    tp = float(sys.argv[6]) if len(sys.argv) > 6 and sys.argv[6] != "0" else 0

    if not symbol:
        print(json.dumps({"error": "Symbol required"}))
        sys.exit()

    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(json.dumps({"error": f"Symbol {symbol} not found"}))
        sys.exit()

    if not symbol_info.visible:
        mt5.symbol_select(symbol, True)

    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        print(json.dumps({"error": f"Cannot get tick for {symbol}"}))
        sys.exit()

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": mt5.ORDER_TYPE_BUY if direction == "BUY" else mt5.ORDER_TYPE_SELL,
        "price": tick.ask if direction == "BUY" else tick.bid,
        "deviation": 100,
        "magic": 234000,
        "comment": "JournalFX",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_FOK,
    }

    if sl > 0:
        request["sl"] = sl
    if tp > 0:
        request["tp"] = tp

    result = mt5.order_send(request)

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(json.dumps({
            "error": f"Order failed: {result.retcode}",
            "details": result.comment
        }))
    else:
        print(json.dumps({
            "success": True,
            "order": result.order,
            "price": result.price,
            "volume": result.volume
        }))
elif sys.argv[1] == 'close':
    init_mt5()
    ticket = int(sys.argv[2]) if len(sys.argv) > 2 else None

    if not ticket:
        print(json.dumps({"error": "Ticket required"}))
        sys.exit()

    positions = mt5.positions_get(ticket=ticket)
    if positions is None or len(positions) == 0:
        print(json.dumps({"error": "Position not found"}))
        sys.exit()

    pos = positions[0]
    tick = mt5.symbol_info_tick(pos.symbol)
    if tick is None:
        print(json.dumps({"error": f"Cannot get tick for {pos.symbol}"}))
        sys.exit()

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": pos.symbol,
        "volume": pos.volume,
        "type": mt5.ORDER_TYPE_SELL if pos.type == 0 else mt5.ORDER_TYPE_BUY,
        "price": tick.bid if pos.type == 0 else tick.ask,
        "deviation": 100,
        "comment": "JournalFX",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_FOK,
    }

    result = mt5.order_send(request)

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(json.dumps({
            "error": f"Close failed: {result.retcode}",
            "details": result.comment
        }))
    else:
        print(json.dumps({
            "success": True,
            "ticket": ticket,
            "order": result.order,
            "price": result.price
        }))