#!/bin/sh
rm -r public/

root=$(pwd)
for dir in rust/*; do
	cd "$dir" || exit
	./build.sh --release
done
cd "$root" || exit
hugo && rsync -avh public/ pi:/home/hex/site/content --delete
