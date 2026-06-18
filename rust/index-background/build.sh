#!/bin/bash
cd ..
if [[ $1 == "--release" ]]; then
  wasm-pack build --release --target web index-background
else
  wasm-pack build --target web index-background
fi
cd index-background || exit 1
rm -r ../../static/wasm/index-background/
cp -r pkg ../../static/wasm/index-background/
