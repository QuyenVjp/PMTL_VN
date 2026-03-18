#!/bin/sh
set -eu

config_input="/etc/alertmanager/alertmanager.yml"
config_output="/tmp/alertmanager.yml"

sed \
  -e "s|\${ALERT_TELEGRAM_BOT_TOKEN}|${ALERT_TELEGRAM_BOT_TOKEN:-}|g" \
  -e "s|\${ALERT_TELEGRAM_CHAT_ID}|${ALERT_TELEGRAM_CHAT_ID:-}|g" \
  "$config_input" > "$config_output"

exec /bin/alertmanager --config.file="$config_output"
