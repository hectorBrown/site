#!/bin/bash

cargo build
cp target/wasm32-unknown-unknown/debug/index-background.wasm ../../static/wasm/index-background.wasm
