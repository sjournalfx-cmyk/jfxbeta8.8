import MetaTrader5 as mt5
import json
import sys

if not mt5.initialize():
    print(json.dumps({"error": str(mt5.last_error())}))
    sys.exit()

account_info = mt5.account_info()
if account_info is None:
    print(json.dumps({"error": "Failed to get account info"}))
    mt5.shutdown()
    sys.exit()

print(json.dumps({
    "login": account_info.login,
    "server": account_info.server,
    "balance": account_info.balance,
    "equity": account_info.equity,
    "margin": account_info.margin,
    "free_margin": account_info.margin_free,
    "profit": account_info.profit,
    "currency": account_info.currency,
    "company": account_info.company,
    "name": account_info.name,
    "trade_allowed": account_info.trade_allowed,
    "trade_expert": account_info.trade_expert
}))

mt5.shutdown()