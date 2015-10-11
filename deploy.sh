#!/bin/bash

cp -fr app/* deploy/BrainEdit.app/Contents/Resources/app.nw/

cd deploy/
rm BrainEdit.zip
zip -r BrainEdit.zip BrainEdit.app