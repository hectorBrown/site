#!/bin/bash
cd ..
if [[ $1 == "--release" ]]; then
	wasm-pack build --target web --release index-background
else
	wasm-pack build --target web index-background
fi
cd index-background || exit 1
rm -r ../../static/wasm/index-background/
cp -r pkg ../../static/wasm/index-background/
