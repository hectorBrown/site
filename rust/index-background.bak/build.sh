#!/bin/bash
if [[ $1 == "--release" ]]; then
	cargo build --release
	wasm-opt -Oz -o ../../static/wasm/index-background.wasm target/wasm32-unknown-unknown/release/index-background.wasm
else
	cargo build
	cp target/wasm32-unknown-unknown/debug/index-background.wasm ../../static/wasm/index-background.wasm
fi
