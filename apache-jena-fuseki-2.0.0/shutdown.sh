#!/bin/sh
pid=`cat run/system/tdb.lock`
kill -9 $pid

