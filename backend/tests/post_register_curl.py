import requests

r = requests.post('http://127.0.0.1:8000/auth/register', json={
    "username":"testcurl",
    "email":"testcurl+1@example.com",
    "password":"hunter2abc",
    "role":"participant"
})
print(r.status_code)
print(r.headers)
print(r.text)
