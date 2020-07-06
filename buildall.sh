#! /usr/bin/env bash

echo " ";
echo "starting!";

which npm
which tsc
currentuser=`stat -f "%Su" /dev/console`

cd packages	

echo " ";
echo "step – resource";

cd resource/
rm -f -r dist
# npm install
npm run build
cd ../

echo " ";
echo "step – slate-value";

cd slate-value/
rm -f -r dist
# npm install
npm run build
cd ../

echo " ";
echo "step – resource-service";

cd resource-service/
rm -f -r dist
# npm install
npm run build
cd ../

echo " ";
echo "step – slate-react-resource";

cd slate-react-resource/
rm -f -r dist
# npm install
npm run build
cd ../

echo " ";
echo "done!";