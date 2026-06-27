#!/bin/sh
rm -r public/

hugo && rsync -avh public/ pi-01:/home/hex/site/content --delete
