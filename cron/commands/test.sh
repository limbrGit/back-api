echo -n '{"timestamp":"'$(date +%Y-%m-%dT%H:%M:%S)'", "response":' >>"/cron/logs/$(date +%Y-%m-%d)-account-api_test.log"
wget -q -O - 'http://localhost:8080' >>"/cron/logs/$(date +%Y-%m-%d)-account-api_test.log"
echo "}" >>"/cron/logs/$(date +%Y-%m-%d)-account-api_test.log"
