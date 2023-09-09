# touma_club

Run unit test:
```
cd ~/lighthouse
python3 -m unittest touma_club.test.flask_test
```

to only run a specific test, you can do it like:
```
python3 -m unittest touma_club.test.flask_test -k test_index_route
```