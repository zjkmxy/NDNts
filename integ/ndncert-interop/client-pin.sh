#!/bin/bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"/../..

msg() {
  echo -ne "\e[35m[ndncert-interop] \e[94m"
  echo -n "$*"
  echo -e "\e[0m"
}

KCCLI="bash $(pwd)/packages/keychain-cli/ndnts-keychain.sh"

DIR=/tmp/$(openssl rand -hex 8)
[[ -d $DIR ]] && rm -rf $DIR
msg Using temporary directory "$DIR"

CLEANUP_PIDS=()
cleanup() {
  msg Performing cleanups
  for PID in "${CLEANUP_PIDS[@]}"; do
    kill $PID || true
  done
  [[ -d $DIR ]] && rm -rf $DIR
}
trap cleanup EXIT

# start ndncert-ca-server
PREFIX=/ndncert-$(openssl rand -hex 8)
msg Generating CA key $PREFIX
env HOME=$DIR/ca-home ndnsec key-gen $PREFIX
jq -n --arg PREFIX $PREFIX '{
  "ca-prefix": $PREFIX,
  "max-validity-period": 86400,
  "supported-challenges": [{ challenge: "pin" }]
}' >$DIR/ca.conf
msg Starting CA
env HOME=$DIR/ca-home ndncert-ca-server -c $DIR/ca.conf &
CLEANUP_PIDS+=($!)

# retrieve and view CA profile
sleep 3
msg Retrieving CA profile
ndnpeek -Pf $PREFIX/CA/INFO >$DIR/ca.profile
$KCCLI ndncert03-show-profile --profile $DIR/ca.profile

# retrieve PIN code from CA status and pass to client
mkfifo $DIR/client-input.pipe
(
  sleep 3
  env HOME=$DIR/ca-home ndncert-ca-status $PREFIX 2>&1 | tee /dev/stderr |
    awk '$1=="\"code\":" { gsub(/"/,"",$2); printf "%s",$2 }'
) >$DIR/client-input.pipe &
CLEANUP_PIDS+=($!)

# generate key and request certificate
export NDNTS_KEYCHAIN=$DIR/client-keychain
msg Generating client key
$KCCLI gen-key $PREFIX/client-$(openssl rand -hex 8) | tee $DIR/client-selfsigned.txt
msg Running client
$KCCLI ndncert03-client --profile $DIR/ca.profile \
  --key $(cat $DIR/client-selfsigned.txt) --challenge pin --pin-named-pipe $DIR/client-input.pipe |
  tee $DIR/client-cert.txt

# view obtained certificate
msg Viewing issued certificate
$KCCLI show-cert $(cat $DIR/client-cert.txt) | base64 -d | ndn-dissect
