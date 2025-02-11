- user

  - id
  - name
  - email
  - phone
  - group_id

- contact

  - id
  - name
  - email
  - phone
  - book_title

- group
  - id
  - name

group has many users

group (group)

- id = 1
- name = first group

bob (user)

- id = 100
- name = bob
- phone = 123123123
- email = bob@bob.com
- groupd_id = 1

bob2 (user)

- id = 101
- name = bob
- phone = 123123123
- email = bob@bob.com
- groupd_id = 1

joe (contact)

- id = 500
- name = joe
- email = joe@joe.com
- phone = 12312451234
- book_title = hello world
- group_id = 1
- contact_id = 1

contact has a single group_id

BOB has logged in, user_id is "1"
Get all contacts that has contact_id of "1"
which is BOB
