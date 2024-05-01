#!/bin/sh
rm -r public/
hugo && rsync -avh public/ pi:/home/hex/site/content --delete
