#!/bin/sh
rm -r public/
hugo && rsync -avh public/ hexn.live:/var/www/html/ --delete
