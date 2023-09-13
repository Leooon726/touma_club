# touma_club

Run a localhost server:
```
cd touma_club
./ad4d8a8bcf6d1ca6b5693591f0d9cc96_venv/bin/python3 app.py
```

Run unit test:
```
cd touma_club
python3 -m unittest test.flask_test
```

to only run a specific test, you can do it like:
```
python3 -m unittest test.flask_test -k test_index_route
```