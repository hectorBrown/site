#!/bin/sh
hugo && rsync -avh public/ hexn.live:/var/www/html/ --delete
