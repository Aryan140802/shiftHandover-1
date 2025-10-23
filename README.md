steps to make changes

rm -rf ../staticfiles/static
mv build/static ../staticfiles/static
chmod -R 775 ../staticfiles/*


curl -k -X GET "https://10.191.171.12:5443/EISHOME_TEST/projectRoster/search/?q=aryan&shift=WFO-G2"
