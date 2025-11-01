#!/bin/bash

cargo build --release
cp target/wasm32-unknown-unknown/release/index-background.wasm ../../static/wasm/index-background.wasm
